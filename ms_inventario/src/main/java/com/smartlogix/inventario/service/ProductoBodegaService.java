package com.smartlogix.inventario.service;

import com.smartlogix.inventario.dto.*;
import com.smartlogix.inventario.entity.Bodega;
import com.smartlogix.inventario.entity.Producto;
import com.smartlogix.inventario.entity.ProductoBodega;
import com.smartlogix.inventario.repository.BodegaRepository;
import com.smartlogix.inventario.repository.ProductoBodegaRepository;
import com.smartlogix.inventario.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoBodegaService {

    private final ProductoBodegaRepository productoBodegaRepository;
    private final ProductoRepository productoRepository;
    private final BodegaRepository bodegaRepository;

    public List<InventarioResponse> listarPorProducto(Long idProducto) {
        return productoBodegaRepository.findByProductoIdProducto(idProducto)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<InventarioResponse> listarPorBodega(Integer idBodega) {
        return productoBodegaRepository.findByBodegaIdBodega(idBodega)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public InventarioResponse buscarPorId(Long idInventario) {
        return toResponse(obtenerEntidad(idInventario));
    }

    @Transactional
    public InventarioResponse crear(InventarioRequest request) {
        productoBodegaRepository
                .findByProductoIdProductoAndBodegaIdBodega(request.getIdProducto(), request.getIdBodega())
                .ifPresent(pb -> {
                    throw new RuntimeException("Ya existe inventario para ese producto en esa bodega");
                });

        Producto producto = productoRepository.findById(request.getIdProducto())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Bodega bodega = bodegaRepository.findById(request.getIdBodega())
                .orElseThrow(() -> new RuntimeException("Bodega no encontrada"));

        ProductoBodega inventario = new ProductoBodega();
        inventario.setProducto(producto);
        inventario.setBodega(bodega);
        inventario.setStockDisponible(request.getStockDisponible());
        inventario.setStockReservado(request.getStockReservado());

        return toResponse(productoBodegaRepository.save(inventario));
    }

    @Transactional
    public InventarioResponse ajustarStock(Long idInventario, AjusteStockRequest request) {
        ProductoBodega inventario = obtenerEntidad(idInventario);

        int nuevoStock = inventario.getStockDisponible() + request.getCantidad();

        if (nuevoStock < 0) {
            throw new RuntimeException("El stock disponible no puede quedar negativo");
        }

        inventario.setStockDisponible(nuevoStock);

        return toResponse(productoBodegaRepository.save(inventario));
    }

    @Transactional
    public InventarioResponse reservarStock(Long idInventario, CantidadRequest request) {
        ProductoBodega inventario = obtenerEntidad(idInventario);

        if (inventario.getStockDisponible() < request.getCantidad()) {
            throw new RuntimeException("No hay stock disponible suficiente para reservar");
        }

        inventario.setStockDisponible(inventario.getStockDisponible() - request.getCantidad());
        inventario.setStockReservado(inventario.getStockReservado() + request.getCantidad());

        return toResponse(productoBodegaRepository.save(inventario));
    }

    @Transactional
    public InventarioResponse liberarReserva(Long idInventario, CantidadRequest request) {
        ProductoBodega inventario = obtenerEntidad(idInventario);

        if (inventario.getStockReservado() < request.getCantidad()) {
            throw new RuntimeException("No hay stock reservado suficiente para liberar");
        }

        inventario.setStockReservado(inventario.getStockReservado() - request.getCantidad());
        inventario.setStockDisponible(inventario.getStockDisponible() + request.getCantidad());

        return toResponse(productoBodegaRepository.save(inventario));
    }

    @Transactional
    public InventarioResponse descontarStockReservado(Long idInventario, CantidadRequest request) {
        ProductoBodega inventario = obtenerEntidad(idInventario);

        if (inventario.getStockReservado() < request.getCantidad()) {
            throw new RuntimeException("No hay stock reservado suficiente para descontar");
        }

        inventario.setStockReservado(inventario.getStockReservado() - request.getCantidad());

        return toResponse(productoBodegaRepository.save(inventario));
    }

    @Transactional
    public void transferirStock(TransferenciaStockRequest request) {
        if (request.getIdBodegaOrigen().equals(request.getIdBodegaDestino())) {
            throw new RuntimeException("La bodega origen y destino no pueden ser la misma");
        }

        ProductoBodega origen = productoBodegaRepository
                .findByProductoIdProductoAndBodegaIdBodega(request.getIdProducto(), request.getIdBodegaOrigen())
                .orElseThrow(() -> new RuntimeException("No existe inventario del producto en la bodega origen"));

        if (origen.getStockDisponible() < request.getCantidad()) {
            throw new RuntimeException("No hay stock disponible suficiente en la bodega origen");
        }

        ProductoBodega destino = productoBodegaRepository
                .findByProductoIdProductoAndBodegaIdBodega(request.getIdProducto(), request.getIdBodegaDestino())
                .orElseGet(() -> crearInventarioDestino(request));

        origen.setStockDisponible(origen.getStockDisponible() - request.getCantidad());
        destino.setStockDisponible(destino.getStockDisponible() + request.getCantidad());

        productoBodegaRepository.save(origen);
        productoBodegaRepository.save(destino);
    }

    private ProductoBodega crearInventarioDestino(TransferenciaStockRequest request) {
        Producto producto = productoRepository.findById(request.getIdProducto())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Bodega bodegaDestino = bodegaRepository.findById(request.getIdBodegaDestino())
                .orElseThrow(() -> new RuntimeException("Bodega destino no encontrada"));

        ProductoBodega nuevo = new ProductoBodega();
        nuevo.setProducto(producto);
        nuevo.setBodega(bodegaDestino);
        nuevo.setStockDisponible(0);
        nuevo.setStockReservado(0);

        return productoBodegaRepository.save(nuevo);
    }

    private ProductoBodega obtenerEntidad(Long idInventario) {
        return productoBodegaRepository.findById(idInventario)
                .orElseThrow(() -> new RuntimeException("Inventario no encontrado con id: " + idInventario));
    }

    private InventarioResponse toResponse(ProductoBodega inventario) {
        return InventarioResponse.builder()
                .idInventario(inventario.getIdInventario())
                .idBodega(inventario.getBodega().getIdBodega())
                .nombreBodega(inventario.getBodega().getNombre())
                .idProducto(inventario.getProducto().getIdProducto())
                .sku(inventario.getProducto().getSku())
                .nombreProducto(inventario.getProducto().getNombre())
                .stockDisponible(inventario.getStockDisponible())
                .stockReservado(inventario.getStockReservado())
                .build();
    }
}