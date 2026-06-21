package com.smartlogix.msventas.service;

import com.smartlogix.msventas.client.InventarioClient;
import com.smartlogix.msventas.model.DetallePedido;
import com.smartlogix.msventas.model.Pedido;
import com.smartlogix.msventas.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final InventarioClient inventarioClient;

    public List<Pedido> listar() {
        return pedidoRepository.findAll();
    }

    public Pedido buscarPorId(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
    }

    // Agregamos @Transactional y el parámetro de región
    @Transactional
    public Pedido crear(Pedido pedido, String regionDestino) {
        if (pedido.getFechaCreacion() == null) {
            pedido.setFechaCreacion(OffsetDateTime.now());
        }

        if (pedido.getDetalles() != null) {
            for (DetallePedido d : pedido.getDetalles()) {
                d.setPedido(pedido);

                // Consumimos el endpoint de inventario
                inventarioClient.descontarStock(d.getIdProducto(), d.getCantidad(), regionDestino);
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