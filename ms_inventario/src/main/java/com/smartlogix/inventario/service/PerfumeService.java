package com.smartlogix.inventario.service;

import com.smartlogix.inventario.dto.*;
import com.smartlogix.inventario.entity.*;
import com.smartlogix.inventario.exception.ResourceNotFoundException;
import com.smartlogix.inventario.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PerfumeService {

    private final PerfumeRepository perfumeRepository;
    private final MarcaService marcaService;
    private final FamiliaOlfativaService familiaOlfativaService;

    public List<PerfumeResponse> listarTodos() {
        return perfumeRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public PerfumeResponse buscarPorId(Long id) {
        return toResponse(obtenerEntidad(id));
    }

    @Transactional
    public PerfumeResponse crear(PerfumeRequest request) {
        Marca marca = marcaService.obtenerEntidadParaUso(request.getIdMarca());

        FamiliaOlfativa familia = null;
        if (request.getIdFamilia() != null) {
            familia = familiaOlfativaService.obtenerEntidadParaUso(request.getIdFamilia());
        }

        Perfume perfume = new Perfume();
        perfume.setMarca(marca);
        perfume.setFamiliaOlfativa(familia);
        perfume.setNombre(request.getNombre());
        perfume.setDescripcion(request.getDescripcion());
        perfume.setConcentracion(request.getConcentracion());
        perfume.setGenero(request.getGenero());
        perfume.setTemporada(request.getTemporada());
        perfume.setMomentoUso(request.getMomentoUso());
        perfume.setEstado(request.getEstado() != null ? request.getEstado() : "activo");

        return toResponse(perfumeRepository.save(perfume));
    }

    @Transactional
    public PerfumeResponse actualizar(Long id, PerfumeRequest request) {
        Perfume perfume = obtenerEntidad(id);

        Marca marca = marcaService.obtenerEntidadParaUso(request.getIdMarca());
        perfume.setMarca(marca);

        if (request.getIdFamilia() != null) {
            FamiliaOlfativa familia = familiaOlfativaService.obtenerEntidadParaUso(request.getIdFamilia());
            perfume.setFamiliaOlfativa(familia);
        }

        perfume.setNombre(request.getNombre());
        perfume.setDescripcion(request.getDescripcion());
        perfume.setConcentracion(request.getConcentracion());
        perfume.setGenero(request.getGenero());
        perfume.setTemporada(request.getTemporada());
        perfume.setMomentoUso(request.getMomentoUso());
        perfume.setEstado(request.getEstado());

        return toResponse(perfumeRepository.save(perfume));
    }

    public void eliminar(Long id) {
        obtenerEntidad(id);
        perfumeRepository.deleteById(id);
    }

    public Perfume obtenerEntidadParaUso(Long id) {
        return obtenerEntidad(id);
    }

    private Perfume obtenerEntidad(Long id) {
        return perfumeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Perfume", id));
    }

    private PerfumeResponse toResponse(Perfume p) {
        return PerfumeResponse.builder()
                .idPerfume(p.getIdPerfume())
                .nombre(p.getNombre())
                .descripcion(p.getDescripcion())
                .concentracion(p.getConcentracion())
                .genero(p.getGenero())
                .temporada(p.getTemporada())
                .momentoUso(p.getMomentoUso())
                .estado(p.getEstado())
                .marca(p.getMarca() != null ? MarcaResponse.builder()
                        .idMarca(p.getMarca().getIdMarca())
                        .nombre(p.getMarca().getNombre())
                        .paisOrigen(p.getMarca().getPaisOrigen())
                        .build() : null)
                .familiaOlfativa(p.getFamiliaOlfativa() != null ? FamiliaOlfativaResponse.builder()
                        .idFamilia(p.getFamiliaOlfativa().getIdFamilia())
                        .nombre(p.getFamiliaOlfativa().getNombre())
                        .descripcion(p.getFamiliaOlfativa().getDescripcion())
                        .build() : null)
                .presentaciones(p.getPresentaciones() != null
                        ? p.getPresentaciones().stream().map(pr -> PresentacionResponse.builder()
                        .idPresentacion(pr.getIdPresentacion())
                        .idPerfume(p.getIdPerfume())
                        .nombrePerfume(p.getNombre())
                        .sku(pr.getSku())
                        .codigoBarras(pr.getCodigoBarras())
                        .volumenMl(pr.getVolumenMl())
                        .tipoEnvase(pr.getTipoEnvase())
                        .precioActual(pr.getPrecioActual())
                        .pesoGramos(pr.getPesoGramos())
                        .imagenUrl(pr.getImagenUrl())
                        .activo(pr.getActivo())
                        .build()).toList()
                        : List.of())
                .build();
    }
}