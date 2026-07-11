package com.smartlogix.inventario.service;

import com.smartlogix.inventario.entity.Bodega;
import com.smartlogix.inventario.entity.Perfume;
import com.smartlogix.inventario.entity.ProductoBodega;
import com.smartlogix.inventario.repository.BodegaRepository;
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
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private ProductoBodegaRepository productoBodegaRepository;

    @Mock
    private BodegaRepository bodegaRepository;

    @InjectMocks
    private ProductoService productoService;

    private Perfume producto;
    private Bodega bodega1;
    private Bodega bodega2;
    private ProductoBodega stockB1;
    private ProductoBodega stockB2;

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

        bodega1 = new Bodega();
        bodega1.setIdBodega(1);
        bodega1.setNombre("Bodega Central");

        bodega2 = new Bodega();
        bodega2.setIdBodega(2);
        bodega2.setNombre("Bodega Norte");

        stockB1 = new ProductoBodega();
        stockB1.setIdInventario(1L);
        stockB1.setBodega(bodega1);
        stockB1.setProducto(producto);
        stockB1.setStockDisponible(50);
        stockB1.setStockReservado(0);

        stockB2 = new ProductoBodega();
        stockB2.setIdInventario(2L);
        stockB2.setBodega(bodega2);
        stockB2.setProducto(producto);
        stockB2.setStockDisponible(30);
        stockB2.setStockReservado(0);
    }

    // ─── listarTodos ───────────────────────────────────────────────────────────

    @Test
    void listarTodos_retornaListaConStockTotal() {
        when(productoRepository.findAll()).thenReturn(List.of(producto));
        when(productoBodegaRepository.findByProductoIdProducto(1L))
                .thenReturn(List.of(stockB1, stockB2));

        List<Perfume> resultado = productoService.listarTodos();

        assertEquals(1, resultado.size());
        assertEquals(80, resultado.get(0).getStockTotal()); // 50 + 30
    }

    @Test
    void listarTodos_stockTotalEsCeroSiNoHayBodegas() {
        when(productoRepository.findAll()).thenReturn(List.of(producto));
        when(productoBodegaRepository.findByProductoIdProducto(1L))
                .thenReturn(List.of());

        List<Perfume> resultado = productoService.listarTodos();

        assertEquals(0, resultado.get(0).getStockTotal());
    }

    // ─── guardar (crear nuevo) ─────────────────────────────────────────────────

    @Test
    void guardar_productoNuevo_asignaStockEnTodasLasBodegas() {
        Perfume nuevo = new Perfume();
        nuevo.setIdProducto(null); // es nuevo
        nuevo.setSku("MOU-002");
        nuevo.setNombre("Mouse Gamer");

        Perfume guardado = new Perfume();
        guardado.setIdProducto(5L);
        guardado.setSku("MOU-002");

        when(productoRepository.save(nuevo)).thenReturn(guardado);
        when(bodegaRepository.findAll()).thenReturn(List.of(bodega1, bodega2));
        when(productoBodegaRepository.save(any(ProductoBodega.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        Perfume resultado = productoService.guardar(nuevo);

        assertNotNull(resultado);
        assertEquals(5L, resultado.getIdProducto());
        // debe guardar un stock por cada bodega (2 bodegas)
        verify(productoBodegaRepository, times(2)).save(any(ProductoBodega.class));
    }

    @Test
    void guardar_productoNuevo_stockInicialEntre10y100() {
        Perfume nuevo = new Perfume();
        nuevo.setSku("MON-003");

        Perfume guardado = new Perfume();
        guardado.setIdProducto(6L);

        when(productoRepository.save(nuevo)).thenReturn(guardado);
        when(bodegaRepository.findAll()).thenReturn(List.of(bodega1));
        when(productoBodegaRepository.save(any(ProductoBodega.class)))
                .thenAnswer(inv -> {
                    ProductoBodega pb = inv.getArgument(0);
                    assertTrue(pb.getStockDisponible() >= 10 && pb.getStockDisponible() <= 100,
                            "Stock inicial debe estar entre 10 y 100");
                    return pb;
                });

        productoService.guardar(nuevo);

        verify(productoBodegaRepository, times(1)).save(any(ProductoBodega.class));
    }

    // ─── actualizar ───────────────────────────────────────────────────────────

    @Test
    void actualizar_modificaCamposCorrectamente() {
        Perfume cambios = new Perfume();
        cambios.setSku("TEC-001-V2");
        cambios.setNombre("Teclado Mecánico Pro");
        cambios.setPrecioActual(55000);
        cambios.setPesoGramos(900);
        cambios.setDimensiones("45x14x3 cm");
        cambios.setDescripcion("Nueva descripción");
        cambios.setEstado("ACTIVO");

        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
        when(productoRepository.save(any(Perfume.class))).thenAnswer(inv -> inv.getArgument(0));

        Perfume resultado = productoService.actualizar(1L, cambios);

        assertEquals("TEC-001-V2", resultado.getSku());
        assertEquals("Teclado Mecánico Pro", resultado.getNombre());
        assertEquals(55000, resultado.getPrecioActual());
        verify(productoRepository).save(producto);
    }

    @Test
    void actualizar_productoNoExistente_lanzaExcepcion() {
        when(productoRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> productoService.actualizar(99L, new Perfume()));

        assertTrue(ex.getMessage().contains("99"));
    }

    @Test
    void actualizar_noModificaStockBodega() {
        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));
        when(productoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        productoService.actualizar(1L, new Perfume());

        // nunca debe tocar la tabla producto_bodega al actualizar
        verify(productoBodegaRepository, never()).save(any());
        verify(productoBodegaRepository, never()).deleteById(any());
    }

    // ─── buscarPorId ──────────────────────────────────────────────────────────

    @Test
    void buscarPorId_existente_retornaProducto() {
        when(productoRepository.findById(1L)).thenReturn(Optional.of(producto));

        Perfume resultado = productoService.buscarPorId(1L);

        assertNotNull(resultado);
        assertEquals("TEC-001", resultado.getSku());
    }

    @Test
    void buscarPorId_noExistente_retornaNull() {
        when(productoRepository.findById(99L)).thenReturn(Optional.empty());

        assertNull(productoService.buscarPorId(99L));
    }

    // ─── eliminar ─────────────────────────────────────────────────────────────

    @Test
    void eliminar_llamaDeleteById() {
        doNothing().when(productoRepository).deleteById(1L);

        productoService.eliminar(1L);

        verify(productoRepository, times(1)).deleteById(1L);
    }

    // ─── descontarStockGeolocalizado ─────────────────────────────────────────

    @Test
    void descontarStock_desdeRegionPreferida_descontaDeBodegaCorrecta() {
        // Bodega 1 (idBodega=1) es la preferida para Valparaíso
        when(productoBodegaRepository.findByProductoIdProducto(1L))
                .thenReturn(Arrays.asList(stockB1, stockB2));

        productoService.descontarStockGeolocalizado(1L, 20, "Valparaíso");

        // stockB1 tenía 50, le deben quedar 30
        assertEquals(30, stockB1.getStockDisponible());
        // stockB2 no debe haber sido modificado
        assertEquals(30, stockB2.getStockDisponible());
        verify(productoBodegaRepository, times(1)).save(stockB1);
    }

    @Test
    void descontarStock_stockDistribuidoEnVariasBodegas() {
        stockB1.setStockDisponible(10);
        stockB2.setStockDisponible(40);

        when(productoBodegaRepository.findByProductoIdProducto(1L))
                .thenReturn(Arrays.asList(stockB1, stockB2));

        productoService.descontarStockGeolocalizado(1L, 30, "Valparaíso");

        // Primero vacía B1 (10), luego descuenta 20 de B2
        assertEquals(0, stockB1.getStockDisponible());
        assertEquals(20, stockB2.getStockDisponible());
    }

    @Test
    void descontarStock_stockInsuficiente_lanzaExcepcion() {
        stockB1.setStockDisponible(5);
        stockB2.setStockDisponible(3);

        when(productoBodegaRepository.findByProductoIdProducto(1L))
                .thenReturn(Arrays.asList(stockB1, stockB2));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> productoService.descontarStockGeolocalizado(1L, 50, "Valparaíso"));

        assertTrue(ex.getMessage().contains("Stock insuficiente"));
    }

    @Test
    void descontarStock_regionDesconocida_usaBodegaMetropolitana() {
        Bodega bodega3 = new Bodega();
        bodega3.setIdBodega(3);

        ProductoBodega stockB3 = new ProductoBodega();
        stockB3.setBodega(bodega3);
        stockB3.setProducto(producto);
        stockB3.setStockDisponible(60);
        stockB3.setStockReservado(0);

        when(productoBodegaRepository.findByProductoIdProducto(1L))
                .thenReturn(Arrays.asList(stockB1, stockB2, stockB3));

        productoService.descontarStockGeolocalizado(1L, 15, "RegionDesconocida");

        // Bodega 3 es la preferida por defecto, debe descontarse primero
        assertEquals(45, stockB3.getStockDisponible());
        assertEquals(50, stockB1.getStockDisponible()); // intacta
        assertEquals(30, stockB2.getStockDisponible()); // intacta
    }
}