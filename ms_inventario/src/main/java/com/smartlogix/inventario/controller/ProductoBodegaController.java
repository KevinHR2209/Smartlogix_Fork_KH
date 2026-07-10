package com.smartlogix.inventario.controller;

import com.smartlogix.inventario.dto.*;
import com.smartlogix.inventario.service.ProductoBodegaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventario")
@RequiredArgsConstructor
public class ProductoBodegaController {

    private final ProductoBodegaService productoBodegaService;

    @GetMapping("/{idInventario}")
    public ResponseEntity<InventarioResponse> buscarPorId(@PathVariable Long idInventario) {
        return ResponseEntity.ok(productoBodegaService.buscarPorId(idInventario));
    }

    @GetMapping("/producto/{idProducto}")
    public List<InventarioResponse> listarPorProducto(@PathVariable Long idProducto) {
        return productoBodegaService.listarPorProducto(idProducto);
    }

    @GetMapping("/bodega/{idBodega}")
    public List<InventarioResponse> listarPorBodega(@PathVariable Integer idBodega) {
        return productoBodegaService.listarPorBodega(idBodega);
    }

    @PostMapping
    public ResponseEntity<InventarioResponse> crear(@Valid @RequestBody InventarioRequest request) {
        return ResponseEntity.status(201).body(productoBodegaService.crear(request));
    }

    @PutMapping("/{idInventario}/ajustar")
    public ResponseEntity<InventarioResponse> ajustarStock(
            @PathVariable Long idInventario,
            @Valid @RequestBody AjusteStockRequest request
    ) {
        return ResponseEntity.ok(productoBodegaService.ajustarStock(idInventario, request));
    }

    @PutMapping("/{idInventario}/reservar")
    public ResponseEntity<InventarioResponse> reservarStock(
            @PathVariable Long idInventario,
            @Valid @RequestBody CantidadRequest request
    ) {
        return ResponseEntity.ok(productoBodegaService.reservarStock(idInventario, request));
    }

    @PutMapping("/{idInventario}/liberar")
    public ResponseEntity<InventarioResponse> liberarReserva(
            @PathVariable Long idInventario,
            @Valid @RequestBody CantidadRequest request
    ) {
        return ResponseEntity.ok(productoBodegaService.liberarReserva(idInventario, request));
    }

    @PutMapping("/{idInventario}/descontar")
    public ResponseEntity<InventarioResponse> descontarStockReservado(
            @PathVariable Long idInventario,
            @Valid @RequestBody CantidadRequest request
    ) {
        return ResponseEntity.ok(productoBodegaService.descontarStockReservado(idInventario, request));
    }

    @PutMapping("/transferir")
    public ResponseEntity<Void> transferirStock(@Valid @RequestBody TransferenciaStockRequest request) {
        productoBodegaService.transferirStock(request);
        return ResponseEntity.ok().build();
    }
}