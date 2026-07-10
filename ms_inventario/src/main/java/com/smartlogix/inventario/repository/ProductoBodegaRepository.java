package com.smartlogix.inventario.repository;

import com.smartlogix.inventario.entity.ProductoBodega;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductoBodegaRepository extends JpaRepository<ProductoBodega, Long> {
    List<ProductoBodega> findByProductoIdProducto(Long idProducto);
    List<ProductoBodega> findByBodegaIdBodega(Integer idBodega);
    Optional<ProductoBodega> findByProductoIdProductoAndBodegaIdBodega(Long idProducto, Integer idBodega);
}