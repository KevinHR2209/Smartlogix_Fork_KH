package com.smartlogix.msventas.controller;

import com.smartlogix.msventas.model.Pago;
import com.smartlogix.msventas.service.PagoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
public class PagoController {

    private final PagoService pagoService;

    @GetMapping
    public List<Pago> listar() {
        return pagoService.listar();
    }

    @PostMapping
    public ResponseEntity<Pago> registrar(
            @RequestHeader("Authorization") String token,
            @RequestBody Pago pago) {
        return ResponseEntity.status(201).body(pagoService.registrar(token, pago));
    }

    @PostMapping("/fallido/{idPedido}")
    public ResponseEntity<String> registrarPagoFallido(
            @RequestHeader("Authorization") String token,
            @PathVariable Long idPedido) {
        pagoService.cancelarPorPagoFallido(token, idPedido);
        return ResponseEntity.ok("El pedido ha sido cancelado y el stock fue liberado con éxito.");
    }
}