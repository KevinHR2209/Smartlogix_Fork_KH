package com.smartlogix.msclientes.controller;

import com.smartlogix.msclientes.dto.DireccionClienteResponse;
import com.smartlogix.msclientes.dto.DireccionRequest;
import com.smartlogix.msclientes.service.ClienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clientes/{idCliente}/direcciones")
@RequiredArgsConstructor
public class DireccionController {

    private final ClienteService service;

    @PostMapping
    public ResponseEntity<DireccionClienteResponse> agregar(
            @PathVariable Long idCliente,
            @Valid @RequestBody DireccionRequest request) {
        return ResponseEntity.status(201).body(service.agregarDireccion(idCliente, request));
    }

    @PutMapping("/{idDireccion}")
    public ResponseEntity<DireccionClienteResponse> editar(
            @PathVariable Long idCliente,
            @PathVariable Long idDireccion,
            @Valid @RequestBody DireccionRequest request) {
        return ResponseEntity.ok(service.editarDireccion(idCliente, idDireccion, request));
    }

    @PutMapping("/{idDireccion}/principal")
    public ResponseEntity<DireccionClienteResponse> marcarComoPrincipal(
            @PathVariable Long idCliente,
            @PathVariable Long idDireccion) {
        return ResponseEntity.ok(service.marcarComoPrincipal(idCliente, idDireccion));
    }

    @DeleteMapping("/{idDireccion}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long idCliente,
            @PathVariable Long idDireccion) {
        service.eliminarDireccion(idCliente, idDireccion);
        return ResponseEntity.noContent().build();
    }
}