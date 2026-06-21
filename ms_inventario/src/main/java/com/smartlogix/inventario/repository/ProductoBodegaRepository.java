package com.smartlogix.inventario.repository;

import com.smartlogix.inventario.entity.ProductoBodega;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductoBodegaRepository extends JpaRepository<ProductoBodega, Long> {
    List<ProductoBodega> findByProductoIdProducto(Long idProducto);
}