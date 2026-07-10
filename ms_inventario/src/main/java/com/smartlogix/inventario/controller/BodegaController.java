package com.smartlogix.inventario.controller;

import com.smartlogix.inventario.dto.BodegaRequest;
import com.smartlogix.inventario.dto.BodegaResponse;
import com.smartlogix.inventario.service.BodegaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bodegas")
@RequiredArgsConstructor
public class BodegaController {

    private final BodegaService bodegaService;

    @GetMapping
    public List<BodegaResponse> listar() {
        return bodegaService.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<BodegaResponse> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(bodegaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<BodegaResponse> crear(@Valid @RequestBody BodegaRequest request) {
        return ResponseEntity.status(201).body(bodegaService.crear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BodegaResponse> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody BodegaRequest request
    ) {
        return ResponseEntity.ok(bodegaService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        bodegaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}