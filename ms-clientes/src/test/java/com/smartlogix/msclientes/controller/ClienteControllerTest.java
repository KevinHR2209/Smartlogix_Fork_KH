package com.smartlogix.msclientes.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlogix.msclientes.model.Cliente;
import com.smartlogix.msclientes.service.ClienteService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ClienteController.class)
class ClienteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ClienteService service;

    @Autowired
    private ObjectMapper objectMapper;

    private Cliente cliente;

    @BeforeEach
    void setUp() {
        cliente = new Cliente();
        cliente.setIdCliente(1L);
        cliente.setRut("12345678-9");
        cliente.setNombre("Kevin");
        cliente.setApellidoPaterno("Hernandez");
        cliente.setApellidoMaterno("Ramirez");
        cliente.setCorreo("kevin@test.com");
        cliente.setTelefono("912345678");
    }

    @Test
    void listar_debeRetornar200ConListaDeClientes() throws Exception {
        when(service.listar()).thenReturn(Arrays.asList(cliente));
        mockMvc.perform(get("/api/clientes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombre").value("Kevin"));
    }

    @Test
    void buscarPorId_debeRetornar200CuandoExiste() throws Exception {
        when(service.buscarPorId(1L)).thenReturn(cliente);
        mockMvc.perform(get("/api/clientes/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rut").value("12345678-9"));
    }

    @Test
    void crear_debeRetornar201ConClienteCreado() throws Exception {
        when(service.crear(any(Cliente.class))).thenReturn(cliente);
        mockMvc.perform(post("/api/clientes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(cliente)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nombre").value("Kevin"));
    }

    @Test
    void actualizar_debeRetornar200ConClienteActualizado() throws Exception {
        when(service.actualizar(eq(1L), any(Cliente.class))).thenReturn(cliente);
        mockMvc.perform(put("/api/clientes/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(cliente)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idCliente").value(1));
    }

    @Test
    void eliminar_debeRetornar204() throws Exception {
        doNothing().when(service).eliminar(1L);
        mockMvc.perform(delete("/api/clientes/1"))
                .andExpect(status().isNoContent());
        verify(service, times(1)).eliminar(1L);
    }
}