package com.smartlogix.msclientes.repository;

import com.smartlogix.msclientes.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByRut(String rut);
    Optional<Cliente> findByCorreo(String correo);
}