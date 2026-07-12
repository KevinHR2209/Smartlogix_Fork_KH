package com.smartlogix.msventas.service;

import com.smartlogix.msventas.client.ClienteClient;
import com.smartlogix.msventas.model.Pago;
import com.smartlogix.msventas.model.Pedido;
import com.smartlogix.msventas.repository.PagoRepository;
import com.smartlogix.msventas.util.TokenUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PagoService {

    private final PagoRepository pagoRepository;
    private final PedidoService pedidoService;
    private final ClienteClient clienteClient;

    public List<Pago> listar() {
        return pagoRepository.findAll();
    }

    @Transactional
    public Pago registrar(String token, Pago pago) {
        // 1. Extraer identidad del token
        String correoAuth = TokenUtils.extraerCorreo(token);
        Long idClienteAuth = clienteClient.obtenerIdClientePorCorreo(correoAuth);

        // 2. Validar que el pago tiene un pedido asociado
        if (pago.getPedido() == null || pago.getPedido().getIdPedido() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El pago debe estar asociado a un pedido válido.");
        }
        Long idPedido = pago.getPedido().getIdPedido();
        Pedido pedido = pedidoService.buscarPorId(idPedido);

        // 3. PROTECCIÓN IDOR
        if (!pedido.getIdCliente().equals(idClienteAuth)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "No puedes registrar un pago para un pedido que no te pertenece.");
        }

        // 4. Completar datos del pago
        if (pago.getFechaPago() == null) {
            pago.setFechaPago(OffsetDateTime.now());
        }
        pago.setEstadoPago("APROBADO");

        // 5. Persistir
        Pago guardado = pagoRepository.save(pago);
        log.info("Pago {} registrado para el pedido {}", guardado.getIdPago(), idPedido);

        // 6. Disparar orquestación (descuento de stock + despacho)
        pedidoService.procesarPagoExitoso(idPedido);

        return guardado;
    }

    @Transactional
    public void cancelarPorPagoFallido(String token, Long idPedido) {
        String correoAuth = TokenUtils.extraerCorreo(token);
        Long idClienteAuth = clienteClient.obtenerIdClientePorCorreo(correoAuth);

        Pedido pedido = pedidoService.buscarPorId(idPedido);

        // PROTECCIÓN IDOR
        if (!pedido.getIdCliente().equals(idClienteAuth)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "No puedes cancelar un pedido que no te pertenece.");
        }

        pedidoService.cancelarPedidoYLiberarStock(idPedido);
    }
}