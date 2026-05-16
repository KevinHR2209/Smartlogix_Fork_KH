package com.smartlogix.msclientes.repository;

import com.smartlogix.msclientes.model.DireccionCliente;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DireccionRepository extends JpaRepository<DireccionCliente, Long> {
    List<DireccionCliente> findByClienteIdCliente(Long idCliente);
}