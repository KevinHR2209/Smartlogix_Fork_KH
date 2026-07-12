package com.smartlogix.msclientes.controller;

import com.smartlogix.msclientes.dto.ClienteResponse;
import com.smartlogix.msclientes.dto.CrearClienteDesdeAuthRequest;
import com.smartlogix.msclientes.dto.DireccionClienteResponse;
import com.smartlogix.msclientes.service.ClienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService service;

    @GetMapping
    public ResponseEntity<List<ClienteResponse>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorIdDto(id));
    }

    // ENDPOINT PARA MS-VENTAS
    @GetMapping("/correo/{correo}")
    public ResponseEntity<ClienteResponse> buscarPorCorreo(@PathVariable String correo) {
        return ResponseEntity.ok(service.buscarPorCorreoDto(correo));
    }

    @PostMapping("/desde-auth")
    public ResponseEntity<ClienteResponse> crearDesdeAuth(
            @Valid @RequestBody CrearClienteDesdeAuthRequest request) {
        return ResponseEntity.status(201).body(service.crearDesdeAuth(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody CrearClienteDesdeAuthRequest request) {
        return ResponseEntity.ok(service.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    // ── Direcciones del cliente ───────────────────────────────────────────────

    @GetMapping("/{id}/direcciones")
    public ResponseEntity<List<DireccionClienteResponse>> listarDirecciones(@PathVariable Long id) {
        return ResponseEntity.ok(service.listarDirecciones(id));
    }

    @GetMapping("/{id}/direccion-principal")
    public ResponseEntity<DireccionClienteResponse> getDireccionPrincipal(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtenerDireccionPrincipal(id));
    }
}