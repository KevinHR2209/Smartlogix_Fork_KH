package com.smartlogix.msventas.client;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

// Definimos un registro rápido para el cuerpo del JSON
record DescuentoStockRequest(Integer cantidad, String regionDestino) {}

@Component
public class InventarioClient {

    private final RestClient restClient;

    public InventarioClient() {
        this.restClient = RestClient.builder()
                // La URL usa el nombre del contenedor definido en docker-compose
                .baseUrl("http://ms--inventario:8081/api/productos")
                .build();
    }

    public void descontarStock(Long idProducto, Integer cantidad, String regionDestino) {
        DescuentoStockRequest body = new DescuentoStockRequest(cantidad, regionDestino);

        restClient.put()
                .uri("/{id}/descontar-stock", idProducto)
                .body(body)
                .retrieve()
                .toBodilessEntity();
    }
}