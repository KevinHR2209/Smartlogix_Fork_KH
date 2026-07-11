package com.smartlogix.inventario.controller;

import com.smartlogix.inventario.entity.Comuna;
import com.smartlogix.inventario.repository.ComunaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comunas")
@RequiredArgsConstructor
public class ComunaController {

    private final ComunaRepository comunaRepository;

    @GetMapping
    public ResponseEntity<List<Comuna>> listar() {
        return ResponseEntity.ok(comunaRepository.findAll());
    }

    @GetMapping("/provincia/{idProvincia}")
    public ResponseEntity<List<Comuna>> listarPorProvincia(@PathVariable Integer idProvincia) {
        return ResponseEntity.ok(comunaRepository.findByProvinciaIdProvincia(idProvincia));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Comuna> obtener(@PathVariable Integer id) {
        return ResponseEntity.ok(comunaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comuna no encontrada con id: " + id)));
    }
}