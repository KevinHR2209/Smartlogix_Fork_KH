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
public class BodegaService {

    private final BodegaRepository bodegaRepository;
    private final ComunaRepository comunaRepository;

    public List<BodegaResponse> listarTodas() {
        return bodegaRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public List<BodegaResponse> listarActivas() {
        return bodegaRepository.findByActivaTrue().stream()
                .map(this::toResponse)
                .toList();
    }

    public BodegaResponse buscarPorId(Integer id) {
        return toResponse(obtenerEntidad(id));
    }

    @Transactional
    public BodegaResponse crear(BodegaRequest request) {
        Comuna comuna = comunaRepository.findById(request.getDireccion().getIdComuna())
                .orElseThrow(() -> new RuntimeException("Comuna no encontrada con id: "
                        + request.getDireccion().getIdComuna()));

        DireccionBodega direccion = new DireccionBodega();
        direccion.setComuna(comuna);
        direccion.setCalle(request.getDireccion().getCalle());
        direccion.setNumero(request.getDireccion().getNumero());
        direccion.setDetalle(request.getDireccion().getDetalle());

        Bodega bodega = new Bodega();
        bodega.setNombre(request.getNombre());
        bodega.setDireccionBodega(direccion);
        bodega.setActiva(request.getActiva() != null ? request.getActiva() : true);

        return toResponse(bodegaRepository.save(bodega));
    }

    @Transactional
    public BodegaResponse actualizar(Integer id, BodegaRequest request) {
        Bodega bodega = obtenerEntidad(id);

        Comuna comuna = comunaRepository.findById(request.getDireccion().getIdComuna())
                .orElseThrow(() -> new RuntimeException("Comuna no encontrada con id: "
                        + request.getDireccion().getIdComuna()));

        bodega.getDireccionBodega().setComuna(comuna);
        bodega.getDireccionBodega().setCalle(request.getDireccion().getCalle());
        bodega.getDireccionBodega().setNumero(request.getDireccion().getNumero());
        bodega.getDireccionBodega().setDetalle(request.getDireccion().getDetalle());
        bodega.setNombre(request.getNombre());
        bodega.setActiva(request.getActiva());

        return toResponse(bodegaRepository.save(bodega));
    }

    public Bodega obtenerEntidadParaUso(Integer id) {
        return obtenerEntidad(id);
    }

    private Bodega obtenerEntidad(Integer id) {
        return bodegaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bodega", id));
    }

    private BodegaResponse toResponse(Bodega b) {
        DireccionBodega dir = b.getDireccionBodega();
        DireccionBodegaResponse dirResponse = DireccionBodegaResponse.builder()
                .idDireccionBodega(dir.getIdDireccionBodega())
                .idComuna(dir.getComuna().getIdComuna())
                .nombreComuna(dir.getComuna().getNombreComuna())
                .nombreProvincia(dir.getComuna().getProvincia().getNombreProvincia())
                .nombreRegion(dir.getComuna().getProvincia().getRegion().getNombreRegion())
                .calle(dir.getCalle())
                .numero(dir.getNumero())
                .detalle(dir.getDetalle())
                .build();

        return BodegaResponse.builder()
                .idBodega(b.getIdBodega())
                .nombre(b.getNombre())
                .activa(b.getActiva())
                .direccion(dirResponse)
                .build();
    }
}