package com.smartlogix.inventario.controller;

import com.smartlogix.inventario.dto.FamiliaOlfativaRequest;
import com.smartlogix.inventario.dto.FamiliaOlfativaResponse;
import com.smartlogix.inventario.service.FamiliaOlfativaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/familias-olfativas")
@RequiredArgsConstructor
public class FamiliaOlfativaController {

    private final FamiliaOlfativaService familiaOlfativaService;

    @GetMapping
    public ResponseEntity<List<FamiliaOlfativaResponse>> listar() {
        return ResponseEntity.ok(familiaOlfativaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FamiliaOlfativaResponse> obtener(@PathVariable Integer id) {
        return ResponseEntity.ok(familiaOlfativaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<FamiliaOlfativaResponse> crear(
            @Valid @RequestBody FamiliaOlfativaRequest request) {
        return ResponseEntity.status(201).body(familiaOlfativaService.crear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FamiliaOlfativaResponse> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody FamiliaOlfativaRequest request) {
        return ResponseEntity.ok(familiaOlfativaService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        familiaOlfativaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}