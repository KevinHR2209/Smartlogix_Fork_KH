package com.smartlogix.mslogistica.controller;

import com.smartlogix.mslogistica.model.Transportista;
import com.smartlogix.mslogistica.repository.TransportistaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transportistas")
@RequiredArgsConstructor
public class TransportistaController {

    private final TransportistaRepository transportistaRepository;

    @GetMapping
    public List<Transportista> listar() {
        return transportistaRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Transportista> crear(@RequestBody Transportista transportista) {
        Transportista guardado = transportistaRepository.save(transportista);
        return ResponseEntity.status(201).body(guardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transportista> actualizar(
            @PathVariable Long id,
            @RequestBody Transportista transportistaActualizado
    ) {
        return transportistaRepository.findById(id)
                .map(transportista -> {
                    transportista.setNombreCompleto(transportistaActualizado.getNombreCompleto());
                    transportista.setPatenteVehiculo(transportistaActualizado.getPatenteVehiculo());
                    transportista.setTelefonoContacto(transportistaActualizado.getTelefonoContacto());
                    transportista.setEstado(transportistaActualizado.getEstado());

                    Transportista guardado = transportistaRepository.save(transportista);
                    return ResponseEntity.ok(guardado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!transportistaRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        transportistaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}