package com.smartlogix.msventas.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

record ClienteDto(Long idCliente, String rut, String nombre) {}

// DTO DE RESPUESTA
record DireccionClienteResponse(String calle, String numero, String detalle, String comuna) {
    public String getDireccionCompleta() {
        return calle + " " + (numero != null ? numero : "") + " " + (detalle != null ? detalle : "");
    }
}

@Component
public class ClienteClient {

    private final RestClient restClient;

    public ClienteClient(@Value("${clientes.service.url:http://ms-clientes:8082}") String baseUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl + "/api/clientes")
                .build();
    }

    public void validarCliente(Long idCliente) {
        try {
            restClient.get()
                    .uri("/{id}", idCliente)
                    .retrieve()
                    .body(ClienteDto.class);
        } catch (org.springframework.web.client.HttpClientErrorException.NotFound e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cliente con id " + idCliente + " no existe");
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Error al validar cliente: " + e.getStatusCode());
        } catch (org.springframework.web.client.HttpServerErrorException |
                 org.springframework.web.client.ResourceAccessException e) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Servicio de clientes no disponible");
        }
    }

    // RESCATAR DIRECCIÓN
    public DireccionClienteResponse obtenerDireccionPrincipal(Long idCliente) {
        try {
            return restClient.get()
                    .uri("/{id}/direccion-principal", idCliente)
                    .retrieve()
                    .body(DireccionClienteResponse.class);
        } catch (Exception e) {
            throw new RuntimeException("No se pudo obtener la dirección del cliente " + idCliente, e);
        }
    }
}