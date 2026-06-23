package com.smartlogix.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.contract.wiremock.AutoConfigureWireMock;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.reactive.server.WebTestClient;

import static com.github.tomakehurst.wiremock.client.WireMock.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWireMock(port = 0)
@TestPropertySource(properties = {
        "URL_MS_INVENTARIO=http://localhost:${wiremock.server.port}",
        "URL_MS_VENTAS=http://localhost:${wiremock.server.port}",
        "URL_MS_CLIENTES=http://localhost:${wiremock.server.port}",
        "URL_MS_LOGISTICA=http://localhost:${wiremock.server.port}"
})
class GatewayRoutesTest {

    @Autowired
    private WebTestClient webTestClient;

    // ─────────────────────────────────────────────
    // INVENTARIO: /api/productos/** y /api/bodegas/**
    // ─────────────────────────────────────────────

    @Test
    void rutaProductos_debeEnrutarAMsInventario() {
        stubFor(get(urlPathEqualTo("/api/productos"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("[{\"idProducto\":1,\"nombre\":\"Producto Test\"}]")));

        webTestClient.get().uri("/api/productos")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$[0].idProducto").isEqualTo(1);
    }

    @Test
    void rutaBodegas_debeEnrutarAMsInventario() {
        stubFor(get(urlPathEqualTo("/api/bodegas"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("[{\"idBodega\":1,\"nombre\":\"Bodega Central\"}]")));

        webTestClient.get().uri("/api/bodegas")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$[0].idBodega").isEqualTo(1);
    }

    // ─────────────────────────────────────────────
    // VENTAS: /api/pedidos/** y /api/pagos/**
    // ─────────────────────────────────────────────

    @Test
    void rutaPedidos_debeEnrutarAMsVentas() {
        stubFor(get(urlPathEqualTo("/api/pedidos"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("[{\"idPedido\":1,\"estadoPedido\":\"PAGADO\"}]")));

        webTestClient.get().uri("/api/pedidos")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$[0].idPedido").isEqualTo(1);
    }

    @Test
    void rutaPagos_debeEnrutarAMsVentas() {
        stubFor(get(urlPathEqualTo("/api/pagos"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("[{\"idPago\":1}]")));

        webTestClient.get().uri("/api/pagos")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$[0].idPago").isEqualTo(1);
    }

    // ─────────────────────────────────────────────
    // CLIENTES: /api/clientes/**
    // ─────────────────────────────────────────────

    @Test
    void rutaClientes_debeEnrutarAMsClientes() {
        stubFor(get(urlPathEqualTo("/api/clientes"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("[{\"idCliente\":1,\"nombre\":\"Cliente Test\"}]")));

        webTestClient.get().uri("/api/clientes")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$[0].idCliente").isEqualTo(1);
    }

    @Test
    void rutaClientes_conId_debeEnrutarCorrectamente() {
        stubFor(get(urlPathEqualTo("/api/clientes/5"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("{\"idCliente\":5,\"nombre\":\"Cliente Test\"}")));

        webTestClient.get().uri("/api/clientes/5")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.idCliente").isEqualTo(5);
    }

    // ─────────────────────────────────────────────
    // LOGISTICA: /api/despachos/** y /api/transportistas/**
    // ─────────────────────────────────────────────

    @Test
    void rutaDespachos_debeEnrutarAMsLogistica() {
        stubFor(get(urlPathEqualTo("/api/despachos"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("[{\"idDespacho\":1}]")));

        webTestClient.get().uri("/api/despachos")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$[0].idDespacho").isEqualTo(1);
    }

    @Test
    void rutaTransportistas_debeEnrutarAMsLogistica() {
        stubFor(get(urlPathEqualTo("/api/transportistas"))
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody("[{\"idTransportista\":1}]")));

        webTestClient.get().uri("/api/transportistas")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$[0].idTransportista").isEqualTo(1);
    }

    // ─────────────────────────────────────────────
    // CIRCUIT BREAKER: fallback cuando el servicio falla
    // ─────────────────────────────────────────────

    @Test
    void circuitBreaker_inventario_debeDevolverFallback() {
        stubFor(get(urlPathEqualTo("/api/productos"))
                .willReturn(aResponse().withStatus(500)));

        webTestClient.get().uri("/api/productos")
                .exchange()
                .expectStatus().is5xxServerError();
    }

    @Test
    void circuitBreaker_clientes_debeDevolverFallback() {
        stubFor(get(urlPathEqualTo("/api/clientes"))
                .willReturn(aResponse().withStatus(500)));

        webTestClient.get().uri("/api/clientes")
                .exchange()
                .expectStatus().is5xxServerError();
    }

    // ─────────────────────────────────────────────
    // CORS: OPTIONS debe responder con headers correctos
    // ─────────────────────────────────────────────

    @Test
    void cors_debePeticionOptionsResponderOk() {
        webTestClient.options().uri("/api/clientes")
                .header("Origin", "http://localhost:3000")
                .header("Access-Control-Request-Method", "GET")
                .exchange()
                .expectStatus().isOk()
                .expectHeader()
                .valueMatches("Access-Control-Allow-Origin", "http://localhost:3000");
    }

    // ─────────────────────────────────────────────
    // RUTA INEXISTENTE: debe devolver 404
    // ─────────────────────────────────────────────

    @Test
    void rutaInexistente_debeDevolverNotFound() {
        webTestClient.get().uri("/api/no-existe")
                .exchange()
                .expectStatus().isNotFound();
    }
}