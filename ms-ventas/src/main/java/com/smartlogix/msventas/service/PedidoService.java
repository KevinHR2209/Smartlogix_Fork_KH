package com.smartlogix.msventas.service;

import com.smartlogix.msventas.client.ClienteClient;
import com.smartlogix.msventas.client.InventarioClient;
import com.smartlogix.msventas.client.LogisticaClient;
import com.smartlogix.msventas.dto.DetallePedidoRequest;
import com.smartlogix.msventas.dto.PedidoRequest;
import com.smartlogix.msventas.dto.PresentacionResponse;
import com.smartlogix.msventas.model.DetallePedido;
import com.smartlogix.msventas.model.Pedido;
import com.smartlogix.msventas.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final InventarioClient inventarioClient;
    private final ClienteClient clienteClient;
    private final LogisticaClient logisticaClient;

    public List<Pedido> listar() {
        return pedidoRepository.findAll();
    }

    public Pedido buscarPorId(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Pedido con id " + id + " no encontrado"));
    }

    @Transactional
    public Pedido crear(PedidoRequest request) {
        // 1. Validar cliente
        try {
            clienteClient.validarCliente(request.idCliente());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cliente no válido o servicio inaccesible.");
        }

        // 2. Preparar la cabecera del pedido
        Pedido pedido = new Pedido();
        pedido.setIdCliente(request.idCliente());
        pedido.setFechaCreacion(OffsetDateTime.now());
        pedido.setEstadoPedido("PENDIENTE_PAGO");

        int montoTotalCalculado = 0;
        List<DetallePedido> detalles = new ArrayList<>();

        // 3. Procesar detalles de forma segura
        for (DetallePedidoRequest item : request.detalles()) {

            // A. Consultar precio REAL en inventario
            PresentacionResponse presentacion = inventarioClient.obtenerPresentacion(item.idPresentacion());
            int precioReal = presentacion.precioActual().intValue();

            // B. Reservar el stock
            inventarioClient.reservarStock(item.idPresentacion(), item.cantidad());

            // C. Armar el detalle
            DetallePedido detalle = new DetallePedido();
            detalle.setPedido(pedido);
            detalle.setIdPresentacion(item.idPresentacion());
            detalle.setCantidad(item.cantidad());
            detalle.setPrecioUnitarioSnapshot(precioReal);

            detalles.add(detalle);
            montoTotalCalculado += (precioReal * item.cantidad());
        }

        pedido.setDetalles(detalles);
        pedido.setMontoTotal(montoTotalCalculado);

        // 4. Guardar en base de datos
        return pedidoRepository.save(pedido);
    }

    public Pedido cambiarEstado(Long id, String estado) {
        Pedido pedido = buscarPorId(id);
        pedido.setEstadoPedido(estado);
        return pedidoRepository.save(pedido);
    }

    // ── Transacción Compensatoria (Limpiador / Error de pago) ───────────────
    @Transactional
    public void cancelarPedidoYLiberarStock(Long idPedido) {
        Pedido pedido = buscarPorId(idPedido);

        if ("PENDIENTE_PAGO".equals(pedido.getEstadoPedido())) {
            pedido.setEstadoPedido("CANCELADO");
            pedidoRepository.save(pedido);

            if (pedido.getDetalles() != null) {
                for (DetallePedido detalle : pedido.getDetalles()) {
                    try {
                        inventarioClient.liberarStock(detalle.getIdPresentacion(), detalle.getCantidad());
                        log.info("Stock liberado para la presentación {} del pedido {}", detalle.getIdPresentacion(), idPedido);
                    } catch (Exception e) {
                        log.error("Fallo al liberar stock en ms_inventario para presentación {}", detalle.getIdPresentacion(), e);
                    }
                }
            }
        }
    }

    // ── Orquestación de Pago Exitoso ────────────────────────────────────────
    @Transactional
    public void procesarPagoExitoso(Long idPedido) {
        Pedido pedido = buscarPorId(idPedido);

        if (!"PENDIENTE_PAGO".equals(pedido.getEstadoPedido())) {
            throw new IllegalStateException("El pedido " + idPedido + " no está pendiente de pago.");
        }

        // 1. Cambiamos el estado localmente
        pedido.setEstadoPedido("PAGADO");
        pedidoRepository.save(pedido);

        // 2. Rescatar la dirección del cliente desde ms-clientes
        String direccionCompleta = "Dirección no registrada";
        String comuna = "Sin comuna";
        try {
            var direccion = clienteClient.obtenerDireccionPrincipal(pedido.getIdCliente());
            direccionCompleta = direccion.getDireccionCompleta();
            comuna = direccion.comuna();
        } catch (Exception e) {
            log.warn("No se pudo rescatar la dirección para el cliente {}. Se despachará con datos por defecto.", pedido.getIdCliente());
        }

        // 3. Confirmar la venta en ms-inventario y enviar a ms-logistica
        if (pedido.getDetalles() != null) {
            for (DetallePedido detalle : pedido.getDetalles()) {
                try {
                    inventarioClient.descontarStock(detalle.getIdPresentacion(), detalle.getCantidad(), comuna);
                } catch (Exception e) {
                    log.error("Fallo al descontar stock definitivo para presentación {}", detalle.getIdPresentacion(), e);
                }
            }
        }

        // 4. Disparar el despacho
        try {
            logisticaClient.crearDespacho(pedido.getIdPedido(), direccionCompleta, comuna);
            log.info("Despacho creado exitosamente en ms-logistica para el pedido {}", idPedido);
        } catch (Exception e) {
            log.error("Fallo al crear el despacho en logística para el pedido {}", idPedido, e);
        }
    }
}