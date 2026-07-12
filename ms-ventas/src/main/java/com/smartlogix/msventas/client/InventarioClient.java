package com.smartlogix.msventas.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

// DTOs auxiliares
record DescuentoStockRequest(Integer cantidad, String regionDestino) {}
record LiberacionStockRequest(Integer cantidad) {}
record CantidadRequest(Integer cantidad) {}
record PresentacionResponse(Long idPresentacion, BigDecimal precioActual) {}

@Component
public class InventarioClient {

    private final RestClient restClient;

    public InventarioClient(@Value("${inventario.service.url:http://ms-inventario:8081}") String baseUrl) {
        this.restClient = RestClient.builder()
                // Apuntamos al controlador de presentaciones
                .baseUrl(baseUrl + "/api/presentaciones")
                .build();
    }

    // ── NUEVO: Obtener precio real de la presentación ──
    public PresentacionResponse obtenerPresentacion(Long idPresentacion) {
        try {
            return restClient.get()
                    .uri("/{id}", idPresentacion)
                    .retrieve()
                    .body(PresentacionResponse.class);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Error al obtener la presentación " + idPresentacion + " desde el inventario.");
        }
    }

    // ── NUEVO: Reservar stock para el checkout ──
    public void reservarStock(Long idPresentacion, Integer cantidad) {
        CantidadRequest body = new CantidadRequest(cantidad);
        try {
            restClient.put()
                    .uri("/{id}/reservar-stock", idPresentacion)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
        } catch (org.springframework.web.client.HttpClientErrorException.UnprocessableEntity e) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Stock insuficiente para la presentación con id " + idPresentacion);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Error al reservar stock en inventario para la presentación " + idPresentacion);
        }
    }

    public void descontarStock(Long idPresentacion, Integer cantidad, String regionDestino) {
        DescuentoStockRequest body = new DescuentoStockRequest(cantidad, regionDestino);
        try {
            restClient.put()
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

    public void liberarStock(Long idPresentacion, Integer cantidad) {
        LiberacionStockRequest body = new LiberacionStockRequest(cantidad);
        try {
            restClient.put()
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