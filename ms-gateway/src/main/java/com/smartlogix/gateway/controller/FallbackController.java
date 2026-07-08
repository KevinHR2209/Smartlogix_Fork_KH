package com.smartlogix.gateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @RequestMapping("/auth")
    public ResponseEntity<Map<String, String>> authFallback() {
        return buildFallbackResponse("El servicio de Autenticación no está disponible en este momento. Intente más tarde.");
    }

    @RequestMapping("/inventario")
    public ResponseEntity<Map<String, String>> inventarioFallback() {
        return buildFallbackResponse("El servicio de Inventario (Productos/Bodegas) no está disponible en este momento. Intente más tarde.");
    }

    @RequestMapping("/ventas")
    public ResponseEntity<Map<String, String>> ventasFallback() {
        return buildFallbackResponse("El servicio de Ventas (Pedidos/Pagos) está experimentando problemas. Intente más tarde.");
    }

    @RequestMapping("/clientes")
    public ResponseEntity<Map<String, String>> clientesFallback() {
        return buildFallbackResponse("El servicio de Clientes no está disponible en este momento. Intente más tarde.");
    }

    @RequestMapping("/logistica")
    public ResponseEntity<Map<String, String>> logisticaFallback() {
        return buildFallbackResponse("El servicio de Logística y Despachos no responde. Intente más tarde.");
    }

    private ResponseEntity<Map<String, String>> buildFallbackResponse(String message) {
        Map<String, String> response = new HashMap<>();
        response.put("error", "Service Unavailable");
        response.put("mensaje", message);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }
}