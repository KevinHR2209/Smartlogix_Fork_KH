package com.smartlogix.msventas.controller;

import com.smartlogix.msventas.model.Pago;
import com.smartlogix.msventas.repository.PagoRepository;
import com.smartlogix.msventas.service.PedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
public class PagoController {

    private final PagoRepository pagoRepository;
    private final PedidoService pedidoService;

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
    public ResponseEntity<String> registrarPagoFallido(@PathVariable Long idPedido) {
        // Disparamos la compensación para liberar el stock en ms_inventario
        pedidoService.cancelarPedidoYLiberarStock(idPedido);

        return ResponseEntity.ok("El pedido ha sido cancelado y el stock fue liberado con éxito.");
    }
}