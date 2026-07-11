package com.smartlogix.inventario.service;

import com.smartlogix.inventario.dto.MarcaRequest;
import com.smartlogix.inventario.dto.MarcaResponse;
import com.smartlogix.inventario.entity.Marca;
import com.smartlogix.inventario.exception.ResourceNotFoundException;
import com.smartlogix.inventario.repository.MarcaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MarcaService {

    private final MarcaRepository marcaRepository;

    public List<MarcaResponse> listarTodas() {
        return marcaRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public MarcaResponse buscarPorId(Integer id) {
        return toResponse(obtenerEntidad(id));
    }

    public MarcaResponse crear(MarcaRequest request) {
        if (marcaRepository.existsByNombre(request.getNombre())) {
            throw new RuntimeException("Ya existe una marca con el nombre: " + request.getNombre());
        }
        Marca marca = new Marca();
        marca.setNombre(request.getNombre());
        marca.setPaisOrigen(request.getPaisOrigen());
        return toResponse(marcaRepository.save(marca));
    }

    public MarcaResponse actualizar(Integer id, MarcaRequest request) {
        Marca marca = obtenerEntidad(id);
        marca.setNombre(request.getNombre());
        marca.setPaisOrigen(request.getPaisOrigen());
        return toResponse(marcaRepository.save(marca));
    }

    public void eliminar(Integer id) {
        obtenerEntidad(id);
        marcaRepository.deleteById(id);
    }

    private Marca obtenerEntidad(Integer id) {
        return marcaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Marca", id));
    }

    public Marca obtenerEntidadParaUso(Integer id) {
        return obtenerEntidad(id);
    }

    private MarcaResponse toResponse(Marca marca) {
        return MarcaResponse.builder()
                .idMarca(marca.getIdMarca())
                .nombre(marca.getNombre())
                .paisOrigen(marca.getPaisOrigen())
                .build();
    }
}