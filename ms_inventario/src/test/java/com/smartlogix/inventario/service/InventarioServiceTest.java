package com.smartlogix.inventario.service;

import com.smartlogix.inventario.entity.Producto;
import com.smartlogix.inventario.repository.ProductoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventarioServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @InjectMocks
    private ProductoService productoService;

    private Producto producto;

    @BeforeEach
    void setUp() {
        producto = new Producto(1L, "SKU-001", "Caja Grande", "Caja de cart\u00f3n resistente",
                5000, 500, "30x30x30", "activo");
    }

    @Test
    void listarTodos_retornaLista() {
        when(productoRepository.findAll()).thenReturn(Arrays.asList(producto));

        List<Producto> resultado = productoService.listarTodos();

        assertEquals(1, resultado.size());
        assertEquals("SKU-001", resultado.get(0).getSku());
        verify(productoRepository, times(1)).findAll();
    }

    @Test
    void guardar_retornaProductoGuardado() {
        when(productoRepository.save(producto)).thenReturn(producto);

        Producto resultado = productoService.guardar(producto);

        assertNotNull(resultado);
        assertEquals("Caja Grande", resultado.getNombre());
        verify(productoRepository, times(1)).save(producto);
    }

    @Test
    void buscarPorId_existente_retornaProducto() {
        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));

        Producto resultado = productoService.buscarPorId(1L);

        assertNotNull(resultado);
        assertEquals(1L, resultado.getIdProducto());
    }

    @Test
    void buscarPorId_noExistente_retornaNull() {
        when(productoRepository.findById(99L)).thenReturn(Optional.empty());

        Producto resultado = productoService.buscarPorId(99L);

        assertNull(resultado);
    }

    @Test
    void eliminar_llamaRepositorio() {
        doNothing().when(productoRepository).deleteById(1L);

        productoService.eliminar(1L);

        verify(productoRepository, times(1)).deleteById(1L);
    }
}
