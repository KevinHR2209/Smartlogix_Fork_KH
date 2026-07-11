package com.smartlogix.inventario.repository;

import com.smartlogix.inventario.entity.Inventario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface InventarioRepository extends JpaRepository<Inventario, Long> {
    List<Inventario> findByPresentacionIdPresentacion(Long idPresentacion);
    List<Inventario> findByBodegaIdBodega(Integer idBodega);
    Optional<Inventario> findByPresentacionIdPresentacionAndBodegaIdBodega(Long idPresentacion, Integer idBodega);
}