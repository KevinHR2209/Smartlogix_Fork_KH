package com.smartlogix.inventario.repository;

import com.smartlogix.inventario.entity.Perfume;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PerfumeRepository extends JpaRepository<Perfume, Long> {

    // trae todas las relaciones en un solo JOIN
    @Override
    @EntityGraph(attributePaths = {"marca", "familiaOlfativa", "presentaciones"})
    List<Perfume> findAll();

    // optimizar la vista de detalle
    @Override
    @EntityGraph(attributePaths = {"marca", "familiaOlfativa", "presentaciones"})
    Optional<Perfume> findById(Long id);
}