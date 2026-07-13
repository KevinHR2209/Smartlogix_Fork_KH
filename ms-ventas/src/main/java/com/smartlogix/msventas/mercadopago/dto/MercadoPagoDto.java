package com.smartlogix.msventas.mercadopago.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTOs que reflejan el contrato JSON de la API REST de Mercado Pago
 * (Checkout Pro). No es el SDK oficial de Mercado Pago: se llama a la API
 * REST directamente con RestClient, siguiendo el mismo patron que
 * InventarioClient/ClienteClient/LogisticaClient en este microservicio.
 *
 * Referencia del contrato: https://www.mercadopago.cl/developers/es/reference/preferences/_checkout_preferences/post
 */
public class MercadoPagoDto {

    public record ItemRequest(
            String id,
            String title,
            Integer quantity,
            @JsonProperty("unit_price") BigDecimal unitPrice,
            @JsonProperty("currency_id") String currencyId
    ) {}

    public record BackUrls(
            String success,
            String failure,
            String pending
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PreferenciaRequest(
            List<ItemRequest> items,
            @JsonProperty("back_urls") BackUrls backUrls,
            @JsonProperty("notification_url") String notificationUrl,
            @JsonProperty("external_reference") String externalReference
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PreferenciaResponse(
            String id,
            @JsonProperty("init_point") String initPoint,
            @JsonProperty("sandbox_init_point") String sandboxInitPoint,
            @JsonProperty("external_reference") String externalReference
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PagoResponse(
            Long id,
            String status,
            @JsonProperty("status_detail") String statusDetail,
            @JsonProperty("external_reference") String externalReference,
            @JsonProperty("transaction_amount") BigDecimal transactionAmount
    ) {}

    /**
     * Cuerpo de una notificacion webhook de Mercado Pago (formato "webhooks v2").
     * Ejemplo real: {"type": "payment", "data": {"id": "123456789"}}
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record WebhookNotification(
            String type,
            String action,
            Data data
    ) {
        @JsonIgnoreProperties(ignoreUnknown = true)
        public record Data(String id) {}
    }
}
