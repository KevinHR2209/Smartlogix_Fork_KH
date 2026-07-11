package com.smartlogix.inventario.service;

import com.smartlogix.inventario.dto.FamiliaOlfativaRequest;
import com.smartlogix.inventario.dto.FamiliaOlfativaResponse;
import com.smartlogix.inventario.entity.FamiliaOlfativa;
import com.smartlogix.inventario.exception.ResourceNotFoundException;
import com.smartlogix.inventario.repository.FamiliaOlfativaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FamiliaOlfativaService {

    private final FamiliaOlfativaRepository familiaOlfativaRepository;

    public List<FamiliaOlfativaResponse> listarTodas() {
        return familiaOlfativaRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public FamiliaOlfativaResponse buscarPorId(Integer id) {
        return toResponse(obtenerEntidad(id));
    }

    public FamiliaOlfativaResponse crear(FamiliaOlfativaRequest request) {
        FamiliaOlfativa familia = new FamiliaOlfativa();
        familia.setNombre(request.getNombre());
        familia.setDescripcion(request.getDescripcion());
        return toResponse(familiaOlfativaRepository.save(familia));
    }

    public FamiliaOlfativaResponse actualizar(Integer id, FamiliaOlfativaRequest request) {
        FamiliaOlfativa familia = obtenerEntidad(id);
        familia.setNombre(request.getNombre());
        familia.setDescripcion(request.getDescripcion());
        return toResponse(familiaOlfativaRepository.save(familia));
    }

    public void eliminar(Integer id) {
        obtenerEntidad(id);
        familiaOlfativaRepository.deleteById(id);
    }

    public FamiliaOlfativa obtenerEntidadParaUso(Integer id) {
        return obtenerEntidad(id);
    }

    private FamiliaOlfativa obtenerEntidad(Integer id) {
        return familiaOlfativaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Familia olfativa", id));
    }

    private FamiliaOlfativaResponse toResponse(FamiliaOlfativa f) {
        return FamiliaOlfativaResponse.builder()
                .idFamilia(f.getIdFamilia())
                .nombre(f.getNombre())
                .descripcion(f.getDescripcion())
                .build();
    }
}