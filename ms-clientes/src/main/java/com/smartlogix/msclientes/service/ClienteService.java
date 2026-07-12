package com.smartlogix.msclientes.service;

import com.smartlogix.msclientes.dto.*;
import com.smartlogix.msclientes.model.Cliente;
import com.smartlogix.msclientes.model.Comuna;
import com.smartlogix.msclientes.model.DireccionCliente;
import com.smartlogix.msclientes.repository.ClienteRepository;
import com.smartlogix.msclientes.repository.ComunaRepository;
import com.smartlogix.msclientes.repository.DireccionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final DireccionRepository direccionRepository;
    private final ComunaRepository comunaRepository;

    // ── Mappers ──────────────────────────────────────────────────────────────

    private DireccionClienteResponse mapDireccion(DireccionCliente d) {
        DireccionClienteResponse.DireccionClienteResponseBuilder builder = DireccionClienteResponse.builder()
                .idDireccion(d.getIdDireccion())
                .calle(d.getCalle())
                .numero(d.getNumero())
                .detalle(d.getDetalle())
                .esPrincipal(d.getEsPrincipal());

        if (d.getComuna() != null) {
            builder.idComuna(d.getComuna().getIdComuna())
                    .nombreComuna(d.getComuna().getNombreComuna());
            if (d.getComuna().getProvincia() != null) {
                builder.idProvincia(d.getComuna().getProvincia().getIdProvincia())
                        .nombreProvincia(d.getComuna().getProvincia().getNombreProvincia());
                if (d.getComuna().getProvincia().getRegion() != null) {
                    builder.idRegion(d.getComuna().getProvincia().getRegion().getIdRegion())
                            .nombreRegion(d.getComuna().getProvincia().getRegion().getNombreRegion())
                            .codigoRegion(d.getComuna().getProvincia().getRegion().getCodigoRegion());
                }
            }
        }
        return builder.build();
    }

    public ClienteResponse mapCliente(Cliente c) {
        List<DireccionCliente> dirs = direccionRepository.findByClienteIdCliente(c.getIdCliente());
        return ClienteResponse.builder()
                .idCliente(c.getIdCliente())
                .idUsuarioAuth(c.getIdUsuarioAuth())
                .rut(c.getRut())
                .nombre(c.getNombre())
                .apellidoPaterno(c.getApellidoPaterno())
                .apellidoMaterno(c.getApellidoMaterno())
                .correo(c.getCorreo())
                .telefono(c.getTelefono())
                .direcciones(dirs.stream().map(this::mapDireccion).collect(Collectors.toList()))
                .build();
    }

    // ── Clientes ─────────────────────────────────────────────────────────────

    public List<ClienteResponse> listar() {
        return clienteRepository.findAll().stream()
                .map(this::mapCliente)
                .collect(Collectors.toList());
    }

    public ClienteResponse buscarPorIdDto(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Cliente con id " + id + " no encontrado"));
        return mapCliente(cliente);
    }

    // MÉTODO PARA BÚSQUEDA POR CORREO
    public ClienteResponse buscarPorCorreoDto(String correo) {
        Cliente cliente = clienteRepository.findByCorreo(correo)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Cliente no encontrado con el correo: " + correo));
        return mapCliente(cliente);
    }

    // Usado internamente para validación desde otros servicios
    public Cliente buscarPorId(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Cliente con id " + id + " no encontrado"));
    }

    @Transactional
    public ClienteResponse crearDesdeAuth(CrearClienteDesdeAuthRequest request) {
        if (clienteRepository.findByIdUsuarioAuth(request.getIdUsuarioAuth()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe un cliente vinculado a ese usuario de autenticación");
        }
        if (clienteRepository.findByCorreo(request.getCorreo()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe un cliente con ese correo");
        }
        if (clienteRepository.findByRut(request.getRut()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe un cliente con ese RUT");
        }

        Comuna comuna = comunaRepository.findById(request.getDireccionPrincipal().getIdComuna())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Comuna con id " + request.getDireccionPrincipal().getIdComuna() + " no encontrada"));

        Cliente cliente = Cliente.builder()
                .idUsuarioAuth(request.getIdUsuarioAuth())
                .rut(request.getRut())
                .nombre(request.getNombre())
                .apellidoPaterno(request.getApellidoPaterno())
                .apellidoMaterno(request.getApellidoMaterno())
                .correo(request.getCorreo())
                .telefono(request.getTelefono())
                .build();

        Cliente guardado = clienteRepository.save(cliente);

        DireccionCliente direccion = DireccionCliente.builder()
                .cliente(guardado)
                .comuna(comuna)
                .calle(request.getDireccionPrincipal().getCalle())
                .numero(request.getDireccionPrincipal().getNumero())
                .detalle(request.getDireccionPrincipal().getDetalle())
                .esPrincipal(true)
                .build();

        direccionRepository.save(direccion);
        return mapCliente(guardado);
    }

    @Transactional
    public ClienteResponse actualizar(Long id, CrearClienteDesdeAuthRequest request) {
        Cliente existente = buscarPorId(id);
        existente.setNombre(request.getNombre());
        existente.setApellidoPaterno(request.getApellidoPaterno());
        existente.setApellidoMaterno(request.getApellidoMaterno());
        existente.setCorreo(request.getCorreo());
        existente.setTelefono(request.getTelefono());
        clienteRepository.save(existente);
        return mapCliente(existente);
    }

    public void eliminar(Long id) {
        buscarPorId(id);
        clienteRepository.deleteById(id);
    }

    // ── Direcciones ──────────────────────────────────────────────────────────

    public List<DireccionClienteResponse> listarDirecciones(Long idCliente) {
        buscarPorId(idCliente);
        return direccionRepository.findByClienteIdCliente(idCliente)
                .stream().map(this::mapDireccion).collect(Collectors.toList());
    }

    public DireccionClienteResponse obtenerDireccionPrincipal(Long idCliente) {
        buscarPorId(idCliente);
        DireccionCliente principal = direccionRepository
                .findByClienteIdClienteAndEsPrincipalTrue(idCliente)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "El cliente " + idCliente + " no tiene dirección principal registrada"));
        return mapDireccion(principal);
    }

    @Transactional
    public DireccionClienteResponse agregarDireccion(Long idCliente, DireccionRequest request) {
        Cliente cliente = buscarPorId(idCliente);

        Comuna comuna = comunaRepository.findById(request.getIdComuna())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Comuna con id " + request.getIdComuna() + " no encontrada"));

        if (Boolean.TRUE.equals(request.getEsPrincipal())) {
            direccionRepository.findByClienteIdClienteAndEsPrincipalTrue(idCliente)
                    .ifPresent(d -> {
                        d.setEsPrincipal(false);
                        direccionRepository.save(d);
                    });
        }

        DireccionCliente nueva = DireccionCliente.builder()
                .cliente(cliente)
                .comuna(comuna)
                .calle(request.getCalle())
                .numero(request.getNumero())
                .detalle(request.getDetalle())
                .esPrincipal(request.getEsPrincipal())
                .build();

        return mapDireccion(direccionRepository.save(nueva));
    }

    @Transactional
    public DireccionClienteResponse editarDireccion(Long idCliente, Long idDireccion, DireccionRequest request) {
        buscarPorId(idCliente);

        DireccionCliente direccion = direccionRepository.findById(idDireccion)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Dirección con id " + idDireccion + " no encontrada"));

        if (!direccion.getCliente().getIdCliente().equals(idCliente)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "La dirección no pertenece al cliente indicado");
        }

        Comuna comuna = comunaRepository.findById(request.getIdComuna())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Comuna con id " + request.getIdComuna() + " no encontrada"));

        if (Boolean.TRUE.equals(request.getEsPrincipal())) {
            direccionRepository.findByClienteIdClienteAndEsPrincipalTrue(idCliente)
                    .ifPresent(d -> {
                        if (!d.getIdDireccion().equals(idDireccion)) {
                            d.setEsPrincipal(false);
                            direccionRepository.save(d);
                        }
                    });
        }

        direccion.setComuna(comuna);
        direccion.setCalle(request.getCalle());
        direccion.setNumero(request.getNumero());
        direccion.setDetalle(request.getDetalle());
        direccion.setEsPrincipal(request.getEsPrincipal());

        return mapDireccion(direccionRepository.save(direccion));
    }

    @Transactional
    public DireccionClienteResponse marcarComoPrincipal(Long idCliente, Long idDireccion) {
        buscarPorId(idCliente);

        direccionRepository.findByClienteIdClienteAndEsPrincipalTrue(idCliente)
                .ifPresent(d -> {
                    d.setEsPrincipal(false);
                    direccionRepository.save(d);
                });

        DireccionCliente direccion = direccionRepository.findById(idDireccion)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Dirección con id " + idDireccion + " no encontrada"));

        if (!direccion.getCliente().getIdCliente().equals(idCliente)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "La dirección no pertenece al cliente indicado");
        }

        direccion.setEsPrincipal(true);
        return mapDireccion(direccionRepository.save(direccion));
    }

    @Transactional
    public void eliminarDireccion(Long idCliente, Long idDireccion) {
        buscarPorId(idCliente);

        DireccionCliente direccion = direccionRepository.findById(idDireccion)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Dirección con id " + idDireccion + " no encontrada"));

        if (!direccion.getCliente().getIdCliente().equals(idCliente)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "La dirección no pertenece al cliente indicado");
        }

        if (Boolean.TRUE.equals(direccion.getEsPrincipal())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "No se puede eliminar la dirección principal. Primero marca otra como principal.");
        }

        direccionRepository.delete(direccion);
    }
}