package com.smartlogix.msventas.service;

import com.smartlogix.msventas.model.DetallePedido;
import com.smartlogix.msventas.model.Pedido;
import com.smartlogix.msventas.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;

    public List<Pedido> listar() {
        return pedidoRepository.findAll();
    }

    public Pedido buscarPorId(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
    }

    public Pedido crear(Pedido pedido) {
        if (pedido.getFechaCreacion() == null) {
            pedido.setFechaCreacion(OffsetDateTime.now());
        }
        if (pedido.getDetalles() != null) {
            for (DetallePedido d : pedido.getDetalles()) {
                d.setPedido(pedido);
            }
        }
        return pedidoRepository.save(pedido);
    }

    public Pedido cambiarEstado(Long id, String estado) {
        Pedido pedido = buscarPorId(id);
        pedido.setEstadoPedido(estado);
        return pedidoRepository.save(pedido);
    }
}