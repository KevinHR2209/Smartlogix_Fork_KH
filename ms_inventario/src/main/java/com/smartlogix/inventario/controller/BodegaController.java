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
    public ResponseEntity<List<BodegaResponse>> listar() {
        return ResponseEntity.ok(bodegaService.listarTodas());
    }

    @GetMapping("/activas")
    public ResponseEntity<List<BodegaResponse>> listarActivas() {
        return ResponseEntity.ok(bodegaService.listarActivas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BodegaResponse> obtener(@PathVariable Integer id) {
        return ResponseEntity.ok(bodegaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<BodegaResponse> crear(@Valid @RequestBody BodegaRequest request) {
        return ResponseEntity.status(201).body(bodegaService.crear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BodegaResponse> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody BodegaRequest request) {
        return ResponseEntity.ok(bodegaService.actualizar(id, request));
    }
}