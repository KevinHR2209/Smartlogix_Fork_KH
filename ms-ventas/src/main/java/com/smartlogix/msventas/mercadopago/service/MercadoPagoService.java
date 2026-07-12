package com.smartlogix.msventas.mercadopago.service;

import com.smartlogix.msventas.mercadopago.client.MercadoPagoClient;
import com.smartlogix.msventas.mercadopago.dto.MercadoPagoDto.BackUrls;
import com.smartlogix.msventas.mercadopago.dto.MercadoPagoDto.ItemRequest;
import com.smartlogix.msventas.mercadopago.dto.MercadoPagoDto.PagoResponse;
import com.smartlogix.msventas.mercadopago.dto.MercadoPagoDto.PreferenciaRequest;
import com.smartlogix.msventas.mercadopago.dto.MercadoPagoDto.PreferenciaResponse;
import com.smartlogix.msventas.model.DetallePedido;
import com.smartlogix.msventas.model.Pago;
import com.smartlogix.msventas.model.Pedido;
import com.smartlogix.msventas.repository.PagoRepository;
import com.smartlogix.msventas.service.PedidoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Orquesta la integracion con Mercado Pago. A proposito NO duplica la logica
 * de descuento de stock ni de creacion de despacho: eso ya existe en
 * PedidoService (procesarPagoExitoso / cancelarPedidoYLiberarStock) y esta
 * clase simplemente la dispara cuando Mercado Pago confirma o rechaza un pago.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MercadoPagoService {

    private final MercadoPagoClient mercadoPagoClient;
    private final PedidoService pedidoService;
    private final PagoRepository pagoRepository;

    @Value("${mercadopago.back-url-success:http://localhost:3000/pago/exito}")
    private String backUrlSuccess;

    @Value("${mercadopago.back-url-failure:http://localhost:3000/pago/error}")
    private String backUrlFailure;

    @Value("${mercadopago.back-url-pending:http://localhost:3000/pago/pendiente}")
    private String backUrlPending;

    @Value("${mercadopago.notification-url:}")
    private String notificationUrl;

    /**
     * Crea una preferencia de pago en Mercado Pago para un pedido existente
     * (debe estar en estado PENDIENTE_PAGO, que es el estado con el que
     * PedidoService.crear ya lo deja) y registra un Pago local en estado
     * "pendiente" con el id de la preferencia como token_transaccion.
     */
    @Transactional
    public PreferenciaResponse iniciarPago(Long idPedido) {
        Pedido pedido = pedidoService.buscarPorId(idPedido);

        if (!"PENDIENTE_PAGO".equals(pedido.getEstadoPedido())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El pedido " + idPedido + " no esta pendiente de pago. Estado actual: "
                            + pedido.getEstadoPedido());
        }

        List<DetallePedido> detalles = pedido.getDetalles();
        if (detalles == null || detalles.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "El pedido " + idPedido + " no tiene detalles, no se puede iniciar el pago");
        }

        List<ItemRequest> items = detalles.stream()
                .map(d -> new ItemRequest(
                        String.valueOf(d.getIdPresentacion()),
                        "Presentacion " + d.getIdPresentacion(),
                        d.getCantidad(),
                        BigDecimal.valueOf(d.getPrecioUnitarioSnapshot()),
                        "CLP"
                ))
                .toList();

        PreferenciaRequest request = new PreferenciaRequest(
                items,
                new BackUrls(backUrlSuccess, backUrlFailure, backUrlPending),
                notificationUrl.isBlank() ? null : notificationUrl,
                "pedido-" + idPedido
        );

        PreferenciaResponse preferencia = mercadoPagoClient.crearPreferencia(request);

        Pago pago = Pago.builder()
                .pedido(pedido)
                .montoTransaccion(pedido.getMontoTotal().intValue())
                .metodoPago("mercadopago")
                .estadoPago("pendiente")
                .fechaPago(OffsetDateTime.now())
                .tokenTransaccion(preferencia.id())
                .build();
        pagoRepository.save(pago);

        return preferencia;
    }

    /**
     * Procesa una notificacion webhook de Mercado Pago: consulta el pago
     * real en la API de Mercado Pago (nunca se confia en el estado que
     * venga en el cuerpo del webhook) y dispara la orquestacion existente
     * de PedidoService segun el resultado.
     */
    @Transactional
    public void procesarNotificacionPago(String idPagoMercadoPago) {
        PagoResponse pagoMp = mercadoPagoClient.obtenerPago(idPagoMercadoPago);

        Long idPedido = extraerIdPedido(pagoMp.externalReference());
        // Verifica que el pedido exista (lanza 404 si no) antes de tocar nada
        pedidoService.buscarPorId(idPedido);

        Pago pago = pagoRepository.findFirstByPedido_IdPedidoOrderByFechaPagoDesc(idPedido)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No hay un registro de Pago local para el pedido " + idPedido));

        String estadoLocal = mapearEstado(pagoMp.status());
        pago.setEstadoPago(estadoLocal);
        pago.setTokenTransaccion(String.valueOf(pagoMp.id()));
        pago.setFechaPago(OffsetDateTime.now());
        pagoRepository.save(pago);

        if ("aprobado".equals(estadoLocal)) {
            // Reutiliza la orquestacion existente: descuenta stock definitivo,
            // obtiene direccion del cliente, crea el despacho, marca PAGADO
            pedidoService.procesarPagoExitoso(idPedido);
            log.info("Pago aprobado por Mercado Pago para el pedido {}, orquestacion disparada", idPedido);
        } else if ("rechazado".equals(estadoLocal) || "cancelado".equals(estadoLocal)) {
            // Reutiliza la transaccion compensatoria existente: libera stock
            // reservado y marca CANCELADO (solo si seguia PENDIENTE_PAGO)
            pedidoService.cancelarPedidoYLiberarStock(idPedido);
            log.info("Pago rechazado/cancelado por Mercado Pago para el pedido {}, stock liberado", idPedido);
        }
    }

    /**
     * Consulta el estado del ultimo pago registrado localmente para un
     * pedido. Util para polling desde un frontend de prueba sin depender
     * de que el webhook ya haya llegado.
     */
    public Pago consultarEstado(Long idPedido) {
        return pagoRepository.findFirstByPedido_IdPedidoOrderByFechaPagoDesc(idPedido)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No hay pagos registrados para el pedido " + idPedido));
    }

    /**
     * Mapea los estados de Mercado Pago (approved, rejected, pending,
     * in_process, cancelled, refunded, charged_back) a los estados locales
     * usados en la columna estado_pago.
     */
    private String mapearEstado(String estadoMp) {
        return switch (estadoMp) {
            case "approved" -> "aprobado";
            case "rejected" -> "rechazado";
            case "cancelled" -> "cancelado";
            case "refunded", "charged_back" -> "reembolsado";
            case "in_process", "pending" -> "pendiente";
            default -> "pendiente";
        };
    }

    private Long extraerIdPedido(String externalReference) {
        if (externalReference == null || !externalReference.startsWith("pedido-")) {
            throw new ResponseStatusException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "external_reference invalido o ausente en el pago de Mercado Pago: "
                            + externalReference);
        }
        try {
            return Long.parseLong(externalReference.substring("pedido-".length()));
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "external_reference con formato invalido: " + externalReference);
        }
    }
}
