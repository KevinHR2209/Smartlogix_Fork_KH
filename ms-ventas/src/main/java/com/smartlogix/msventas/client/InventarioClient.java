package com.smartlogix.msventas.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import com.smartlogix.msventas.dto.PresentacionResponse;

// DTOs auxiliares
record DescuentoStockRequest(Integer cantidad, String regionDestino) {}
record LiberacionStockRequest(Integer cantidad) {}
record CantidadRequest(Integer cantidad) {}

@Component
public class InventarioClient {

    private final RestClient restClientPresentaciones;
    private final RestClient restClientInventario;

    public InventarioClient(@Value("${inventario.service.url:http://ms-inventario:8081}") String baseUrl) {
        this.restClientPresentaciones = RestClient.builder()
                .baseUrl(baseUrl + "/api/presentaciones")
                .build();

        this.restClientInventario = RestClient.builder()
                .baseUrl(baseUrl + "/api/inventario")
                .build();
    }

    // ── Obtener precio real de la presentación ──
    public PresentacionResponse obtenerPresentacion(Long idPresentacion) {
        try {
            return restClientPresentaciones.get()
                    .uri("/{id}", idPresentacion)
                    .retrieve()
                    .body(PresentacionResponse.class);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Error al obtener la presentación " + idPresentacion + " desde el inventario.");
        }
    }

    // ── Reservar stock (usa el endpoint /api/inventario/{id}/reservar) ──
    // NOTA: Necesitas el ID de inventario, no el de presentación
    // Si solo tienes idPresentacion, busca el inventario primero
    public void reservarStock(Long idInventario, Integer cantidad) {
        CantidadRequest body = new CantidadRequest(cantidad);
        try {
            restClientInventario.put()
                    .uri("/{id}/reservar", idInventario)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
        } catch (org.springframework.web.client.HttpClientErrorException.UnprocessableEntity e) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Stock insuficiente para el inventario " + idInventario);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Error al reservar stock en inventario: " + idInventario);
        }
    }

    // ── Descontar stock (endpoint en /api/presentaciones/{id}/descontar-stock) ──
    public void descontarStock(Long idPresentacion, Integer cantidad, String regionDestino) {
        DescuentoStockRequest body = new DescuentoStockRequest(cantidad, regionDestino);
        try {
            restClientPresentaciones.put()
                    .uri("/{id}/descontar-stock", idPresentacion)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
        } catch (org.springframework.web.client.HttpClientErrorException.NotFound e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Presentación con id " + idPresentacion + " no encontrada en inventario");
        } catch (org.springframework.web.client.HttpClientErrorException.UnprocessableEntity e) {
            throw new ResponseStatusException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Stock insuficiente para presentación con id " + idPresentacion);
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Error en inventario para presentación " + idPresentacion + ": " + e.getStatusCode());
        } catch (org.springframework.web.client.HttpServerErrorException |
                 org.springframework.web.client.ResourceAccessException e) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Servicio de inventario no disponible");
        }
    }

    // ── Liberar stock (endpoint en /api/presentaciones/{id}/liberar-stock) ──
    public void liberarStock(Long idPresentacion, Integer cantidad) {
        LiberacionStockRequest body = new LiberacionStockRequest(cantidad);
        try {
            restClientPresentaciones.put()
                    .uri("/{id}/liberar-stock", idPresentacion)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "No se pudo liberar el stock de la presentación " + idPresentacion);
        }
    }
}