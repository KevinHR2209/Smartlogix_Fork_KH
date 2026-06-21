package com.smartlogix.inventario.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlogix.inventario.entity.Producto;
import com.smartlogix.inventario.service.ProductoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductoController.class)
class ProductoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductoService productoService;

    private Producto productoMock;

    @BeforeEach
    void setUp() {
        productoMock = new Producto();
        productoMock.setIdProducto(1L);
        productoMock.setNombre("Bebida Pepsi");
        productoMock.setPrecioActual(150000);
    }

    @Test
    void crear_DebeRetornarEstado200YProductoCreado() throws Exception {
        when(productoService.guardar(any(Producto.class))).thenReturn(productoMock);
        String productoJson = objectMapper.writeValueAsString(productoMock);

        mockMvc.perform(post("/api/productos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productoJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idProducto").value(1L))
                .andExpect(jsonPath("$.nombre").value("Bebida Pepsi"));
    }

    @Test
    void listar_DebeRetornarEstado200YListaDeProductos() throws Exception {
        when(productoService.listarTodos()).thenReturn(Arrays.asList(productoMock));

        mockMvc.perform(get("/api/productos")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].idProducto").value(1L))
                .andExpect(jsonPath("$[0].nombre").value("Bebida Pepsi"));
    }

    @Test
    void obtener_DebeRetornarEstado200YProducto() throws Exception {
        when(productoService.buscarPorId(1L)).thenReturn(productoMock);

        mockMvc.perform(get("/api/productos/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idProducto").value(1L));
    }

    @Test
    void actualizar_DebeRetornarEstado200YProductoActualizado() throws Exception {
        Producto productoActualizado = new Producto();
        productoActualizado.setIdProducto(1L);
        productoActualizado.setNombre("Switch Palo Alto");

        when(productoService.guardar(any(Producto.class))).thenReturn(productoActualizado);
        String productoJson = objectMapper.writeValueAsString(productoActualizado);

        mockMvc.perform(put("/api/productos/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(productoJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idProducto").value(1L))
                .andExpect(jsonPath("$.nombre").value("Switch Palo Alto"));
    }

    @Test
    void eliminar_DebeRetornarEstado200() throws Exception {
        doNothing().when(productoService).eliminar(1L);

        mockMvc.perform(delete("/api/productos/{id}", 1L))
                .andExpect(status().isOk());
    }
}
