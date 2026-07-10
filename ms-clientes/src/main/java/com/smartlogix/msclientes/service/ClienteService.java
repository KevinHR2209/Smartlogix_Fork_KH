package com.smartlogix.msclientes.service;

import com.smartlogix.msclientes.dto.CrearClienteDesdeAuthRequest;
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
    private final DireccionRepository direccionRepository;

    public List<Cliente> listar() {
        List<Cliente> clientes = repository.findAll();

        for (Cliente c : clientes) {
            List<DireccionCliente> direcciones = direccionRepository.findByClienteIdCliente(c.getIdCliente());
            c.setDirecciones(direcciones);

            direcciones.stream()
                    .filter(d -> Boolean.TRUE.equals(d.getEsPrincipal()))
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

        DireccionCliente direccion = new DireccionCliente();
        String[] calles = {"Avenida Errázuriz", "Ruta 5 Norte", "Alameda"};
        String[] regiones = {"Valparaíso", "Coquimbo", "Metropolitana"};
        int[] comunas = {1, 2, 3};

        int index = new Random().nextInt(3);

        direccion.setCalle(calles[index]);
        direccion.setNumero(String.valueOf(new Random().nextInt(1500) + 1));
        direccion.setDetalle(regiones[index]);
        direccion.setIdComuna(comunas[index]);
        direccion.setEsPrincipal(true);
        direccion.setCliente(guardado);

        direccionRepository.save(direccion);

        guardado.setRegion(regiones[index]);
        return guardado;
    }

    @Transactional
    public Cliente crearDesdeAuth(CrearClienteDesdeAuthRequest request) {
        if (repository.findByIdUsuarioAuth(request.getIdUsuarioAuth()).isPresent()) {
            throw new RuntimeException("Ya existe un cliente vinculado a ese usuario de autenticación");
        }

        if (repository.findByCorreo(request.getCorreo()).isPresent()) {
            throw new RuntimeException("Ya existe un cliente con ese correo");
        }

        if (repository.findByRut(request.getRut()).isPresent()) {
            throw new RuntimeException("Ya existe un cliente con ese RUT");
        }

        Cliente cliente = Cliente.builder()
                .idUsuarioAuth(request.getIdUsuarioAuth())
                .rut(request.getRut())
                .nombre(request.getNombre())
                .apellidoPaterno(request.getApellidoPaterno())
                .apellidoMaterno(request.getApellidoMaterno())
                .correo(request.getCorreo())
                .telefono(request.getTelefono())
                .build();

        Cliente guardado = repository.save(cliente);

        DireccionCliente direccion = DireccionCliente.builder()
                .cliente(guardado)
                .idComuna(request.getDireccionPrincipal().getIdComuna())
                .calle(request.getDireccionPrincipal().getCalle())
                .numero(request.getDireccionPrincipal().getNumero())
                .detalle(request.getDireccionPrincipal().getDetalle())
                .esPrincipal(true)
                .build();

        direccionRepository.save(direccion);

        guardado.setDirecciones(List.of(direccion));
        guardado.setRegion(request.getDireccionPrincipal().getDetalle());

        return guardado;
    }

    @Transactional
    public Cliente actualizar(Long id, Cliente cliente) {
        Cliente existente = buscarPorId(id);
        existente.setRut(cliente.getRut());
        existente.setNombre(cliente.getNombre());
        existente.setApellidoPaterno(cliente.getApellidoPaterno());
        existente.setApellidoMaterno(cliente.getApellidoMaterno());
        existente.setCorreo(cliente.getCorreo());
        existente.setTelefono(cliente.getTelefono());

        Cliente guardado = repository.save(existente);

        if (cliente.getDirecciones() != null && !cliente.getDirecciones().isEmpty()) {
            DireccionCliente nuevaPrincipal = cliente.getDirecciones().stream()
                    .filter(d -> Boolean.TRUE.equals(d.getEsPrincipal()))
                    .findFirst()
                    .orElse(cliente.getDirecciones().get(0));

            DireccionCliente direccionExistente = direccionRepository.findByClienteIdCliente(id).stream()
                    .filter(d -> Boolean.TRUE.equals(d.getEsPrincipal()))
                    .findFirst()
                    .orElseGet(() -> {
                        DireccionCliente d = new DireccionCliente();
                        d.setCliente(guardado);
                        d.setEsPrincipal(true);
                        return d;
                    });

            direccionExistente.setCliente(guardado);
            direccionExistente.setIdComuna(nuevaPrincipal.getIdComuna());
            direccionExistente.setCalle(nuevaPrincipal.getCalle());
            direccionExistente.setNumero(nuevaPrincipal.getNumero());
            direccionExistente.setDetalle(nuevaPrincipal.getDetalle());
            direccionExistente.setEsPrincipal(true);

            direccionRepository.save(direccionExistente);

            guardado.setDirecciones(List.of(direccionExistente));
            guardado.setRegion(direccionExistente.getDetalle());
        }

        return guardado;
    }

    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}