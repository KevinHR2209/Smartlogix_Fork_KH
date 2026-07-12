package com.smartlogix.msventas.service;

import com.smartlogix.msventas.client.ClienteClient;
import com.smartlogix.msventas.client.InventarioClient;
import com.smartlogix.msventas.model.DetallePedido;
import com.smartlogix.msventas.model.Pedido;
import com.smartlogix.msventas.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final InventarioClient inventarioClient;
    private final ClienteClient clienteClient;

    public List<Pedido> listar() {
        return pedidoRepository.findAll();
    }

    public Pedido buscarPorId(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Pedido con id " + id + " no encontrado"));
    }

    @Transactional
    public Pedido crear(Pedido pedido, String regionDestino) {

        // ── Validar cliente ──────────────────────────────────────────────────
        try {
            clienteClient.validarCliente(pedido.getIdCliente());
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cliente con id " + pedido.getIdCliente() + " no existe");
        } catch (HttpClientErrorException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Error al validar cliente: " + e.getStatusCode());
        } catch (HttpServerErrorException | ResourceAccessException e) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Servicio de clientes no disponible. Intente nuevamente.");
        }

        if (pedido.getFechaCreacion() == null) {
            pedido.setFechaCreacion(OffsetDateTime.now());
        }

        // ── Descontar stock por cada detalle (usando idPresentacion) ─────────
        if (pedido.getDetalles() != null) {
            for (DetallePedido d : pedido.getDetalles()) {
                d.setPedido(pedido);
                try {
                    inventarioClient.descontarStock(d.getIdPresentacion(), d.getCantidad(), regionDestino);
                } catch (HttpClientErrorException.NotFound e) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Presentación con id " + d.getIdPresentacion() + " no encontrada en inventario");
                } catch (HttpClientErrorException.UnprocessableEntity e) {
                    throw new ResponseStatusException(
                            HttpStatus.UNPROCESSABLE_ENTITY,
                            "Stock insuficiente para la presentación con id " + d.getIdPresentacion());
                } catch (HttpClientErrorException e) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Error al descontar stock de la presentación " + d.getIdPresentacion()
                                    + ": " + e.getStatusCode());
                } catch (HttpServerErrorException | ResourceAccessException e) {
                    throw new ResponseStatusException(
                            HttpStatus.SERVICE_UNAVAILABLE,
                            "Servicio de inventario no disponible. Intente nuevamente.");
                }
            }
        }

        return pedidoRepository.save(pedido);
    }

    public Pedido cambiarEstado(Long id, String estado) {
        Pedido pedido = buscarPorId(id);
        pedido.setEstadoPedido(estado);
        return pedidoRepository.save(pedido);
    }

    // ── Transacción Compensatoria (Limpiador / Error de pago) ───────────────
    @Transactional
    public void cancelarPedidoYLiberarStock(Long idPedido) {
        Pedido pedido = buscarPorId(idPedido);

        if ("PENDIENTE_PAGO".equals(pedido.getEstadoPedido())) {
            pedido.setEstadoPedido("CANCELADO");
            pedidoRepository.save(pedido);

            if (pedido.getDetalles() != null) {
                for (DetallePedido detalle : pedido.getDetalles()) {
                    try {
                        inventarioClient.liberarStock(detalle.getIdPresentacion(), detalle.getCantidad());
                        log.info("Stock liberado para la presentación {} del pedido {}", detalle.getIdPresentacion(), idPedido);
                    } catch (Exception e) {
                        log.error("Fallo al liberar stock en ms_inventario para presentación {}", detalle.getIdPresentacion(), e);
                    }
                }
            }
        }
    }
}