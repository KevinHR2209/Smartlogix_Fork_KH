package com.smartlogix.inventario.controller;

import com.smartlogix.inventario.dto.*;
import com.smartlogix.inventario.service.InventarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventario")
@RequiredArgsConstructor
public class InventarioController {

    private final InventarioService inventarioService;

    @GetMapping("/{id}")
    public ResponseEntity<InventarioResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(inventarioService.buscarPorId(id));
    }

    @GetMapping("/presentacion/{idPresentacion}")
    public ResponseEntity<List<InventarioResponse>> listarPorPresentacion(
            @PathVariable Long idPresentacion) {
        return ResponseEntity.ok(inventarioService.listarPorPresentacion(idPresentacion));
    }

    @GetMapping("/bodega/{idBodega}")
    public ResponseEntity<List<InventarioResponse>> listarPorBodega(
            @PathVariable Integer idBodega) {
        return ResponseEntity.ok(inventarioService.listarPorBodega(idBodega));
    }

    @PostMapping
    public ResponseEntity<InventarioResponse> crear(
            @Valid @RequestBody InventarioRequest request) {
        return ResponseEntity.status(201).body(inventarioService.crear(request));
    }

    @PutMapping("/{id}/ajustar")
    public ResponseEntity<InventarioResponse> ajustarStock(
            @PathVariable Long id,
            @Valid @RequestBody AjusteStockRequest request) {
        return ResponseEntity.ok(inventarioService.ajustarStock(id, request));
    }

    @PutMapping("/{id}/reservar")
    public ResponseEntity<InventarioResponse> reservarStock(
            @PathVariable Long id,
            @Valid @RequestBody CantidadRequest request) {
        return ResponseEntity.ok(inventarioService.reservarStock(id, request));
    }

    @PutMapping("/{id}/liberar")
    public ResponseEntity<InventarioResponse> liberarReserva(
            @PathVariable Long id,
            @Valid @RequestBody CantidadRequest request) {
        return ResponseEntity.ok(inventarioService.liberarReserva(id, request));
    }

    @PutMapping("/{id}/descontar")
    public ResponseEntity<InventarioResponse> descontarStockReservado(
            @PathVariable Long id,
            @Valid @RequestBody CantidadRequest request) {
        return ResponseEntity.ok(inventarioService.descontarStockReservado(id, request));
    }

    @PutMapping("/transferir")
    public ResponseEntity<Void> transferirStock(
            @Valid @RequestBody TransferenciaStockRequest request) {
        inventarioService.transferirStock(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/movimientos/presentacion/{idPresentacion}")
    public ResponseEntity<List<MovimientoResponse>> listarMovimientos(
            @PathVariable Long idPresentacion) {
        return ResponseEntity.ok(inventarioService.listarMovimientosPorPresentacion(idPresentacion));
    }
}