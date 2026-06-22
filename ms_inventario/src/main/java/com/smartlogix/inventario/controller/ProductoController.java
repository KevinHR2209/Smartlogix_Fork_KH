package com.smartlogix.inventario.controller;

import com.smartlogix.inventario.entity.Producto;
import com.smartlogix.inventario.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.smartlogix.inventario.dto.DescuentoStockDto;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    @PostMapping
    public Producto crear(@RequestBody Producto producto) {
        return productoService.guardar(producto);
    }

    @GetMapping
    public List<Producto> listar() {
        return productoService.listarTodos();
    }

    @GetMapping("/{id}")
    public Producto obtener(@PathVariable Long id) {
        return productoService.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public Producto actualizar(@PathVariable Long id, @RequestBody Producto producto) {
        return productoService.actualizar(id, producto); // ✅ usa el método dedicado
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
    }

    @PutMapping("/{id}/descontar-stock")
    public ResponseEntity<?> descontarStock(@PathVariable Long id, @RequestBody DescuentoStockDto request) {
        productoService.descontarStockGeolocalizado(id, request.getCantidad(), request.getRegionDestino());
        return ResponseEntity.ok().build();
    }
}