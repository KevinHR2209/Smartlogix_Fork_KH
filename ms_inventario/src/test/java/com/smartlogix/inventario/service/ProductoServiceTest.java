package com.smartlogix.inventario.service;

import com.smartlogix.inventario.entity.Bodega;
import com.smartlogix.inventario.entity.Producto;
import com.smartlogix.inventario.entity.ProductoBodega;
import com.smartlogix.inventario.repository.BodegaRepository;
import com.smartlogix.inventario.repository.ProductoBodegaRepository;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    // 1. NUEVOS MOCKS PARA EL MANEJO DE STOCK Y BODEGAS
    @Mock
    private ProductoBodegaRepository productoBodegaRepository;

    @Mock
    private BodegaRepository bodegaRepository;

    @InjectMocks
    private ProductoService productoService;

    private Producto productoMock;

    @BeforeEach
    void setUp() {
        productoMock = new Producto();
        productoMock.setIdProducto(1L); // Al tener ID, simulamos que ya existe en la BD
        productoMock.setNombre("Notebook");
    }

    @Test
    void listarTodos_DebeRetornarListaDeProductos() {
        when(productoRepository.findAll()).thenReturn(Arrays.asList(productoMock));

        // 2. Simulamos que al buscar el stock en bodegas, devuelve una lista vacía para no explotar el .sum()
        when(productoBodegaRepository.findByProductoIdProducto(1L)).thenReturn(Arrays.asList());

        List<Producto> resultado = productoService.listarTodos();

        assertEquals(1, resultado.size());
        verify(productoRepository, times(1)).findAll();
        verify(productoBodegaRepository, times(1)).findByProductoIdProducto(1L);
    }

    @Test
    void guardar_ProductoExistente_DebeRetornarProductoGuardado() {
        when(productoRepository.save(any(Producto.class))).thenReturn(productoMock);

        Producto resultado = productoService.guardar(productoMock);

        assertNotNull(resultado);
        verify(productoRepository).save(productoMock);
        // Al ser un producto ya existente (ID != null), verificamos que no intente crear stock aleatorio
        verify(bodegaRepository, never()).findAll();
    }

    @Test
    void guardar_ProductoNuevo_DebeAsignarStockInicialEnBodegas() {
        Producto productoNuevo = new Producto();
        // Lo dejamos SIN ID para que el servicio lo reconozca como "Nuevo"

        when(productoRepository.save(any(Producto.class))).thenReturn(productoMock); // Al guardar, la BD le asigna el ID 1

        Bodega bodegaMock = new Bodega();
        bodegaMock.setIdBodega(1);
        when(bodegaRepository.findAll()).thenReturn(Arrays.asList(bodegaMock));

        // Simulamos el guardado en la tabla intermedia
        when(productoBodegaRepository.save(any(ProductoBodega.class))).thenAnswer(i -> i.getArguments()[0]);

        Producto resultado = productoService.guardar(productoNuevo);

        assertNotNull(resultado);
        verify(productoRepository).save(productoNuevo);

        // 3. Verificamos que al ser nuevo, sí buscó las bodegas y guardó el stock inicial
        verify(bodegaRepository, times(1)).findAll();
        verify(productoBodegaRepository, times(1)).save(any(ProductoBodega.class));
    }

    @Test
    void buscarPorId_CuandoExiste_DebeRetornarProducto() {
        when(productoRepository.findById(1L)).thenReturn(Optional.of(productoMock));

        Producto resultado = productoService.buscarPorId(1L);

        assertNotNull(resultado);
        assertEquals(1L, resultado.getIdProducto());
    }

    @Test
    void buscarPorId_CuandoNoExiste_DebeRetornarNull() {
        when(productoRepository.findById(99L)).thenReturn(Optional.empty());

        Producto resultado = productoService.buscarPorId(99L);

        assertNull(resultado);
    }

    @Test
    void eliminar_DebeLlamarAlMetodoDeleteDelRepositorio() {
        doNothing().when(productoRepository).deleteById(1L);
        productoService.eliminar(1L);
        verify(productoRepository, times(1)).deleteById(1L);
    }
}