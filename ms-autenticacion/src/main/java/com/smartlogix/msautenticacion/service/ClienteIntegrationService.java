package com.smartlogix.msautenticacion.service;

import com.smartlogix.msautenticacion.dto.ClienteSyncRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
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

            if (e.getStatusCode() == HttpStatus.CONFLICT) {
                log.warn("Cliente ya existía en ms-clientes para idUsuarioAuth={}",
                        request.getIdUsuarioAuth());
                return;
            }

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