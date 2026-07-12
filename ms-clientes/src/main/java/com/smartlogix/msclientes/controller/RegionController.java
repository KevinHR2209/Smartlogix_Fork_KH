package com.smartlogix.msclientes.controller;

import com.smartlogix.msclientes.model.Region;
import com.smartlogix.msclientes.repository.RegionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/regiones")
@RequiredArgsConstructor
public class RegionController {

    private final RegionRepository regionRepository;

    @GetMapping
    public ResponseEntity<List<Region>> listar() {
        return ResponseEntity.ok(regionRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Region> obtener(@PathVariable Integer id) {
        return ResponseEntity.ok(regionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Región no encontrada con id: " + id)));
    }
}