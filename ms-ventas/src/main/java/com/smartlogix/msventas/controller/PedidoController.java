package com.smartlogix.msventas.controller;

import com.smartlogix.msventas.model.Pedido;
import com.smartlogix.msventas.service.PedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService service;

    @GetMapping
    public List<Pedido> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Pedido> crear(@RequestBody Pedido pedido) {
        Pedido creado = service.crear(pedido);
        return ResponseEntity.status(201).body(creado);
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Pedido> cambiarEstado(@PathVariable Long id,
                                                @RequestParam String estado) {
        return ResponseEntity.ok(service.cambiarEstado(id, estado));
    }
}