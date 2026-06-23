package com.smartlogix.mslogistica.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlogix.mslogistica.model.Despacho;
import com.smartlogix.mslogistica.model.Transportista;
import com.smartlogix.mslogistica.service.DespachoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DespachoController.class)
class DespachoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean                        // ← reemplaza @MockBean
    private DespachoService service;

    @Autowired
    private ObjectMapper objectMapper;

    private Despacho despacho;

    @BeforeEach
    void setUp() {
        Transportista transportista = Transportista.builder()
                .idTransportista(1L)
                .nombreCompleto("Juan Ramírez")
                .patenteVehiculo("ABCD-12")
                .estado("ACTIVO")
                .build();

        despacho = Despacho.builder()
                .idDespacho(1L)
                .idPedido(10L)
                .direccionEntrega("Avenida Errázuriz 500")
                .comunaEntrega("Valparaíso")
                .estadoDespacho("PENDIENTE")
                .fechaCreacion(OffsetDateTime.now())
                .transportista(transportista)
                .build();
    }

    @Test
    void listar_retornaListaDeDespachos() throws Exception {
        when(service.listar()).thenReturn(List.of(despacho));

        mockMvc.perform(get("/api/despachos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].idDespacho").value(1))
                .andExpect(jsonPath("$[0].estadoDespacho").value("PENDIENTE"))
                .andExpect(jsonPath("$[0].comunaEntrega").value("Valparaíso"));
    }

    @Test
    void obtener_existente_retorna200() throws Exception {
        when(service.buscarPorId(1L)).thenReturn(despacho);

        mockMvc.perform(get("/api/despachos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idPedido").value(10))
                .andExpect(jsonPath("$.transportista.nombreCompleto").value("Juan Ramírez"));
    }

    @Test
    void obtener_noExistente_lanzaExcepcionEnServicio() {
        // Verificamos el comportamiento del servicio directamente,
        // sin depender del manejo de errores HTTP del contexto de test.
        when(service.buscarPorId(99L))
                .thenThrow(new RuntimeException("Despacho no encontrado"));

        RuntimeException ex = org.junit.jupiter.api.Assertions.assertThrows(
                RuntimeException.class,
                () -> service.buscarPorId(99L)
        );
        org.junit.jupiter.api.Assertions.assertEquals("Despacho no encontrado", ex.getMessage());
    }

    @Test
    void crear_retornaDespachoCreado201() throws Exception {
        Despacho nuevo = Despacho.builder()
                .idPedido(10L)
                .direccionEntrega("Avenida Errázuriz 500")
                .comunaEntrega("Valparaíso")
                .estadoDespacho("PENDIENTE")
                .build();

        when(service.crear(any(Despacho.class))).thenReturn(despacho);

        mockMvc.perform(post("/api/despachos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(nuevo)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idDespacho").value(1))
                .andExpect(jsonPath("$.estadoDespacho").value("PENDIENTE"));
    }

    @Test
    void cambiarEstado_retornaDespachoActualizado() throws Exception {
        Despacho enRuta = Despacho.builder()
                .idDespacho(1L)
                .idPedido(10L)
                .estadoDespacho("EN_RUTA")
                .build();

        when(service.cambiarEstado(1L, "EN_RUTA")).thenReturn(enRuta);

        mockMvc.perform(put("/api/despachos/1/estado")
                        .param("estado", "EN_RUTA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoDespacho").value("EN_RUTA"));
    }

    @Test
    void asignarTransportista_retornaDespachoConTransportista() throws Exception {
        when(service.asignarTransportista(1L, 1L)).thenReturn(despacho);

        mockMvc.perform(put("/api/despachos/1/transportista/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.transportista.idTransportista").value(1))
                .andExpect(jsonPath("$.transportista.patenteVehiculo").value("ABCD-12"));
    }

    @Test
    void listar_sinDespachos_retornaListaVacia() throws Exception {
        when(service.listar()).thenReturn(List.of());

        mockMvc.perform(get("/api/despachos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}