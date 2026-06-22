package com.smartlogix.mslogistica.service;

import com.smartlogix.mslogistica.client.VentasClient;
import com.smartlogix.mslogistica.model.Despacho;
import com.smartlogix.mslogistica.model.Transportista;
import com.smartlogix.mslogistica.repository.DespachoRepository;
import com.smartlogix.mslogistica.repository.TransportistaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DespachoService {

    private final DespachoRepository despachoRepository;
    private final TransportistaRepository transportistaRepository;
    private final VentasClient ventasClient;

    public List<Despacho> listar() {
        return despachoRepository.findAll();
    }

    public Despacho buscarPorId(Long id) {
        return despachoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Despacho no encontrado"));
    }

    public Despacho crear(Despacho despacho) {
        ventasClient.validarPedido(despacho.getIdPedido());

        if (despacho.getFechaCreacion() == null) {
            despacho.setFechaCreacion(OffsetDateTime.now());
        }
        return despachoRepository.save(despacho);
    }

    public Despacho asignarTransportista(Long idDespacho, Long idTransportista) {
        Despacho despacho = buscarPorId(idDespacho);
        Transportista transportista = transportistaRepository.findById(idTransportista)
                .orElseThrow(() -> new RuntimeException("Transportista no encontrado"));
        despacho.setTransportista(transportista);
        return despachoRepository.save(despacho);
    }

    public Despacho cambiarEstado(Long idDespacho, String estado) {
        Despacho despacho = buscarPorId(idDespacho);
        despacho.setEstadoDespacho(estado);
        return despachoRepository.save(despacho);
    }
}