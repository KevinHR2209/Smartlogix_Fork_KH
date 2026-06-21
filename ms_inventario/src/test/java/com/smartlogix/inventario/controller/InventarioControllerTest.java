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
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductoController.class)
class InventarioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductoService productoService;

    @Autowired
    private ObjectMapper objectMapper;

    private Producto producto;

    @BeforeEach
    void setUp() {
        producto = new Producto(1L, "SKU-001", "Caja Grande", "Caja de cart\u00f3n resistente",
                5000, 500, "30x30x30", "activo");
    }

    @Test
    void listar_retornaLista() throws Exception {
        List<Producto> lista = Arrays.asList(producto);
        when(productoService.listarTodos()).thenReturn(lista);

        mockMvc.perform(get("/api/productos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sku").value("SKU-001"));
    }

    @Test
    void obtener_existente_retornaProducto() throws Exception {
        when(productoService.buscarPorId(1L)).thenReturn(producto);

        mockMvc.perform(get("/api/productos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Caja Grande"));
    }

    @Test
    void crear_retornaProductoCreado() throws Exception {
        when(productoService.guardar(any(Producto.class))).thenReturn(producto);

        mockMvc.perform(post("/api/productos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(producto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sku").value("SKU-001"));
    }

    @Test
    void actualizar_retornaProductoActualizado() throws Exception {
        when(productoService.guardar(any(Producto.class))).thenReturn(producto);

        mockMvc.perform(put("/api/productos/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(producto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idProducto").value(1));
    }

    @Test
    void eliminar_retornaOk() throws Exception {
        doNothing().when(productoService).eliminar(1L);

        mockMvc.perform(delete("/api/productos/1"))
                .andExpect(status().isOk());
    }
}
