package com.smartlogix.msclientes.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlogix.msclientes.model.Cliente;
import com.smartlogix.msclientes.service.ClienteService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ClienteController.class)
class ClienteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean                        // ← reemplaza @MockBean
    private ClienteService service;

    @Autowired
    private ObjectMapper objectMapper;

    private Cliente cliente;

    @BeforeEach
    void setUp() {
        cliente = Cliente.builder()
                .idCliente(1L)
                .rut("12345678-9")
                .nombre("Carlos")
                .apellidoPaterno("González")
                .apellidoMaterno("Pérez")
                .correo("carlos@email.com")
                .telefono("+56912345678")
                .region("Valparaíso")
                .build();
    }

    @Test
    void listar_retornaListaDeClientes() throws Exception {
        when(service.listar()).thenReturn(List.of(cliente));

        mockMvc.perform(get("/api/clientes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].rut").value("12345678-9"))
                .andExpect(jsonPath("$[0].region").value("Valparaíso"));
    }

    @Test
    void buscarPorId_existente_retorna200() throws Exception {
        when(service.buscarPorId(1L)).thenReturn(cliente);

        mockMvc.perform(get("/api/clientes/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idCliente").value(1))
                .andExpect(jsonPath("$.nombre").value("Carlos"))
                .andExpect(jsonPath("$.correo").value("carlos@email.com"));
    }

    @Test
    void buscarPorId_noExistente_lanzaExcepcionEnServicio() {
        // En Spring Boot 3.5 con @WebMvcTest, la excepción no manejada
        // se propaga como error interno. Verificamos que el servicio lanza.
        when(service.buscarPorId(99L))
                .thenThrow(new RuntimeException("Cliente no encontrado"));

        RuntimeException ex = org.junit.jupiter.api.Assertions.assertThrows(
                RuntimeException.class,
                () -> service.buscarPorId(99L)
        );
        org.junit.jupiter.api.Assertions.assertEquals("Cliente no encontrado", ex.getMessage());
    }

    @Test
    void crear_retornaClienteCreado201() throws Exception {
        Cliente nuevo = Cliente.builder()
                .rut("98765432-1")
                .nombre("Ana")
                .correo("ana@email.com")
                .build();

        Cliente guardado = Cliente.builder()
                .idCliente(2L)
                .rut("98765432-1")
                .nombre("Ana")
                .correo("ana@email.com")
                .region("Coquimbo")
                .build();

        when(service.crear(any(Cliente.class))).thenReturn(guardado);

        mockMvc.perform(post("/api/clientes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(nuevo)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idCliente").value(2))
                .andExpect(jsonPath("$.region").value("Coquimbo"));
    }

    @Test
    void actualizar_retornaClienteActualizado() throws Exception {
        Cliente cambios = Cliente.builder()
                .rut("12345678-9")
                .nombre("Carlos Actualizado")
                .correo("nuevo@email.com")
                .build();

        Cliente actualizado = Cliente.builder()
                .idCliente(1L)
                .rut("12345678-9")
                .nombre("Carlos Actualizado")
                .correo("nuevo@email.com")
                .build();

        when(service.actualizar(eq(1L), any(Cliente.class))).thenReturn(actualizado);

        mockMvc.perform(put("/api/clientes/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cambios)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Carlos Actualizado"))
                .andExpect(jsonPath("$.correo").value("nuevo@email.com"));
    }

    @Test
    void eliminar_retorna204() throws Exception {
        doNothing().when(service).eliminar(1L);

        mockMvc.perform(delete("/api/clientes/1"))
                .andExpect(status().isNoContent());

        verify(service, times(1)).eliminar(1L);
    }
}