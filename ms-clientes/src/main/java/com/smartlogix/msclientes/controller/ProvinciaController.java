package com.smartlogix.msclientes.controller;

import com.smartlogix.msclientes.model.Provincia;
import com.smartlogix.msclientes.repository.ProvinciaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/provincias")
@RequiredArgsConstructor
public class ProvinciaController {

    private final ProvinciaRepository provinciaRepository;

    @GetMapping
    public ResponseEntity<List<Provincia>> listar() {
        return ResponseEntity.ok(provinciaRepository.findAll());
    }

    @GetMapping("/region/{idRegion}")
    public ResponseEntity<List<Provincia>> listarPorRegion(@PathVariable Integer idRegion) {
        return ResponseEntity.ok(provinciaRepository.findByRegionIdRegion(idRegion));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Provincia> obtener(@PathVariable Integer id) {
        return ResponseEntity.ok(provinciaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Provincia no encontrada con id: " + id)));
    }
}