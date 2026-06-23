package com.smartlogix.msventas.service;

import com.smartlogix.msventas.model.Pago;
import com.smartlogix.msventas.model.Pedido;
import com.smartlogix.msventas.repository.PagoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VentaServiceTest {

    @Mock
    private PagoRepository pagoRepository;

    private Pago pago;
    private Pedido pedido;

    @BeforeEach
    void setUp() {
        pedido = Pedido.builder()
                .idPedido(1L)
                .idCliente(10L)
                .montoTotal(45000)
                .estadoPedido("PENDIENTE")
                .build();

        pago = Pago.builder()
                .idPago(1L)
                .pedido(pedido)
                .montoTransaccion(45000)
                .metodoPago("TARJETA")
                .estadoPago("APROBADO")
                .fechaPago(OffsetDateTime.now())
                .tokenTransaccion("TOKEN-ABC-123")
                .build();
    }

    @Test
    void registrarPago_guardaConFecha() {
        Pago sinFecha = Pago.builder()
                .pedido(pedido)
                .montoTransaccion(45000)
                .metodoPago("TARJETA")
                .estadoPago("APROBADO")
                .build();

        when(pagoRepository.save(any(Pago.class))).thenAnswer(inv -> {
            Pago p = inv.getArgument(0);
            p.setIdPago(1L);
            return p;
        });

        Pago resultado = pagoRepository.save(sinFecha);

        assertNotNull(resultado);
        assertEquals(1L, resultado.getIdPago());
        verify(pagoRepository, times(1)).save(sinFecha);
    }

    @Test
    void listarPagos_retornaListaCompleta() {
        when(pagoRepository.findAll()).thenReturn(List.of(pago));

        List<Pago> pagos = pagoRepository.findAll();

        assertEquals(1, pagos.size());
        assertEquals("TOKEN-ABC-123", pagos.get(0).getTokenTransaccion());
        assertEquals("APROBADO", pagos.get(0).getEstadoPago());
    }

    @Test
    void pago_tieneMetodoPago() {
        assertNotNull(pago.getMetodoPago());
        assertFalse(pago.getMetodoPago().isBlank());
    }

    @Test
    void pago_montoTransaccionCoincideConPedido() {
        assertEquals(pago.getMontoTransaccion(), pedido.getMontoTotal());
    }

    @Test
    void pago_tokenTransaccionNoEsNulo() {
        assertNotNull(pago.getTokenTransaccion());
        assertFalse(pago.getTokenTransaccion().isEmpty());
    }
}