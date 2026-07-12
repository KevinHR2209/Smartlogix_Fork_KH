package com.smartlogix.msventas.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

// DTO para la petición a logística
record DespachoRequest(Long idPedido, String direccionEntrega, String comunaEntrega, String estadoDespacho) {}

@Component
public class LogisticaClient {

    private final RestClient restClient;

    public LogisticaClient(@Value("${logistica.service.url:http://ms-logistica:8084}") String baseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl + "/api/despachos")
                .build();
    }

    public void crearDespacho(Long idPedido, String direccion, String comuna) {
        DespachoRequest request = new DespachoRequest(idPedido, direccion, comuna, "PENDIENTE");
        try {
            restClient.post()
                    .body(request)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            throw new RuntimeException("Error al comunicarse con ms-logistica para el pedido " + idPedido, e);
        }
    }
}