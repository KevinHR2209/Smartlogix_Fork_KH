package com.smartlogix.msventas.controller;

import com.smartlogix.msventas.dto.PedidoRequest;
import com.smartlogix.msventas.model.Pedido;
import com.smartlogix.msventas.service.PedidoService;
import com.smartlogix.msventas.util.TokenUtils;
import com.smartlogix.msventas.client.ClienteClient;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;
    private final ClienteClient clienteClient;

    @GetMapping
    public List<Pedido> listar() {
        return pedidoService.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> obtener(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {

        String correoAuth = TokenUtils.extraerCorreo(token);
        Long idClienteAuth = clienteClient.obtenerIdClientePorCorreo(correoAuth);

        Pedido pedido = pedidoService.buscarPorId(id);

        // PROTECCIÓN IDOR
        if (!pedido.getIdCliente().equals(idClienteAuth)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para ver este pedido.");
        }

        return ResponseEntity.ok(pedido);
    }

    @PostMapping
    public ResponseEntity<Pedido> crear(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody PedidoRequest request) {

        //  String correoAuth = TokenUtils.extraerCorreo(token);
        //  Long idClienteAuth = clienteClient.obtenerIdClientePorCorreo(correoAuth);

        // PROTECCIÓN IDOR
        //  if (!request.idCliente().equals(idClienteAuth)) {
        //     throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes crear un pedido a nombre de otro usuario.");
        // }

        Pedido nuevoPedido = pedidoService.crear(request);
        return ResponseEntity.status(201).body(nuevoPedido);
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Pedido> cambiarEstado(@PathVariable Long id, @RequestParam String estado) {
        // Esto normalmente lo llama un Webhook de pago o logística, requiere seguridad distinta
        return ResponseEntity.ok(pedidoService.cambiarEstado(id, estado));
    }
    @GetMapping("/cliente/{idCliente}")
    public List<Pedido> listarPorCliente(
            @RequestHeader("Authorization") String token,
            @PathVariable Long idCliente) {

        //String correoAuth = TokenUtils.extraerCorreo(token);
        //Long idClienteAuth = clienteClient.obtenerIdClientePorCorreo(correoAuth);

        // PROTECCIÓN IDOR
        //if (!idCliente.equals(idClienteAuth)) {
        //    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para ver los pedidos de este cliente.");
        //}

        return pedidoService.listarPorCliente(idCliente);
    }

    // ── Cancelar pedido ─────────────────────────────────────────────────────────
    @PutMapping("/{id}/cancelar")
    public ResponseEntity<Pedido> cancelarPedido(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id) {

        // String correoAuth = TokenUtils.extraerCorreo(token);
        // Long idClienteAuth = clienteClient.obtenerIdClientePorCorreo(correoAuth);

        Pedido pedido = pedidoService.buscarPorId(id);

        // PROTECCIÓN IDOR
        // if (!pedido.getIdCliente().equals(idClienteAuth)) {
        //     throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para cancelar este pedido.");
        // }

        return ResponseEntity.ok(pedidoService.cancelarPedido(id));
    }
}