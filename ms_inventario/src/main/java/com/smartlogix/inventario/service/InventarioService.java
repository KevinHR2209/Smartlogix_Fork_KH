package com.smartlogix.inventario.service;

import com.smartlogix.inventario.dto.*;
import com.smartlogix.inventario.entity.*;
import com.smartlogix.inventario.exception.ResourceNotFoundException;
import com.smartlogix.inventario.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventarioService {

    private final InventarioRepository inventarioRepository;
    private final BodegaService bodegaService;
    private final PresentacionPerfumeService presentacionService;
    private final MovimientoInventarioRepository movimientoRepository;

    public List<InventarioResponse> listarPorPresentacion(Long idPresentacion) {
        return inventarioRepository.findByPresentacionIdPresentacion(idPresentacion).stream()
                .map(this::toResponse)
                .toList();
    }

    public List<InventarioResponse> listarPorBodega(Integer idBodega) {
        return inventarioRepository.findByBodegaIdBodega(idBodega).stream()
                .map(this::toResponse)
                .toList();
    }

    public InventarioResponse buscarPorId(Long id) {
        return toResponse(obtenerEntidad(id));
    }

    @Transactional
    public InventarioResponse crear(InventarioRequest request) {
        inventarioRepository
                .findByPresentacionIdPresentacionAndBodegaIdBodega(
                        request.getIdPresentacion(), request.getIdBodega())
                .ifPresent(inv -> {
                    throw new RuntimeException("Ya existe inventario para esa presentación en esa bodega");
                });

        Bodega bodega = bodegaService.obtenerEntidadParaUso(request.getIdBodega());
        PresentacionPerfume presentacion = presentacionService.obtenerEntidadParaUso(request.getIdPresentacion());

        Inventario inventario = new Inventario();
        inventario.setBodega(bodega);
        inventario.setPresentacion(presentacion);
        inventario.setStockDisponible(request.getStockDisponible());
        inventario.setStockReservado(request.getStockReservado());
        inventario.setStockMinimo(request.getStockMinimo());
        inventario.setUltimaActualizacion(OffsetDateTime.now());

        Inventario guardado = inventarioRepository.save(inventario);

        registrarMovimiento("ENTRADA", presentacion, null, bodega,
                request.getStockDisponible(), null, "Stock inicial", null);

        return toResponse(guardado);
    }

    @Transactional
    public InventarioResponse ajustarStock(Long idInventario, AjusteStockRequest request) {
        Inventario inventario = obtenerEntidad(idInventario);

        int nuevoStock = inventario.getStockDisponible() + request.getCantidad();
        if (nuevoStock < 0) {
            throw new RuntimeException("El stock disponible no puede quedar negativo");
        }

        inventario.setStockDisponible(nuevoStock);
        inventario.setUltimaActualizacion(OffsetDateTime.now());

        String tipo = request.getCantidad() >= 0 ? "ENTRADA" : "SALIDA";
        registrarMovimiento(tipo, inventario.getPresentacion(),
                request.getCantidad() < 0 ? inventario.getBodega() : null,
                request.getCantidad() >= 0 ? inventario.getBodega() : null,
                Math.abs(request.getCantidad()), null, "Ajuste manual", null);

        return toResponse(inventarioRepository.save(inventario));
    }

    @Transactional
    public InventarioResponse reservarStock(Long idInventario, CantidadRequest request) {
        Inventario inventario = obtenerEntidad(idInventario);

        if (inventario.getStockDisponible() < request.getCantidad()) {
            throw new RuntimeException("Stock disponible insuficiente para reservar");
        }

        inventario.setStockDisponible(inventario.getStockDisponible() - request.getCantidad());
        inventario.setStockReservado(inventario.getStockReservado() + request.getCantidad());
        inventario.setUltimaActualizacion(OffsetDateTime.now());

        return toResponse(inventarioRepository.save(inventario));
    }

    @Transactional
    public InventarioResponse liberarReserva(Long idInventario, CantidadRequest request) {
        Inventario inventario = obtenerEntidad(idInventario);

        if (inventario.getStockReservado() < request.getCantidad()) {
            throw new RuntimeException("Stock reservado insuficiente para liberar");
        }

        inventario.setStockReservado(inventario.getStockReservado() - request.getCantidad());
        inventario.setStockDisponible(inventario.getStockDisponible() + request.getCantidad());
        inventario.setUltimaActualizacion(OffsetDateTime.now());

        return toResponse(inventarioRepository.save(inventario));
    }

    @Transactional
    public InventarioResponse descontarStockReservado(Long idInventario, CantidadRequest request) {
        Inventario inventario = obtenerEntidad(idInventario);

        if (inventario.getStockReservado() < request.getCantidad()) {
            throw new RuntimeException("Stock reservado insuficiente para descontar");
        }

        inventario.setStockReservado(inventario.getStockReservado() - request.getCantidad());
        inventario.setUltimaActualizacion(OffsetDateTime.now());

        registrarMovimiento("SALIDA", inventario.getPresentacion(),
                inventario.getBodega(), null,
                request.getCantidad(), null, "Descuento por venta confirmada", null);

        return toResponse(inventarioRepository.save(inventario));
    }

    @Transactional
    public void transferirStock(TransferenciaStockRequest request) {
        if (request.getIdBodegaOrigen().equals(request.getIdBodegaDestino())) {
            throw new RuntimeException("La bodega origen y destino no pueden ser la misma");
        }

        Inventario origen = inventarioRepository
                .findByPresentacionIdPresentacionAndBodegaIdBodega(
                        request.getIdPresentacion(), request.getIdBodegaOrigen())
                .orElseThrow(() -> new RuntimeException(
                        "No existe inventario de la presentación en la bodega origen"));

        if (origen.getStockDisponible() < request.getCantidad()) {
            throw new RuntimeException("Stock disponible insuficiente en la bodega origen");
        }

        Inventario destino = inventarioRepository
                .findByPresentacionIdPresentacionAndBodegaIdBodega(
                        request.getIdPresentacion(), request.getIdBodegaDestino())
                .orElseGet(() -> crearInventarioDestino(request));

        origen.setStockDisponible(origen.getStockDisponible() - request.getCantidad());
        origen.setUltimaActualizacion(OffsetDateTime.now());

        destino.setStockDisponible(destino.getStockDisponible() + request.getCantidad());
        destino.setUltimaActualizacion(OffsetDateTime.now());

        inventarioRepository.save(origen);
        inventarioRepository.save(destino);

        registrarMovimiento("TRANSFERENCIA", origen.getPresentacion(),
                origen.getBodega(), destino.getBodega(),
                request.getCantidad(), null,
                request.getObservacion(), request.getUsuarioResponsable());
    }

    // Llamado desde ms-ventas vía InventarioClient
    @Transactional
    public void descontarStockGeolocalizado(Long idPresentacion, Integer cantidad, String regionDestino) {
        List<Inventario> stocks = inventarioRepository
                .findByPresentacionIdPresentacion(idPresentacion);

        int stockTotal = stocks.stream().mapToInt(Inventario::getStockDisponible).sum();
        if (stockTotal < cantidad) {
            throw new RuntimeException("Stock insuficiente para la presentación ID: " + idPresentacion);
        }

        // Prioriza bodega más cercana a la región de destino
        stocks.sort((a, b) -> {
            String regionA = a.getBodega().getDireccionBodega().getComuna()
                    .getProvincia().getRegion().getNombreRegion();
            return regionA.equalsIgnoreCase(regionDestino) ? -1 : 1;
        });

        int restante = cantidad;
        PresentacionPerfume presentacion = stocks.get(0).getPresentacion();
        Bodega bodegaOrigen = null;

        for (Inventario inv : stocks) {
            if (restante == 0) break;
            int disponible = inv.getStockDisponible();
            if (disponible > 0) {
                int aDescontar = Math.min(disponible, restante);
                inv.setStockDisponible(disponible - aDescontar);
                inv.setUltimaActualizacion(OffsetDateTime.now());
                inventarioRepository.save(inv);
                bodegaOrigen = inv.getBodega();
                restante -= aDescontar;
            }
        }

        registrarMovimiento("SALIDA", presentacion, bodegaOrigen, null,
                cantidad, null, "Descuento por pedido - región: " + regionDestino, null);
    }

    // ── Movimientos ──────────────────────────────────────────────────────────

    public List<MovimientoResponse> listarMovimientosPorPresentacion(Long idPresentacion) {
        return movimientoRepository.findByPresentacionIdPresentacion(idPresentacion).stream()
                .map(this::toMovimientoResponse)
                .toList();
    }

    // ── Privados ─────────────────────────────────────────────────────────────

    private void registrarMovimiento(String tipo, PresentacionPerfume presentacion,
                                     Bodega origen, Bodega destino,
                                     Integer cantidad, Long idPedido,
                                     String observacion, String usuario) {
        MovimientoInventario mov = new MovimientoInventario();
        mov.setTipoMovimiento(tipo);
        mov.setPresentacion(presentacion);
        mov.setBodegaOrigen(origen);
        mov.setBodegaDestino(destino);
        mov.setCantidad(cantidad);
        mov.setIdPedido(idPedido);
        mov.setObservacion(observacion);
        mov.setUsuarioResponsable(usuario);
        mov.setFechaMovimiento(OffsetDateTime.now());
        movimientoRepository.save(mov);
    }

    private Inventario crearInventarioDestino(TransferenciaStockRequest request) {
        PresentacionPerfume presentacion = presentacionService.obtenerEntidadParaUso(request.getIdPresentacion());
        Bodega bodegaDestino = bodegaService.obtenerEntidadParaUso(request.getIdBodegaDestino());

        Inventario nuevo = new Inventario();
        nuevo.setPresentacion(presentacion);
        nuevo.setBodega(bodegaDestino);
        nuevo.setStockDisponible(0);
        nuevo.setStockReservado(0);
        nuevo.setStockMinimo(5);
        nuevo.setUltimaActualizacion(OffsetDateTime.now());
        return inventarioRepository.save(nuevo);
    }

    private Inventario obtenerEntidad(Long id) {
        return inventarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventario", id));
    }

    private InventarioResponse toResponse(Inventario inv) {
        PresentacionPerfume pr = inv.getPresentacion();
        return InventarioResponse.builder()
                .idInventario(inv.getIdInventario())
                .idBodega(inv.getBodega().getIdBodega())
                .nombreBodega(inv.getBodega().getNombre())
                .idPresentacion(pr.getIdPresentacion())
                .volumenMl(pr.getVolumenMl())
                .tipoEnvase(pr.getTipoEnvase())
                .precioActual(pr.getPrecioActual())
                .idPerfume(pr.getPerfume().getIdPerfume())
                .nombrePerfume(pr.getPerfume().getNombre())
                .stockDisponible(inv.getStockDisponible())
                .stockReservado(inv.getStockReservado())
                .stockMinimo(inv.getStockMinimo())
                .stockBajo(inv.getStockDisponible() <= inv.getStockMinimo())
                .ultimaActualizacion(inv.getUltimaActualizacion())
                .build();
    }

    private MovimientoResponse toMovimientoResponse(MovimientoInventario m) {
        return MovimientoResponse.builder()
                .idMovimiento(m.getIdMovimiento())
                .tipoMovimiento(m.getTipoMovimiento())
                .idPresentacion(m.getPresentacion().getIdPresentacion())
                .nombrePerfume(m.getPresentacion().getPerfume().getNombre())
                .volumenMl(m.getPresentacion().getVolumenMl())
                .idBodegaOrigen(m.getBodegaOrigen() != null ? m.getBodegaOrigen().getIdBodega() : null)
                .nombreBodegaOrigen(m.getBodegaOrigen() != null ? m.getBodegaOrigen().getNombre() : null)
                .idBodegaDestino(m.getBodegaDestino() != null ? m.getBodegaDestino().getIdBodega() : null)
                .nombreBodegaDestino(m.getBodegaDestino() != null ? m.getBodegaDestino().getNombre() : null)
                .cantidad(m.getCantidad())
                .idPedido(m.getIdPedido())
                .observacion(m.getObservacion())
                .fechaMovimiento(m.getFechaMovimiento())
                .usuarioResponsable(m.getUsuarioResponsable())
                .build();
    }
    @Transactional
    public void liberarStockPorPresentacion(Long idPresentacion, Integer cantidad) {
        List<Inventario> stocks = inventarioRepository
                .findByPresentacionIdPresentacion(idPresentacion);

        if (stocks.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "No existe inventario para la presentación ID: " + idPresentacion);
        }

        // Devuelve el stock al primer inventario disponible (el mismo que se descontó)
        int restante = cantidad;
        for (Inventario inv : stocks) {
            if (restante == 0) break;
            inv.setStockDisponible(inv.getStockDisponible() + restante);
            inv.setUltimaActualizacion(OffsetDateTime.now());
            inventarioRepository.save(inv);
            restante = 0;
        }

        registrarMovimiento("ENTRADA", stocks.get(0).getPresentacion(),
                null, stocks.get(0).getBodega(),
                cantidad, null, "Liberación de stock por cancelación de pedido", null);
    }
    @Transactional
    public void reservarStockPorPresentacion(Long idPresentacion, Integer cantidad) {
        List<Inventario> stocks = inventarioRepository
                .findByPresentacionIdPresentacion(idPresentacion);

        if (stocks.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "No existe inventario para la presentación ID: " + idPresentacion);
        }

        // Reservar del primer inventario disponible
        Inventario inv = stocks.get(0);
        if (inv.getStockDisponible() < cantidad) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Stock insuficiente para la presentación ID: " + idPresentacion);
        }

        inv.setStockDisponible(inv.getStockDisponible() - cantidad);
        inv.setStockReservado(inv.getStockReservado() + cantidad);
        inv.setUltimaActualizacion(OffsetDateTime.now());
        inventarioRepository.save(inv);
    }
}