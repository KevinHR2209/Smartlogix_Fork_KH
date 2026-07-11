package com.smartlogix.inventario.repository;

import com.smartlogix.inventario.entity.PresentacionPerfume;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PresentacionPerfumeRepository extends JpaRepository<PresentacionPerfume, Long> {
    List<PresentacionPerfume> findByPerfumeIdPerfume(Long idPerfume);
    List<PresentacionPerfume> findByActivoTrue();
    Optional<PresentacionPerfume> findBySku(String sku);
    Optional<PresentacionPerfume> findByCodigoBarras(String codigoBarras);
}