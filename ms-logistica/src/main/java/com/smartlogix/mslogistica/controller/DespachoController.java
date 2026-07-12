package com.smartlogix.mslogistica.controller;

import com.smartlogix.mslogistica.dto.DespachoRequest;
import com.smartlogix.mslogistica.dto.DespachoResponse;
import com.smartlogix.mslogistica.dto.WebhookCourierRequest;
import com.smartlogix.mslogistica.service.DespachoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/despachos")
@RequiredArgsConstructor
public class DespachoController {

    private final DespachoService service;

    @GetMapping
    public ResponseEntity<List<DespachoResponse>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DespachoResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @GetMapping("/pedido/{idPedido}")
    public ResponseEntity<DespachoResponse> obtenerPorPedido(@PathVariable Long idPedido) {
        return ResponseEntity.ok(service.buscarPorIdPedido(idPedido));
    }

    @PostMapping
    public ResponseEntity<DespachoResponse> crear(@Valid @RequestBody DespachoRequest request) {
        return ResponseEntity.status(201).body(service.crear(request));
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<DespachoResponse> cambiarEstado(@PathVariable Long id, @RequestParam String estado) {
        return ResponseEntity.ok(service.cambiarEstado(id, estado));
    }

    // ENDPOINT PARA EL COURIER EXTERNO
    @PostMapping("/webhook/actualizacion-estado")
    public ResponseEntity<String> recibirWebhookCourier(@RequestBody WebhookCourierRequest request) {
        service.procesarWebhook(request);
        return ResponseEntity.ok("Webhook procesado correctamente");
    }
}