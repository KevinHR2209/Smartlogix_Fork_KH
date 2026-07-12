package com.smartlogix.msclientes.repository;

import com.smartlogix.msclientes.model.Comuna;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComunaRepository extends JpaRepository<Comuna, Integer> {
    List<Comuna> findByProvinciaIdProvincia(Integer idProvincia);
    List<Comuna> findByProvinciaRegionIdRegion(Integer idRegion);
}