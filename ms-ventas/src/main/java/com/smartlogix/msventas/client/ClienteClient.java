package com.smartlogix.msventas.client;

import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

// Un record rápido para mapear la respuesta (solo tomaremos los datos que nos interesan)
record ClienteDto(Long idCliente, String rut, String nombre) {}

@Component
public class ClienteClient {

    private final RestClient restClient;

    public ClienteClient() {
        this.restClient = RestClient.builder()
                // Apuntamos al contenedor de clientes en su puerto interno
                .baseUrl("http://ms--clientes:8082/api/clientes")
                .build();
    }

    public void validarCliente(Long idCliente) {
        restClient.get()
                .uri("/{id}", idCliente)
                .retrieve()
                // Si ms-clientes nos responde con un 404 (Not Found), lanzamos un error claro
                .onStatus(HttpStatusCode::is4xxClientError, (request, response) -> {
                    throw new RuntimeException("Error en ms-ventas: El cliente con ID " + idCliente + " no existe.");
                })
                // Si responde 200 OK, consumimos el body y terminamos exitosamente
                .body(ClienteDto.class);
    }
}