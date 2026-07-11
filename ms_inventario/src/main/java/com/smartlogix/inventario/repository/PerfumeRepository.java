package com.smartlogix.inventario.repository;

import com.smartlogix.inventario.entity.Perfume;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PerfumeRepository extends JpaRepository<Perfume, Long> {
    // sin métodos de SKU
}