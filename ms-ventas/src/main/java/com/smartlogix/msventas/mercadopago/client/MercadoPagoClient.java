package com.smartlogix.msventas.mercadopago.client;

import com.smartlogix.msventas.mercadopago.dto.MercadoPagoDto.PagoResponse;
import com.smartlogix.msventas.mercadopago.dto.MercadoPagoDto.PreferenciaRequest;
import com.smartlogix.msventas.mercadopago.dto.MercadoPagoDto.PreferenciaResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

/**
 * Cliente hacia la API REST de Mercado Pago. Usa el access token configurado
 * en mercadopago.access-token (variable de entorno MERCADOPAGO_ACCESS_TOKEN).
 *
 * IMPORTANTE: este cliente esta pensado para trabajar con credenciales de
 * PRUEBA (las que empiezan con "TEST-"), que Mercado Pago provee gratis en
 * su panel de desarrolladores para simular pagos sin mover dinero real.
 * Ver README-MERCADOPAGO.md para como obtenerlas.
 */
@Component
public class MercadoPagoClient {

    private final RestClient restClient;
    private final String accessToken;

    public MercadoPagoClient(
            @Value("${mercadopago.base-url:https://api.mercadopago.com}") String baseUrl,
            @Value("${mercadopago.access-token:}") String accessToken
    ) {
        this.accessToken = accessToken;
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public PreferenciaResponse crearPreferencia(PreferenciaRequest request) {
        validarTokenConfigurado();
        try {
            return restClient.post()
                    .uri("/checkout/preferences")
                    .header("Authorization", "Bearer " + accessToken)
                    .body(request)
                    .retrieve()
                    .body(PreferenciaResponse.class);
        } catch (HttpClientErrorException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Mercado Pago rechazo la creacion de la preferencia: "
                            + e.getStatusCode() + " " + e.getResponseBodyAsString());
        } catch (HttpServerErrorException | ResourceAccessException e) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "No se pudo contactar a Mercado Pago. Intente nuevamente.");
        }
    }

    public PagoResponse obtenerPago(String idPagoMercadoPago) {
        validarTokenConfigurado();
        try {
            return restClient.get()
                    .uri("/v1/payments/{id}", idPagoMercadoPago)
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .body(PagoResponse.class);
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Pago " + idPagoMercadoPago + " no existe en Mercado Pago");
        } catch (HttpClientErrorException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Error al consultar el pago en Mercado Pago: " + e.getStatusCode());
        } catch (HttpServerErrorException | ResourceAccessException e) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "No se pudo contactar a Mercado Pago. Intente nuevamente.");
        }
    }

    private void validarTokenConfigurado() {
        if (accessToken == null || accessToken.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "MERCADOPAGO_ACCESS_TOKEN no esta configurado. Ver README-MERCADOPAGO.md");
        }
    }
}
