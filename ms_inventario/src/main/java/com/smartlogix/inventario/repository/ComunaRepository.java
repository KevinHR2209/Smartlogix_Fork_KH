package com.smartlogix.inventario.repository;

import com.smartlogix.inventario.entity.Comuna;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComunaRepository extends JpaRepository<Comuna, Integer> {
    List<Comuna> findByProvinciaIdProvincia(Integer idProvincia);
}