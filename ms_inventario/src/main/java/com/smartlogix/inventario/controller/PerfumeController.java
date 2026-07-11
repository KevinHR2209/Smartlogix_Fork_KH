package com.smartlogix.inventario.controller;

import com.smartlogix.inventario.dto.PerfumeRequest;
import com.smartlogix.inventario.dto.PerfumeResponse;
import com.smartlogix.inventario.service.PerfumeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/perfumes")
@RequiredArgsConstructor
public class PerfumeController {

    private final PerfumeService perfumeService;

    @GetMapping
    public ResponseEntity<List<PerfumeResponse>> listar() {
        return ResponseEntity.ok(perfumeService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PerfumeResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(perfumeService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<PerfumeResponse> crear(@Valid @RequestBody PerfumeRequest request) {
        return ResponseEntity.status(201).body(perfumeService.crear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PerfumeResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody PerfumeRequest request) {
        return ResponseEntity.ok(perfumeService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        perfumeService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}