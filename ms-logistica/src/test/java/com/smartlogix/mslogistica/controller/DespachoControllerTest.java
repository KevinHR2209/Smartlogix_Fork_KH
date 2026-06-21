package com.smartlogix.mslogistica.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlogix.mslogistica.model.Despacho;
import com.smartlogix.mslogistica.service.DespachoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Assertions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DespachoController.class)
class DespachoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private DespachoService despachoService;

    private Despacho despachoBase;

    @BeforeEach
    void setUp() {
        despachoBase = new Despacho();
        despachoBase.setIdDespacho(1L);
        despachoBase.setEstadoDespacho("PENDIENTE");
    }

    @Test
    void listar_DebeRetornarStatus200YLista() throws Exception {
        when(despachoService.listar()).thenReturn(Collections.singletonList(despachoBase));

        mockMvc.perform(get("/api/despachos")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].idDespacho").value(1))
                .andExpect(jsonPath("$[0].estadoDespacho").value("PENDIENTE"));
    }

    @Test
    void listar_CuandoNoHayDatos_DebeRetornarStatus200YListaVacia() throws Exception {
        when(despachoService.listar()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/despachos")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    void obtener_CuandoExiste_DebeRetornarStatus200() throws Exception {
        when(despachoService.buscarPorId(1L)).thenReturn(despachoBase);

        mockMvc.perform(get("/api/despachos/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idDespacho").value(1))
                .andExpect(jsonPath("$.estadoDespacho").value("PENDIENTE"));
    }

    @Test
    void obtener_CuandoNoExiste_DebeLanzarRuntimeException() {
        when(despachoService.buscarPorId(999L))
                .thenThrow(new RuntimeException("Despacho no encontrado"));

        Exception ex = Assertions.assertThrows(Exception.class, () -> {
            mockMvc.perform(get("/api/despachos/{id}", 999L)
                    .contentType(MediaType.APPLICATION_JSON));
        });

        Assertions.assertTrue(ex.getMessage().contains("Despacho no encontrado"));
    }

    @Test
    void crear_DebeRetornarStatus201YDespachoCreado() throws Exception {
        when(despachoService.crear(any(Despacho.class))).thenReturn(despachoBase);

        mockMvc.perform(post("/api/despachos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(despachoBase)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idDespacho").value(1))
                .andExpect(jsonPath("$.estadoDespacho").value("PENDIENTE"));
    }

    @Test
    void crear_CuandoBodyEsVacio_IgualDebeRetornar201SiServiceGuarda() throws Exception {
        Despacho vacioGuardado = new Despacho();
        vacioGuardado.setIdDespacho(2L);

        when(despachoService.crear(any(Despacho.class))).thenReturn(vacioGuardado);

        mockMvc.perform(post("/api/despachos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idDespacho").value(2));
    }

    @Test
    void cambiarEstado_DebeRetornarStatus200YDespachoActualizado() throws Exception {
        Despacho despachoActualizado = new Despacho();
        despachoActualizado.setIdDespacho(1L);
        despachoActualizado.setEstadoDespacho("ENTREGADO");

        when(despachoService.cambiarEstado(eq(1L), eq("ENTREGADO"))).thenReturn(despachoActualizado);

        mockMvc.perform(put("/api/despachos/{id}/estado", 1L)
                        .param("estado", "ENTREGADO")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idDespacho").value(1))
                .andExpect(jsonPath("$.estadoDespacho").value("ENTREGADO"));
    }

    @Test
    void cambiarEstado_CuandoServiceLanzaError_DebeLanzarRuntimeException() {
        when(despachoService.cambiarEstado(1L, "INVALIDO"))
                .thenThrow(new RuntimeException("Estado inválido"));

        Exception ex = Assertions.assertThrows(Exception.class, () -> {
            mockMvc.perform(put("/api/despachos/{id}/estado", 1L)
                    .param("estado", "INVALIDO")
                    .contentType(MediaType.APPLICATION_JSON));
        });

        Assertions.assertTrue(ex.getMessage().contains("Estado inválido"));
    }

    @Test
    void cambiarEstado_CuandoFaltaParametroEstado_DebeRetornar400() throws Exception {
        mockMvc.perform(put("/api/despachos/{id}/estado", 1L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    void asignarTransportista_DebeRetornarStatus200() throws Exception {
        when(despachoService.asignarTransportista(1L, 100L)).thenReturn(despachoBase);

        mockMvc.perform(put("/api/despachos/{id}/transportista/{idTransportista}", 1L, 100L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idDespacho").value(1));
    }

    @Test
    void asignarTransportista_CuandoServiceLanzaError_DebeLanzarRuntimeException() {
        when(despachoService.asignarTransportista(999L, 100L))
                .thenThrow(new RuntimeException("Transportista no encontrado"));

        Exception ex = Assertions.assertThrows(Exception.class, () -> {
            mockMvc.perform(put("/api/despachos/{id}/transportista/{idTransportista}", 999L, 100L)
                    .contentType(MediaType.APPLICATION_JSON));
        });

        Assertions.assertTrue(ex.getMessage().contains("Transportista no encontrado"));
    }
}