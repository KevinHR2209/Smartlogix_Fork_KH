package com.smartlogix.inventario.repository;

import com.smartlogix.inventario.entity.Marca;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarcaRepository extends JpaRepository<Marca, Integer> {
    boolean existsByNombre(String nombre);
}