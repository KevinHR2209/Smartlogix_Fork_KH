package com.smartlogix.inventario.service;

import com.smartlogix.inventario.entity.Bodega;
import com.smartlogix.inventario.entity.Producto;
import com.smartlogix.inventario.entity.ProductoBodega;
import com.smartlogix.inventario.repository.BodegaRepository;
import com.smartlogix.inventario.repository.ProductoBodegaRepository;
import com.smartlogix.inventario.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private ProductoBodegaRepository productoBodegaRepository;

    @Autowired
    private BodegaRepository bodegaRepository;

    private final Map<String, Integer> matrizDistribucion = Map.of(
            "Valparaíso", 1,
            "Coquimbo", 2,
            "Metropolitana", 3
    );

    public List<Producto> listarTodos() {
        List<Producto> productos = productoRepository.findAll();
        for (Producto p : productos) {
            int total = productoBodegaRepository.findByProductoIdProducto(p.getIdProducto())
                    .stream().mapToInt(ProductoBodega::getStockDisponible).sum();
            p.setStockTotal(total);
        }
        return productos;
    }

    @Transactional
    public Producto guardar(Producto producto) {
        Producto productoGuardado = productoRepository.save(producto);

        List<Bodega> bodegas = bodegaRepository.findAll();
        Random random = new Random();

        for (Bodega bodega : bodegas) {
            ProductoBodega stockInicial = new ProductoBodega();
            stockInicial.setProducto(productoGuardado);
            stockInicial.setBodega(bodega);
            stockInicial.setStockDisponible(random.nextInt(91) + 10);
            stockInicial.setStockReservado(0);
            productoBodegaRepository.save(stockInicial);
        }
        System.out.println("NUEVO PRODUCTO: Stock aleatorio asignado en " + bodegas.size() + " bodegas.");

        return productoGuardado;
    }

    @Transactional
    public Producto actualizar(Long id, Producto productoNuevo) {
        Producto existente = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + id));

        existente.setSku(productoNuevo.getSku());
        existente.setNombre(productoNuevo.getNombre());
        existente.setDescripcion(productoNuevo.getDescripcion());
        existente.setPrecioActual(productoNuevo.getPrecioActual());
        existente.setPesoGramos(productoNuevo.getPesoGramos());
        existente.setDimensiones(productoNuevo.getDimensiones());
        existente.setEstado(productoNuevo.getEstado());

        return productoRepository.save(existente);
    }

    public Producto buscarPorId(Long id) {
        return productoRepository.findById(id).orElse(null);
    }

    public void eliminar(Long id) {
        productoRepository.deleteById(id);
    }

    @Transactional
    public void descontarStockGeolocalizado(Long idProducto, Integer cantidadRestante, String regionDestino) {
        List<ProductoBodega> stockDisponible = productoBodegaRepository.findByProductoIdProducto(idProducto);

        Integer idBodegaPreferida = matrizDistribucion.getOrDefault(regionDestino, 3);

        stockDisponible.sort((b1, b2) -> {
            boolean b1Pref = b1.getBodega().getIdBodega().equals(idBodegaPreferida);
            boolean b2Pref = b2.getBodega().getIdBodega().equals(idBodegaPreferida);
            if (b1Pref && !b2Pref) return -1;
            if (!b1Pref && b2Pref) return 1;
            return 0;
        });

        int stockTotal = stockDisponible.stream().mapToInt(ProductoBodega::getStockDisponible).sum();
        if (stockTotal < cantidadRestante) {
            throw new RuntimeException("Stock insuficiente para el producto ID: " + idProducto);
        }

        for (ProductoBodega stock : stockDisponible) {
            if (cantidadRestante == 0) break;

            int disponible = stock.getStockDisponible();
            if (disponible >= cantidadRestante) {
                stock.setStockDisponible(disponible - cantidadRestante);
                cantidadRestante = 0;
            } else if (disponible > 0) {
                stock.setStockDisponible(0);
                cantidadRestante -= disponible;
            }
            productoBodegaRepository.save(stock);
        }
    }
}