package com.smartlogix.inventario.controller;

import com.smartlogix.inventario.dto.MarcaRequest;
import com.smartlogix.inventario.dto.MarcaResponse;
import com.smartlogix.inventario.service.MarcaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marcas")
@RequiredArgsConstructor
public class MarcaController {

    private final MarcaService marcaService;

    @GetMapping
    public ResponseEntity<List<MarcaResponse>> listar() {
        return ResponseEntity.ok(marcaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MarcaResponse> obtener(@PathVariable Integer id) {
        return ResponseEntity.ok(marcaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<MarcaResponse> crear(@Valid @RequestBody MarcaRequest request) {
        return ResponseEntity.status(201).body(marcaService.crear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MarcaResponse> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody MarcaRequest request) {
        return ResponseEntity.ok(marcaService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        marcaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}