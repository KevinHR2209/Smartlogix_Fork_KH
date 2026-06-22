package com.smartlogix.mslogistica.client;

import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

// Record para mapear la respuesta (solo para validar que llega algo)
record PedidoDto(Long idPedido, String estadoPedido) {}

@Component
public class VentasClient {

    private final RestClient restClient;

    public VentasClient() {
        this.restClient = RestClient.builder()
                // Apuntamos al contenedor de ventas en su puerto interno (8083)
                .baseUrl("http://ms--ventas:8083/api/pedidos")
                .build();
    }

    public void validarPedido(Long idPedido) {
        if (idPedido == null) {
            throw new IllegalArgumentException("El idPedido no puede ser nulo al crear un despacho.");
        }

        restClient.get()
                .uri("/{id}", idPedido)
                .retrieve()
                // Si ms-ventas responde con 404, lanzamos la excepción y bloqueamos el despacho
                .onStatus(HttpStatusCode::is4xxClientError, (request, response) -> {
                    throw new RuntimeException("Error en ms-logistica: El pedido con ID " + idPedido + " no existe en Ventas.");
                })
                .body(PedidoDto.class);
    }
}