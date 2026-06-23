package com.smartlogix.msventas.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

record DescuentoStockRequest(Integer cantidad, String regionDestino) {}

@Component
public class InventarioClient {

    private final RestClient restClient;

    public InventarioClient(@Value("${inventario.service.url:http://ms--inventario:8081}") String baseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl + "/api/productos")
                .build();
    }

    public void descontarStock(Long idProducto, Integer cantidad, String regionDestino) {
        DescuentoStockRequest body = new DescuentoStockRequest(cantidad, regionDestino);
        try {
            restClient.put()
                    .uri("/{id}/descontar-stock", idProducto)
                    .body(body)
                    .retrieve()
                    .toBodilessEntity();
        } catch (org.springframework.web.client.HttpClientErrorException.NotFound e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Producto con id " + idProducto + " no encontrado en inventario");
        } catch (org.springframework.web.client.HttpClientErrorException.UnprocessableEntity e) {
            throw new ResponseStatusException(
                    HttpStatus.UNPROCESSABLE_ENTITY,
                    "Stock insuficiente para producto con id " + idProducto);
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Error en inventario para producto " + idProducto + ": " + e.getStatusCode());
        } catch (org.springframework.web.client.HttpServerErrorException |
                 org.springframework.web.client.ResourceAccessException e) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Servicio de inventario no disponible");
        }
    }
}