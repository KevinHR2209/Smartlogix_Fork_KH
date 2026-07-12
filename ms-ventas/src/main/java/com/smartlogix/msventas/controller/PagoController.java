package com.smartlogix.msventas.controller;

import com.smartlogix.msventas.client.ClienteClient;
import com.smartlogix.msventas.model.Pago;
import com.smartlogix.msventas.model.Pedido;
import com.smartlogix.msventas.repository.PagoRepository;
import com.smartlogix.msventas.service.PedidoService;
import com.smartlogix.msventas.util.TokenUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
public class PagoController {

    private final PagoRepository pagoRepository;
    private final PedidoService pedidoService;
    private final ClienteClient clienteClient; // <-- Inyectado directamente

    @GetMapping
    public List<Pago> listar() {
        return pagoRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Pago> registrar(@RequestBody Pago pago) {
        if (pago.getFechaPago() == null) {
            pago.setFechaPago(OffsetDateTime.now());
        }

        pago.setEstadoPago("APROBADO");
        Pago guardado = pagoRepository.save(pago);

        // Disparamos el Descuento real + Logística
        pedidoService.procesarPagoExitoso(pago.getIdPedido());

        return ResponseEntity.status(201).body(guardado);
    }

    // ENDPOINT COMPENSATORIO
    @PostMapping("/fallido/{idPedido}")
    public ResponseEntity<String> registrarPagoFallido(
            @RequestHeader("Authorization") String token,
            @PathVariable Long idPedido) {

        String correoAuth = TokenUtils.extraerCorreo(token);

        // Uso directo del cliente inyectado
        Long idClienteAuth = clienteClient.obtenerIdClientePorCorreo(correoAuth);

        Pedido pedido = pedidoService.buscarPorId(idPedido);

        // PROTECCIÓN IDOR
        if (!pedido.getIdCliente().equals(idClienteAuth)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes cancelar un pedido que no te pertenece.");
        }

        pedidoService.cancelarPedidoYLiberarStock(idPedido);
        return ResponseEntity.ok("El pedido ha sido cancelado y el stock fue liberado con éxito.");
    }
}