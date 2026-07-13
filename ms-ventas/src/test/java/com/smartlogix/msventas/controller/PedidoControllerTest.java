package com.smartlogix.msventas.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlogix.msventas.client.ClienteClient;
import com.smartlogix.msventas.dto.DetallePedidoRequest;
import com.smartlogix.msventas.dto.PedidoRequest;
import com.smartlogix.msventas.model.Pedido;
import com.smartlogix.msventas.service.PedidoService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Base64;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PedidoController.class)
class PedidoControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean PedidoService pedidoService;
    @MockBean ClienteClient clienteClient;

    /**
     * Genera un JWT minimo (header.payload.firma) con el correo dado en el claim "sub".
     * No tiene firma real; solo sirve para que TokenUtils.extraerCorreo() pueda decodificar el payload.
     */
    private String jwtParaCorreo(String correo) {
        String header  = Base64.getUrlEncoder().withoutPadding()
                .encodeToString("{\"alg\":\"HS256\"}".getBytes());
        String payload = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(("{\"sub\":\"" + correo + "\"}").getBytes());
        return "Bearer " + header + "." + payload + ".firma";
    }

    // ── VE-06: GET /api/pedidos sin autenticacion → 200 (endpoint publico) ──
    @Test
    @DisplayName("VE-06 GET /api/pedidos no requiere token y retorna lista vacia")
    void listar_sinToken_200() throws Exception {
        when(pedidoService.listar()).thenReturn(List.of());
        mockMvc.perform(get("/api/pedidos"))
                .andExpect(status().isOk());
    }

    // ── VE-07: GET /{id} con JWT del propietario → 200 ──────────────────────
    @Test
    @DisplayName("VE-07 GET /{id} con JWT del dueno del pedido → 200 OK")
    void obtener_tokenPropietario_200() throws Exception {
        Pedido pedido = Pedido.builder()
                .idPedido(1L).idCliente(100L)
                .estadoPedido("PENDIENTE_PAGO").montoTotal(5000L)
                .build();

        when(clienteClient.obtenerIdClientePorCorreo("dueno@test.com")).thenReturn(100L);
        when(pedidoService.buscarPorId(1L)).thenReturn(pedido);

        mockMvc.perform(get("/api/pedidos/1")
                        .header("Authorization", jwtParaCorreo("dueno@test.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idCliente").value(100));
    }

    // ── VE-08: IDOR — GET /{id} con JWT ajeno → 403 FORBIDDEN ───────────────
    @Test
    @DisplayName("VE-08 IDOR GET /{id} con JWT de otro usuario → 403 Forbidden")
    void obtener_tokenAjeno_403() throws Exception {
        Pedido pedido = Pedido.builder()
                .idPedido(1L).idCliente(100L)
                .estadoPedido("PENDIENTE_PAGO").montoTotal(5000L)
                .build();

        // El token pertenece al cliente 200, pero el pedido es del cliente 100
        when(clienteClient.obtenerIdClientePorCorreo("otro@test.com")).thenReturn(200L);
        when(pedidoService.buscarPorId(1L)).thenReturn(pedido);

        mockMvc.perform(get("/api/pedidos/1")
                        .header("Authorization", jwtParaCorreo("otro@test.com")))
                .andExpect(status().isForbidden());
    }

    // ── VE-09: IDOR comentado — GET /cliente/{id} devuelve datos SIN verificar
    @Test
    @DisplayName("VE-09 IDOR comentado: GET /cliente/{id} con JWT ajeno → 200 (vulnerabilidad activa)")
    void listarPorCliente_tokenAjeno_200porIDORcomentado() throws Exception {
        Pedido pedido = Pedido.builder()
                .idPedido(1L).idCliente(100L)
                .estadoPedido("PENDIENTE_PAGO").montoTotal(5000L)
                .build();

        when(clienteClient.obtenerIdClientePorCorreo(anyString())).thenReturn(200L);
        when(pedidoService.listarPorCliente(100L)).thenReturn(List.of(pedido));

        // ⚠️ Mientras el bloque IDOR este comentado en PedidoController, responde 200.
        // TODO: Cuando se reactive el IDOR, cambiar esta expectativa a isForbidden().
        mockMvc.perform(get("/api/pedidos/cliente/100")
                        .header("Authorization", jwtParaCorreo("otro@test.com")))
                .andExpect(status().isOk());
    }

    // ── VE-10: Cancelar pedido propio → 200 ─────────────────────────────────
    @Test
    @DisplayName("VE-10 PUT /{id}/cancelar con JWT del dueno → 200 OK")
    void cancelar_propietario_200() throws Exception {
        Pedido cancelado = Pedido.builder()
                .idPedido(1L).idCliente(100L)
                .estadoPedido("CANCELADO").montoTotal(5000L)
                .build();

        when(pedidoService.buscarPorId(1L)).thenReturn(
                Pedido.builder().idPedido(1L).idCliente(100L)
                        .estadoPedido("PENDIENTE_PAGO").montoTotal(5000L).build()
        );
        when(pedidoService.cancelarPedido(1L)).thenReturn(cancelado);

        mockMvc.perform(put("/api/pedidos/1/cancelar")
                        .header("Authorization", jwtParaCorreo("dueno@test.com")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoPedido").value("CANCELADO"));
    }

    // ── VE-11: IDOR comentado — cancelar pedido ajeno → actualmente 200 ─────
    @Test
    @DisplayName("VE-11 IDOR comentado: cancelar pedido ajeno → 200 (vulnerabilidad activa)")
    void cancelar_tokenAjeno_200porIDORcomentado() throws Exception {
        Pedido cancelado = Pedido.builder()
                .idPedido(2L).idCliente(100L)
                .estadoPedido("CANCELADO").montoTotal(5000L)
                .build();

        when(pedidoService.buscarPorId(2L)).thenReturn(
                Pedido.builder().idPedido(2L).idCliente(100L)
                        .estadoPedido("PENDIENTE_PAGO").montoTotal(5000L).build()
        );
        when(pedidoService.cancelarPedido(2L)).thenReturn(cancelado);

        // ⚠️ Con el IDOR comentado, cualquier usuario autenticado puede cancelar pedidos ajenos.
        // TODO: Cuando se reactive el IDOR, cambiar esta expectativa a isForbidden().
        mockMvc.perform(put("/api/pedidos/2/cancelar")
                        .header("Authorization", jwtParaCorreo("otro@test.com")))
                .andExpect(status().isOk());
    }

    // ── VE-12: PUT /{id}/estado sin token → 200 (endpoint sin proteccion) ────
    @Test
    @DisplayName("VE-12 PUT /{id}/estado sin token → 200 OK (endpoint sin proteccion documentada)")
    void cambiarEstado_sinToken_200() throws Exception {
        when(pedidoService.cambiarEstado(1L, "PAGADO")).thenReturn(
                Pedido.builder().idPedido(1L).estadoPedido("PAGADO").build()
        );

        mockMvc.perform(put("/api/pedidos/1/estado")
                        .param("estado", "PAGADO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoPedido").value("PAGADO"));
    }

    // ── VE-01: POST /api/pedidos → 201 Created ───────────────────────────────
    @Test
    @DisplayName("VE-01 POST /api/pedidos con body valido → 201 Created")
    void crear_pedidoValido_201() throws Exception {
        PedidoRequest req = new PedidoRequest(
                100L,
                List.of(new DetallePedidoRequest(10L, 2))
        );
        Pedido guardado = Pedido.builder()
                .idPedido(1L).idCliente(100L)
                .estadoPedido("PENDIENTE_PAGO").montoTotal(10000L)
                .build();

        when(pedidoService.crear(any())).thenReturn(guardado);

        mockMvc.perform(post("/api/pedidos")
                        .header("Authorization", jwtParaCorreo("dueno@test.com"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estadoPedido").value("PENDIENTE_PAGO"));
    }

    // ── VE-05: POST sin detalles → 400 ──────────────────────────────────────
    @Test
    @DisplayName("VE-05 POST /api/pedidos con lista detalles vacia → 400 Bad Request")
    void crear_sinDetalles_400() throws Exception {
        String body = "{\"idCliente\": 100, \"detalles\": []}";

        mockMvc.perform(post("/api/pedidos")
                        .header("Authorization", jwtParaCorreo("dueno@test.com"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest());
    }
}
