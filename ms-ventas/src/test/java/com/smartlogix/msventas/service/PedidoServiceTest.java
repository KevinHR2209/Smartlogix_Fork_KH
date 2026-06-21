package com.smartlogix.msventas.service;

import com.smartlogix.msventas.client.InventarioClient;
import com.smartlogix.msventas.model.DetallePedido;
import com.smartlogix.msventas.model.Pedido;
import com.smartlogix.msventas.repository.PedidoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {

    @Mock
    private PedidoRepository pedidoRepository;

    @Mock
    private InventarioClient inventarioClient; // Agregamos el mock del cliente HTTP

    @InjectMocks
    private PedidoService service;

    private Pedido pedido;

    @BeforeEach
    void setUp() {
        pedido = new Pedido();
        pedido.setIdPedido(1L);
        pedido.setEstadoPedido("PENDIENTE");
        pedido.setFechaCreacion(OffsetDateTime.now());
    }

    @Test
    void listar_debeRetornarListaDePedidos() {
        when(pedidoRepository.findAll()).thenReturn(Arrays.asList(pedido));
        List<Pedido> resultado = service.listar();
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(pedidoRepository, times(1)).findAll();
    }

    @Test
    void buscarPorId_cuandoExiste_debeRetornarPedido() {
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        Pedido resultado = service.buscarPorId(1L);
        assertNotNull(resultado);
        assertEquals(1L, resultado.getIdPedido());
    }

    @Test
    void buscarPorId_cuandoNoExiste_debeLanzarExcepcion() {
        when(pedidoRepository.findById(99L)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.buscarPorId(99L));
        assertEquals("Pedido no encontrado", ex.getMessage());
    }

    @Test
    void crear_conFechaNull_debeAsignarFechaAutomatica() {
        Pedido nuevo = new Pedido();
        nuevo.setEstadoPedido("PENDIENTE");
        nuevo.setFechaCreacion(null);
        when(pedidoRepository.save(any(Pedido.class))).thenReturn(nuevo);

        // Pasamos la región de prueba
        Pedido resultado = service.crear(nuevo, "Metropolitana");

        assertNotNull(resultado);
        verify(pedidoRepository, times(1)).save(nuevo);
    }

    @Test
    void crear_conDetalles_debeAsociarPedidoADetalles() {
        DetallePedido detalle = new DetallePedido();
        detalle.setIdProducto(100L); // Set de prueba para evitar NullPointerException
        detalle.setCantidad(2);      // Set de prueba para evitar NullPointerException

        pedido.setDetalles(Arrays.asList(detalle));
        pedido.setFechaCreacion(null);

        // Le decimos a Mockito que simule la llamada exitosa por red sin hacer nada real
        doNothing().when(inventarioClient).descontarStock(anyLong(), anyInt(), anyString());

        when(pedidoRepository.save(any(Pedido.class))).thenReturn(pedido);

        // Pasamos la región de prueba
        service.crear(pedido, "Metropolitana");

        assertEquals(pedido, detalle.getPedido());
        // Verificamos que el servicio haya intentado comunicarse con el inventario
        verify(inventarioClient, times(1)).descontarStock(100L, 2, "Metropolitana");
    }

    @Test
    void cambiarEstado_debeActualizarEstado() {
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedido));
        when(pedidoRepository.save(any(Pedido.class))).thenReturn(pedido);
        Pedido resultado = service.cambiarEstado(1L, "ENTREGADO");
        assertEquals("ENTREGADO", resultado.getEstadoPedido());
        verify(pedidoRepository).save(pedido);
    }
}