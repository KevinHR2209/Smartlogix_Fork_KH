package com.smartlogix.inventario.service;

import com.smartlogix.inventario.dto.PresentacionRequest;
import com.smartlogix.inventario.dto.PresentacionResponse;
import com.smartlogix.inventario.entity.Perfume;
import com.smartlogix.inventario.entity.PresentacionPerfume;
import com.smartlogix.inventario.exception.ResourceNotFoundException;
import com.smartlogix.inventario.repository.PresentacionPerfumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PresentacionPerfumeService {

    private final PresentacionPerfumeRepository presentacionRepository;
    private final PerfumeService perfumeService;

    public List<PresentacionResponse> listarPorPerfume(Long idPerfume) {
        return presentacionRepository.findByPerfumeIdPerfume(idPerfume).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<PresentacionResponse> listarActivas() {
        return presentacionRepository.findByActivoTrue().stream()
                .map(this::toResponse)
                .toList();
    }

    public PresentacionResponse buscarPorId(Long id) {
        return toResponse(obtenerEntidad(id));
    }

    public PresentacionResponse buscarPorSku(String sku) {
        PresentacionPerfume presentacion = presentacionRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Presentación no encontrada con SKU: " + sku));
        return toResponse(presentacion);
    }

    public PresentacionResponse buscarPorCodigoBarras(String codigoBarras) {
        PresentacionPerfume presentacion = presentacionRepository
                .findByCodigoBarras(codigoBarras)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Presentación no encontrada con código de barras: " + codigoBarras));
        return toResponse(presentacion);
    }

    @Transactional
    public PresentacionResponse crear(PresentacionRequest request) {
        if (presentacionRepository.findBySku(request.getSku()).isPresent()) {
            throw new RuntimeException(
                    "Ya existe una presentación con el SKU: " + request.getSku());
        }

        Perfume perfume = perfumeService.obtenerEntidadParaUso(request.getIdPerfume());

        PresentacionPerfume presentacion = new PresentacionPerfume();
        presentacion.setPerfume(perfume);
        presentacion.setSku(request.getSku());
        presentacion.setCodigoBarras(request.getCodigoBarras());
        presentacion.setVolumenMl(request.getVolumenMl());
        presentacion.setTipoEnvase(request.getTipoEnvase());
        presentacion.setPrecioActual(request.getPrecioActual());
        presentacion.setPesoGramos(request.getPesoGramos());
        presentacion.setImagenUrl(request.getImagenUrl());
        presentacion.setActivo(request.getActivo() != null ? request.getActivo() : true);

        return toResponse(presentacionRepository.save(presentacion));
    }

    @Transactional
    public PresentacionResponse actualizar(Long id, PresentacionRequest request) {
        PresentacionPerfume presentacion = obtenerEntidad(id);

        presentacion.setSku(request.getSku());
        presentacion.setCodigoBarras(request.getCodigoBarras());
        presentacion.setVolumenMl(request.getVolumenMl());
        presentacion.setTipoEnvase(request.getTipoEnvase());
        presentacion.setPrecioActual(request.getPrecioActual());
        presentacion.setPesoGramos(request.getPesoGramos());
        presentacion.setImagenUrl(request.getImagenUrl());
        presentacion.setActivo(request.getActivo());

        return toResponse(presentacionRepository.save(presentacion));
    }

    public void eliminar(Long id) {
        obtenerEntidad(id);
        presentacionRepository.deleteById(id);
    }

    public PresentacionPerfume obtenerEntidadParaUso(Long id) {
        return obtenerEntidad(id);
    }

    private PresentacionPerfume obtenerEntidad(Long id) {
        return presentacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Presentación", id));
    }

    private PresentacionResponse toResponse(PresentacionPerfume pr) {
        return PresentacionResponse.builder()
                .idPresentacion(pr.getIdPresentacion())
                .idPerfume(pr.getPerfume().getIdPerfume())
                .nombrePerfume(pr.getPerfume().getNombre())
                .sku(pr.getSku())
                .codigoBarras(pr.getCodigoBarras())
                .volumenMl(pr.getVolumenMl())
                .tipoEnvase(pr.getTipoEnvase())
                .precioActual(pr.getPrecioActual())
                .pesoGramos(pr.getPesoGramos())
                .imagenUrl(pr.getImagenUrl())
                .activo(pr.getActivo())
                .build();
    }
}