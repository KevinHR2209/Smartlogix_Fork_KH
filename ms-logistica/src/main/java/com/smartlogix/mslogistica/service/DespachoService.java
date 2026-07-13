package com.smartlogix.mslogistica.service;

import com.smartlogix.mslogistica.dto.DespachoRequest;
import com.smartlogix.mslogistica.dto.DespachoResponse;
import com.smartlogix.mslogistica.dto.WebhookCourierRequest;
import com.smartlogix.mslogistica.exception.ResourceNotFoundException;
import com.smartlogix.mslogistica.model.Despacho;
import com.smartlogix.mslogistica.repository.DespachoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DespachoService {

    private final DespachoRepository despachoRepository;

    public List<DespachoResponse> listar() {
        return despachoRepository.findAll().stream().map(this::toResponse).toList();
    }

    public DespachoResponse buscarPorId(Long id) {
        Despacho d = despachoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Despacho", id));
        return toResponse(d);
    }

    public DespachoResponse buscarPorIdPedido(Long idPedido) {
        Despacho d = despachoRepository.findByIdPedido(idPedido)
                .orElseThrow(() -> new ResourceNotFoundException("No hay despacho para el pedido: " + idPedido));
        return toResponse(d);
    }

    public DespachoResponse crear(DespachoRequest request) {
        Despacho despacho = new Despacho();
        despacho.setIdPedido(request.idPedido());
        despacho.setDireccionEntrega(request.direccionEntrega());
        despacho.setComunaEntrega(request.comunaEntrega());
        despacho.setEstadoDespacho(request.estadoDespacho() != null ? request.estadoDespacho() : "PENDIENTE");
        despacho.setFechaCreacion(OffsetDateTime.now());
        despacho.setFechaEntregaEstimada(OffsetDateTime.now().plusDays(3));

        // ── SIMULACIÓN DE API EXTERNA ──
        // En un entorno real, aquí haríamos un HTTP POST a la API de Starken
        // Por ahora, generamos un mock.
        String trackingMock = "STK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        despacho.setCourier("STARKEN");
        despacho.setCodigoSeguimiento(trackingMock);
        despacho.setUrlSeguimiento("https://starken.cl/tracking?codigo=" + trackingMock);

        return toResponse(despachoRepository.save(despacho));
    }

    public DespachoResponse cambiarEstado(Long idDespacho, String estado) {
        Despacho despacho = despachoRepository.findById(idDespacho)
                .orElseThrow(() -> new ResourceNotFoundException("Despacho", idDespacho));
        despacho.setEstadoDespacho(estado);
        return toResponse(despachoRepository.save(despacho));
    }

    // PROCESAMIENTO WEBHOOK
    public DespachoResponse procesarWebhook(WebhookCourierRequest request) {
        Despacho despacho = despachoRepository.findByCodigoSeguimiento(request.codigoSeguimiento())
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró despacho con código: " + request.codigoSeguimiento()));

        String estadoInterno = mapearEstadoCourier(request.nuevoEstado());
        despacho.setEstadoDespacho(estadoInterno);

        return toResponse(despachoRepository.save(despacho));
    }

    private String mapearEstadoCourier(String estadoCourier) {
        return switch (estadoCourier.toUpperCase()) {
            case "DELIVERED", "ENTREGADO" -> "ENTREGADO";
            case "IN_TRANSIT", "EN_RUTA" -> "EN_RUTA";
            case "EXCEPTION", "EXTRAVIADO" -> "PROBLEMA_ENTREGA";
            default -> "PENDIENTE";
        };
    }

    private DespachoResponse toResponse(Despacho d) {
        return DespachoResponse.builder()
                .idDespacho(d.getIdDespacho())
                .idPedido(d.getIdPedido())
                .direccionEntrega(d.getDireccionEntrega())
                .comunaEntrega(d.getComunaEntrega())
                .estadoDespacho(d.getEstadoDespacho())
                .fechaCreacion(d.getFechaCreacion())
                .fechaEntregaEstimada(d.getFechaEntregaEstimada())
                .courier(d.getCourier())
                .codigoSeguimiento(d.getCodigoSeguimiento())
                .urlSeguimiento(d.getUrlSeguimiento())
                .build();
    }
}