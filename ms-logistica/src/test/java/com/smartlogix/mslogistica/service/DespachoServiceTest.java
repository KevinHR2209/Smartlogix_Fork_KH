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

import java.time.OffsetDateTime;
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

    private Despacho despacho;
    private Transportista transportista;

    @BeforeEach
    void setUp() {
        transportista = Transportista.builder()
                .idTransportista(1L)
                .nombreCompleto("Juan Ramírez")
                .patenteVehiculo("ABCD-12")
                .telefonoContacto("+56999999999")
                .estado("ACTIVO")
                .build();

        despacho = Despacho.builder()
                .idDespacho(1L)
                .idPedido(10L)
                .direccionEntrega("Avenida Errázuriz 500")
                .comunaEntrega("Valparaíso")
                .estadoDespacho("PENDIENTE")
                .fechaCreacion(OffsetDateTime.now())
                .transportista(transportista)
                .build();
    }

    // ─── listar ──────────────────────────────────────────────────────────────

    @Test
    void listar_retornaListaDeDespachos() {
        when(despachoRepository.findAll()).thenReturn(List.of(despacho));

        List<Despacho> resultado = despachoService.listar();

        assertEquals(1, resultado.size());
        assertEquals("PENDIENTE", resultado.get(0).getEstadoDespacho());
    }

    // ─── buscarPorId ─────────────────────────────────────────────────────────

    @Test
    void buscarPorId_existente_retornaDespacho() {
        when(despachoRepository.findById(1L)).thenReturn(Optional.of(despacho));

        Despacho resultado = despachoService.buscarPorId(1L);

        assertNotNull(resultado);
        assertEquals(10L, resultado.getIdPedido());
    }

    @Test
    void buscarPorId_noExistente_lanzaExcepcion() {
        when(despachoRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> despachoService.buscarPorId(99L));

        assertEquals("Despacho no encontrado", ex.getMessage());
    }

    // ─── crear ────────────────────────────────────────────────────────────────

    @Test
    void crear_llamaValidarPedidoAntesDePersistir() {
        Despacho nuevo = Despacho.builder()
                .idPedido(5L)
                .direccionEntrega("Alameda 1234")
                .comunaEntrega("Metropolitana")
                .estadoDespacho("PENDIENTE")
                .build();

        doNothing().when(ventasClient).validarPedido(5L);
        when(despachoRepository.save(any(Despacho.class))).thenReturn(nuevo);

        despachoService.crear(nuevo);

        // La validación del pedido debe ocurrir ANTES de guardar
        var inOrder = inOrder(ventasClient, despachoRepository);
        inOrder.verify(ventasClient).validarPedido(5L);
        inOrder.verify(despachoRepository).save(nuevo);
    }

    @Test
    void crear_sinFechaCreacion_asignaFechaAutomatica() {
        Despacho sinFecha = Despacho.builder()
                .idPedido(5L)
                .estadoDespacho("PENDIENTE")
                .build();

        assertNull(sinFecha.getFechaCreacion());

        doNothing().when(ventasClient).validarPedido(any());
        when(despachoRepository.save(any(Despacho.class))).thenAnswer(inv -> inv.getArgument(0));

        Despacho resultado = despachoService.crear(sinFecha);

        assertNotNull(resultado.getFechaCreacion(),
                "Debe asignarse fecha de creación automáticamente");
    }

    @Test
    void crear_conFechaExistente_conservaFechaOriginal() {
        OffsetDateTime fechaOriginal = OffsetDateTime.parse("2025-01-15T10:00:00+00:00");
        Despacho conFecha = Despacho.builder()
                .idPedido(5L)
                .estadoDespacho("PENDIENTE")
                .fechaCreacion(fechaOriginal)
                .build();

        doNothing().when(ventasClient).validarPedido(any());
        when(despachoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Despacho resultado = despachoService.crear(conFecha);

        assertEquals(fechaOriginal, resultado.getFechaCreacion());
    }

    @Test
    void crear_ventasClientFalla_lanzaExcepcionYNoGuarda() {
        Despacho nuevo = Despacho.builder().idPedido(999L).build();

        doThrow(new RuntimeException("Pedido 999 no existe"))
                .when(ventasClient).validarPedido(999L);

        assertThrows(RuntimeException.class, () -> despachoService.crear(nuevo));
        verify(despachoRepository, never()).save(any());
    }

    // ─── asignarTransportista ─────────────────────────────────────────────────

    @Test
    void asignarTransportista_exitoso_actualizaDespacho() {
        when(despachoRepository.findById(1L)).thenReturn(Optional.of(despacho));
        when(transportistaRepository.findById(1L)).thenReturn(Optional.of(transportista));
        when(despachoRepository.save(any(Despacho.class))).thenAnswer(inv -> inv.getArgument(0));

        Despacho resultado = despachoService.asignarTransportista(1L, 1L);

        assertNotNull(resultado.getTransportista());
        assertEquals("Juan Ramírez", resultado.getTransportista().getNombreCompleto());
        verify(despachoRepository).save(despacho);
    }

    @Test
    void asignarTransportista_transportistaNoExistente_lanzaExcepcion() {
        when(despachoRepository.findById(1L)).thenReturn(Optional.of(despacho));
        when(transportistaRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> despachoService.asignarTransportista(1L, 99L));

        assertEquals("Transportista no encontrado", ex.getMessage());
        verify(despachoRepository, never()).save(any());
    }

    // ─── cambiarEstado ────────────────────────────────────────────────────────

    @Test
    void cambiarEstado_actualizaEstadoCorrectamente() {
        when(despachoRepository.findById(1L)).thenReturn(Optional.of(despacho));
        when(despachoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Despacho resultado = despachoService.cambiarEstado(1L, "EN_RUTA");

        assertEquals("EN_RUTA", resultado.getEstadoDespacho());
        verify(despachoRepository).save(despacho);
    }

    @Test
    void cambiarEstado_despachoNoExistente_lanzaExcepcion() {
        when(despachoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> despachoService.cambiarEstado(99L, "ENTREGADO"));
    }

    @Test
    void cambiarEstado_flujoCompleto_PENDIENTE_a_ENTREGADO() {
        when(despachoRepository.findById(1L)).thenReturn(Optional.of(despacho));
        when(despachoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        despachoService.cambiarEstado(1L, "EN_RUTA");
        assertEquals("EN_RUTA", despacho.getEstadoDespacho());

        despachoService.cambiarEstado(1L, "ENTREGADO");
        assertEquals("ENTREGADO", despacho.getEstadoDespacho());

        verify(despachoRepository, times(2)).save(despacho);
    }
}