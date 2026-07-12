package com.smartlogix.msclientes.repository;

import com.smartlogix.msclientes.model.DireccionCliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DireccionRepository extends JpaRepository<DireccionCliente, Long> {
    List<DireccionCliente> findByClienteIdCliente(Long idCliente);
    Optional<DireccionCliente> findByClienteIdClienteAndEsPrincipalTrue(Long idCliente);
}