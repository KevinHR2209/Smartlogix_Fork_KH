package com.smartlogix.inventario.repository;

import com.smartlogix.inventario.entity.Bodega;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BodegaRepository extends JpaRepository<Bodega, Integer> {
}