package com.smartlogix.inventario.repository;

import com.smartlogix.inventario.entity.Region;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegionRepository extends JpaRepository<Region, Integer> {
    boolean existsByNombreRegion(String nombreRegion);
}