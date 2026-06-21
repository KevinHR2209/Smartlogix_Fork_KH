package com.smartlogix.msventas.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlogix.msventas.model.Pedido;
import com.smartlogix.msventas.service.PedidoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PedidoController.class)
class PedidoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PedidoService service;

    @Autowired
    private ObjectMapper objectMapper;

    private Pedido pedido;

    @BeforeEach
    void setUp() {
        pedido = new Pedido();
        pedido.setIdPedido(1L);
        pedido.setEstadoPedido("PENDIENTE");
    }

    @Test
    void listar_debeRetornar200() throws Exception {
        when(service.listar()).thenReturn(Arrays.asList(pedido));
        mockMvc.perform(get("/api/pedidos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].idPedido").value(1));
    }

    @Test
    void listar_listaVacia_debeRetornar200() throws Exception {
        when(service.listar()).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/pedidos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void buscarPorId_debeRetornar200() throws Exception {
        when(service.buscarPorId(1L)).thenReturn(pedido);
        mockMvc.perform(get("/api/pedidos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idPedido").value(1));
    }

    @Test
    void buscarPorId_otroId_debeRetornar200() throws Exception {
        Pedido otro = new Pedido();
        otro.setIdPedido(2L);
        otro.setEstadoPedido("ENTREGADO");
        when(service.buscarPorId(2L)).thenReturn(otro);
        mockMvc.perform(get("/api/pedidos/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idPedido").value(2));
    }

    @Test
    void crear_debeRetornar201() throws Exception {
        when(service.crear(any(Pedido.class))).thenReturn(pedido);
        mockMvc.perform(post("/api/pedidos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(pedido)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idPedido").value(1));
    }

    @Test
    void crear_conEstadoDiferente_debeRetornar201() throws Exception {
        Pedido nuevo = new Pedido();
        nuevo.setIdPedido(3L);
        nuevo.setEstadoPedido("EN_PROCESO");
        when(service.crear(any(Pedido.class))).thenReturn(nuevo);
        mockMvc.perform(post("/api/pedidos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevo)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idPedido").value(3));
    }

    @Test
    void cambiarEstado_debeRetornar200() throws Exception {
        when(service.cambiarEstado(eq(1L), any(String.class))).thenReturn(pedido);
        mockMvc.perform(put("/api/pedidos/1/estado")
                .param("estado", "ENTREGADO")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void cambiarEstado_otroEstado_debeRetornar200() throws Exception {
        Pedido cancelado = new Pedido();
        cancelado.setIdPedido(1L);
        cancelado.setEstadoPedido("CANCELADO");
        when(service.cambiarEstado(eq(1L), eq("CANCELADO"))).thenReturn(cancelado);
        mockMvc.perform(put("/api/pedidos/1/estado")
                .param("estado", "CANCELADO")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoPedido").value("CANCELADO"));
    }
}