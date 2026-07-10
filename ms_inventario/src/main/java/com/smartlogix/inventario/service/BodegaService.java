package com.smartlogix.inventario.service;

import com.smartlogix.inventario.dto.BodegaRequest;
import com.smartlogix.inventario.dto.BodegaResponse;
import com.smartlogix.inventario.entity.Bodega;
import com.smartlogix.inventario.repository.BodegaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BodegaService {

    private final BodegaRepository bodegaRepository;

    public List<BodegaResponse> listar() {
        return bodegaRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public BodegaResponse buscarPorId(Integer id) {
        return toResponse(obtenerEntidad(id));
    }

    public BodegaResponse crear(BodegaRequest request) {
        Bodega bodega = new Bodega();
        bodega.setNombre(request.getNombre());
        bodega.setDireccionFisica(request.getDireccionFisica());

        return toResponse(bodegaRepository.save(bodega));
    }

    public BodegaResponse actualizar(Integer id, BodegaRequest request) {
        Bodega bodega = obtenerEntidad(id);
        bodega.setNombre(request.getNombre());
        bodega.setDireccionFisica(request.getDireccionFisica());

        return toResponse(bodegaRepository.save(bodega));
    }

    public void eliminar(Integer id) {
        Bodega bodega = obtenerEntidad(id);
        bodegaRepository.delete(bodega);
    }

    private Bodega obtenerEntidad(Integer id) {
        return bodegaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bodega no encontrada con id: " + id));
    }

    private BodegaResponse toResponse(Bodega bodega) {
        return BodegaResponse.builder()
                .idBodega(bodega.getIdBodega())
                .nombre(bodega.getNombre())
                .direccionFisica(bodega.getDireccionFisica())
                .build();
    }
}