package com.smartlogix.mslogistica.service;

import com.smartlogix.mslogistica.client.VentasClient;
import com.smartlogix.mslogistica.model.Despacho;
import com.smartlogix.mslogistica.model.Transportista;
import com.smartlogix.mslogistica.repository.DespachoRepository;
import com.smartlogix.mslogistica.repository.TransportistaRepository;
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
class DespachoServiceTest {

    @Mock
    private DespachoRepository despachoRepository;

    @Mock
    private TransportistaRepository transportistaRepository;

    @Mock
    private VentasClient ventasClient;

    @InjectMocks
    private DespachoService despachoService;

    private Despacho despachoBase;
    private Transportista transportistaBase;

    @BeforeEach
    void setUp() {
        despachoBase = new Despacho();
        despachoBase.setIdDespacho(1L);
        despachoBase.setIdPedido(500L);
        despachoBase.setEstadoDespacho("PENDIENTE");

        transportistaBase = new Transportista();
        transportistaBase.setIdTransportista(100L);
    }

    @Test
    void listar_DebeRetornarListaDeDespachos() {
        when(despachoRepository.findAll()).thenReturn(Arrays.asList(despachoBase));
        List<Despacho> resultado = despachoService.listar();
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        verify(despachoRepository, times(1)).findAll();
    }

    @Test
    void buscarPorId_CuandoExiste_DebeRetornarDespacho() {
        when(despachoRepository.findById(1L)).thenReturn(Optional.of(despachoBase));
        Despacho resultado = despachoService.buscarPorId(1L);
        assertNotNull(resultado);
        assertEquals(1L, resultado.getIdDespacho());
    }

    @Test
    void crear_CuandoPedidoExisteYFechaNula_DebeAsignarFechaYGuardar() {
        Despacho nuevoDespacho = new Despacho();
        nuevoDespacho.setIdPedido(500L);
        nuevoDespacho.setEstadoDespacho("NUEVO");

        // Simulamos que ms-ventas responde OK
        doNothing().when(ventasClient).validarPedido(500L);
        when(despachoRepository.save(any(Despacho.class))).thenAnswer(i -> i.getArgument(0));

        Despacho resultado = despachoService.crear(nuevoDespacho);

        assertNotNull(resultado.getFechaCreacion());
        assertEquals("NUEVO", resultado.getEstadoDespacho());
        verify(ventasClient, times(1)).validarPedido(500L);
        verify(despachoRepository, times(1)).save(any(Despacho.class));
    }

    @Test
    void crear_CuandoPedidoNoExiste_DebeLanzarExcepcionYNoGuardar() {
        Despacho nuevoDespacho = new Despacho();
        nuevoDespacho.setIdPedido(999L); // ID fantasma

        // Simulamos que ms-ventas responde con error 404
        doThrow(new RuntimeException("Error en ms-logistica: El pedido con ID 999 no existe en Ventas."))
                .when(ventasClient).validarPedido(999L);

        // Verificamos que salta la excepción
        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            despachoService.crear(nuevoDespacho);
        });

        assertEquals("Error en ms-logistica: El pedido con ID 999 no existe en Ventas.", ex.getMessage());

        // VERIFICACIÓN: Nos aseguramos de que no se guardó el despacho fraudulento
        verify(despachoRepository, never()).save(any(Despacho.class));
    }

    @Test
    void asignarTransportista_CuandoAmbosExisten_DebeAsignarYGuardar() {
        when(despachoRepository.findById(1L)).thenReturn(Optional.of(despachoBase));
        when(transportistaRepository.findById(100L)).thenReturn(Optional.of(transportistaBase));
        when(despachoRepository.save(any(Despacho.class))).thenAnswer(i -> i.getArgument(0));

        Despacho resultado = despachoService.asignarTransportista(1L, 100L);

        assertNotNull(resultado.getTransportista());
        assertEquals(100L, resultado.getTransportista().getIdTransportista());
        verify(despachoRepository, times(1)).save(despachoBase);
    }

    @Test
    void cambiarEstado_CuandoExiste_DebeActualizarEstadoYGuardar() {
        when(despachoRepository.findById(1L)).thenReturn(Optional.of(despachoBase));
        when(despachoRepository.save(any(Despacho.class))).thenAnswer(i -> i.getArgument(0));

        Despacho resultado = despachoService.cambiarEstado(1L, "EN_RUTA");

        assertEquals("EN_RUTA", resultado.getEstadoDespacho());
        verify(despachoRepository, times(1)).save(despachoBase);
    }
}