// ms-clientes/src/main/java/com/smartlogix/msclientes/service/ClienteService.java
package com.smartlogix.msclientes.service;

import com.smartlogix.msclientes.model.Cliente;
import com.smartlogix.msclientes.model.DireccionCliente;
import com.smartlogix.msclientes.repository.ClienteRepository;
import com.smartlogix.msclientes.repository.DireccionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class ClienteService {
    private final ClienteRepository repository;
    private final DireccionRepository direccionRepository; // Inyectamos Direcciones

    public List<Cliente> listar() {
        List<Cliente> clientes = repository.findAll();
        // Buscamos la dirección principal de cada cliente para exponer su región al frontend
        for (Cliente c : clientes) {
            direccionRepository.findAll().stream()
                    .filter(d -> d.getCliente().getIdCliente().equals(c.getIdCliente()) && d.getEsPrincipal())
                    .findFirst()
                    .ifPresent(dir -> c.setRegion(dir.getDetalle()));
        }
        return clientes;
    }

    public Cliente buscarPorId(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    }

    @Transactional
    public Cliente crear(Cliente cliente) {
        Cliente guardado = repository.save(cliente);

        // Generamos una dirección aleatoria para probar el algoritmo geolocalizado en ms-ventas
        DireccionCliente direccion = new DireccionCliente();
        String[] calles = {"Avenida Errázuriz", "Ruta 5 Norte", "Alameda"};
        String[] regiones = {"Valparaíso", "Coquimbo", "Metropolitana"};
        int[] comunas = {1, 2, 3};

        int index = new Random().nextInt(3);

        direccion.setCalle(calles[index]);
        direccion.setNumero(String.valueOf(new Random().nextInt(1500) + 1));
        direccion.setDetalle(regiones[index]); // Guardamos la región en "detalle"
        direccion.setIdComuna(comunas[index]);
        direccion.setEsPrincipal(true);
        direccion.setCliente(guardado);

        direccionRepository.save(direccion);
        System.out.println("✅ CLIENTE CREADO: Dirección automática asignada en " + regiones[index]);

        guardado.setRegion(regiones[index]); // La devolvemos en el JSON
        return guardado;
    }

    public Cliente actualizar(Long id, Cliente cliente) {
        Cliente existente = buscarPorId(id);
        existente.setRut(cliente.getRut());
        existente.setNombre(cliente.getNombre());
        existente.setApellidoPaterno(cliente.getApellidoPaterno());
        existente.setApellidoMaterno(cliente.getApellidoMaterno());
        existente.setCorreo(cliente.getCorreo());
        existente.setTelefono(cliente.getTelefono());
        return repository.save(existente);
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}