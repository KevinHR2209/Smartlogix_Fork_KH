package com.smartlogix.msautenticacion.service;

import com.smartlogix.msautenticacion.dto.ClienteSyncRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class ClienteIntegrationService {

    private final RestTemplate restTemplate;

    @Value("${app.clientes.base-url}")
    private String clientesBaseUrl;

    public void crearCliente(ClienteSyncRequest request) {
        String url = clientesBaseUrl + "/api/clientes/desde-auth";

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("No se pudo crear el cliente en ms-clientes");
            }
        } catch (HttpStatusCodeException e) {
            throw new RuntimeException(
                    "Error al crear cliente en ms-clientes. Status: "
                            + e.getStatusCode()
                            + " Body: "
                            + e.getResponseBodyAsString(),
                    e
            );
        }
    }
}