package com.smartlogix.inventario.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlogix.inventario.entity.Perfume;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductoController.class)
class ProductoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductoService productoService;

    @Autowired
    private ObjectMapper objectMapper;

    private Perfume producto;

    @BeforeEach
    void setUp() {
        producto = new Perfume();
        producto.setIdProducto(1L);
        producto.setSku("TEC-001");
        producto.setNombre("Teclado Mecánico");
        producto.setPrecioActual(45000);
        producto.setEstado("ACTIVO");
        producto.setPesoGramos(800);
        producto.setDescripcion("Teclado mecánico RGB");
        producto.setDimensiones("44x13x3 cm");
        producto.setStockTotal(80);
    }

    @Test
    void listar_retornaListaDeProductos() throws Exception {
        when(productoService.listarTodos()).thenReturn(List.of(producto));

        mockMvc.perform(get("/api/productos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].sku").value("TEC-001"))
                .andExpect(jsonPath("$[0].stockTotal").value(80));
    }

    @Test
    void obtener_existente_retornaProducto() throws Exception {
        when(productoService.buscarPorId(1L)).thenReturn(producto);

        mockMvc.perform(get("/api/productos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idProducto").value(1))
                .andExpect(jsonPath("$.nombre").value("Teclado Mecánico"));
    }

    @Test
    void obtener_noExistente_retornaNull() throws Exception {
        when(productoService.buscarPorId(99L)).thenReturn(null);

        mockMvc.perform(get("/api/productos/99"))
                .andExpect(status().isOk())
                .andExpect(content().string(""));
    }

    @Test
    void crear_retornaProductoGuardado() throws Exception {
        Perfume nuevo = new Perfume();
        nuevo.setSku("MOU-002");
        nuevo.setNombre("Mouse Gamer");
        nuevo.setPrecioActual(35000);
        nuevo.setEstado("ACTIVO");

        Perfume guardado = new Perfume();
        guardado.setIdProducto(2L);
        guardado.setSku("MOU-002");
        guardado.setNombre("Mouse Gamer");

        when(productoService.guardar(any(Perfume.class))).thenReturn(guardado);

        mockMvc.perform(post("/api/productos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(nuevo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idProducto").value(2))
                .andExpect(jsonPath("$.sku").value("MOU-002"));
    }

    @Test
    void actualizar_retornaProductoActualizado() throws Exception {
        Perfume cambios = new Perfume();
        cambios.setSku("TEC-001-V2");
        cambios.setNombre("Teclado Pro");
        cambios.setPrecioActual(55000);
        cambios.setEstado("ACTIVO");

        Perfume actualizado = new Perfume();
        actualizado.setIdProducto(1L);
        actualizado.setSku("TEC-001-V2");
        actualizado.setNombre("Teclado Pro");

        when(productoService.actualizar(eq(1L), any(Perfume.class))).thenReturn(actualizado);

        mockMvc.perform(put("/api/productos/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cambios)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sku").value("TEC-001-V2"))
                .andExpect(jsonPath("$.nombre").value("Teclado Pro"));
    }

    @Test
    void eliminar_llamaAlServicio() throws Exception {
        doNothing().when(productoService).eliminar(1L);

        mockMvc.perform(delete("/api/productos/1"))
                .andExpect(status().isOk());

        verify(productoService, times(1)).eliminar(1L);
    }

    @Test
    void descontarStock_exitoso_retornaOk() throws Exception {
        DescuentoStockDto dto = new DescuentoStockDto();
        dto.setCantidad(10);
        dto.setRegionDestino("Valparaíso");

        doNothing().when(productoService)
                .descontarStockGeolocalizado(eq(1L), eq(10), eq("Valparaíso"));

        mockMvc.perform(put("/api/productos/1/descontar-stock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());

        verify(productoService).descontarStockGeolocalizado(1L, 10, "Valparaíso");
    }
}