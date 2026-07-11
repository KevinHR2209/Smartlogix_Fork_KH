package com.smartlogix.inventario.controller;

import com.smartlogix.inventario.dto.DescuentoStockRequest;
import com.smartlogix.inventario.dto.PresentacionRequest;
import com.smartlogix.inventario.dto.PresentacionResponse;
import com.smartlogix.inventario.service.InventarioService;
import com.smartlogix.inventario.service.PresentacionPerfumeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/presentaciones")
@RequiredArgsConstructor
public class PresentacionPerfumeController {

    private final PresentacionPerfumeService presentacionService;
    private final InventarioService inventarioService;

    @GetMapping
    public ResponseEntity<List<PresentacionResponse>> listarActivas() {
        return ResponseEntity.ok(presentacionService.listarActivas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PresentacionResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(presentacionService.buscarPorId(id));
    }

    @GetMapping("/perfume/{idPerfume}")
    public ResponseEntity<List<PresentacionResponse>> listarPorPerfume(
            @PathVariable Long idPerfume) {
        return ResponseEntity.ok(presentacionService.listarPorPerfume(idPerfume));
    }

    @PostMapping
    public ResponseEntity<PresentacionResponse> crear(
            @Valid @RequestBody PresentacionRequest request) {
        return ResponseEntity.status(201).body(presentacionService.crear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PresentacionResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody PresentacionRequest request) {
        return ResponseEntity.ok(presentacionService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        presentacionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/descontar-stock")
    public ResponseEntity<Void> descontarStock(
            @PathVariable Long id,
            @Valid @RequestBody DescuentoStockRequest request) {
        inventarioService.descontarStockGeolocalizado(
                id, request.getCantidad(), request.getRegionDestino());
        return ResponseEntity.ok().build();
    }
    @GetMapping("/sku/{sku}")
    public ResponseEntity<PresentacionResponse> obtenerPorSku(@PathVariable String sku) {
        return ResponseEntity.ok(presentacionService.buscarPorSku(sku));
    }

    @GetMapping("/codigo-barras/{codigoBarras}")
    public ResponseEntity<PresentacionResponse> obtenerPorCodigoBarras(
            @PathVariable String codigoBarras) {
        return ResponseEntity.ok(presentacionService.buscarPorCodigoBarras(codigoBarras));
    }
}