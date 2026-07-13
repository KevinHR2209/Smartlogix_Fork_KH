package com.smartlogix.msventas.service;

import com.smartlogix.msventas.client.ClienteClient;
import com.smartlogix.msventas.client.InventarioClient;
import com.smartlogix.msventas.client.LogisticaClient;
import com.smartlogix.msventas.dto.DetallePedidoRequest;
import com.smartlogix.msventas.dto.PedidoRequest;
import com.smartlogix.msventas.dto.PresentacionResponse;
import com.smartlogix.msventas.model.DetallePedido;
import com.smartlogix.msventas.model.Pedido;
import com.smartlogix.msventas.repository.PedidoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PedidoServiceTest {

    @Mock PedidoRepository pedidoRepository;
    @Mock InventarioClient inventarioClient;
    @Mock ClienteClient    clienteClient;
    @Mock LogisticaClient  logisticaClient;

    @InjectMocks PedidoService pedidoService;

    private Pedido pedidoPendiente;

    @BeforeEach
    void setUp() {
        DetallePedido detalle = new DetallePedido();
        detalle.setIdPresentacion(10L);
        detalle.setCantidad(2);
        detalle.setPrecioUnitarioSnapshot(5000);

        pedidoPendiente = Pedido.builder()
                .idPedido(1L)
                .idCliente(100L)
                .estadoPedido("PENDIENTE_PAGO")
                .fechaCreacion(OffsetDateTime.now())
                .montoTotal(10000L)
                .detalles(List.of(detalle))
                .build();
    }

    // ── VE-01: Crear pedido exitoso ──────────────────────────────────────────
    @Test
    @DisplayName("VE-01 crear pedido con cliente e items validos → PENDIENTE_PAGO")
    void crear_pedidoValido_guardaYRetorna() {
        PresentacionResponse pres = new PresentacionResponse(10L, BigDecimal.valueOf(5000), "Test", 100);
        doNothing().when(clienteClient).validarCliente(100L);
        when(inventarioClient.obtenerPresentacion(10L)).thenReturn(pres);
        doNothing().when(inventarioClient).reservarStock(10L, 2);

        Pedido guardado = Pedido.builder()
                .idPedido(1L).idCliente(100L)
                .estadoPedido("PENDIENTE_PAGO").montoTotal(10000L)
                .build();
        when(pedidoRepository.save(any())).thenReturn(guardado);

        PedidoRequest req = new PedidoRequest(
                100L,
                List.of(new DetallePedidoRequest(10L, 2))
        );

        Pedido resultado = pedidoService.crear(req);

        assertThat(resultado.getIdCliente()).isEqualTo(100L);
        assertThat(resultado.getEstadoPedido()).isEqualTo("PENDIENTE_PAGO");
        assertThat(resultado.getMontoTotal()).isEqualTo(10000L);
        verify(inventarioClient).reservarStock(10L, 2);
        verify(pedidoRepository).save(any());
    }

    // ── VE-03: Cliente inexistente → 400 ────────────────────────────────────
    @Test
    @DisplayName("VE-03 crear pedido con idCliente inexistente → 400 BAD_REQUEST")
    void crear_clienteInexistente_lanza400() {
        doThrow(new RuntimeException("cliente no encontrado"))
                .when(clienteClient).validarCliente(999L);

        PedidoRequest req = new PedidoRequest(
                999L,
                List.of(new DetallePedidoRequest(10L, 1))
        );

        assertThatThrownBy(() -> pedidoService.crear(req))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Cliente no valido");
    }

    // ── VE-07: buscarPorId existente → retorna pedido ───────────────────────
    @Test
    @DisplayName("buscarPorId retorna pedido cuando existe")
    void buscarPorId_existente_retornaPedido() {
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedidoPendiente));
        Pedido resultado = pedidoService.buscarPorId(1L);
        assertThat(resultado.getIdPedido()).isEqualTo(1L);
    }

    // ── 404 para pedido inexistente ──────────────────────────────────────────
    @Test
    @DisplayName("buscarPorId lanza 404 cuando no existe")
    void buscarPorId_inexistente_lanza404() {
        when(pedidoRepository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> pedidoService.buscarPorId(99L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("no encontrado");
    }

    // ── VE-10: Cancelar pedido PENDIENTE_PAGO → CANCELADO ───────────────────
    @Test
    @DisplayName("VE-10 cancelar pedido en estado PENDIENTE_PAGO → CANCELADO")
    void cancelar_pedidoPendiente_cambiaACancelado() {
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedidoPendiente));
        doNothing().when(inventarioClient).liberarStock(anyLong(), anyInt());
        when(pedidoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Pedido resultado = pedidoService.cancelarPedido(1L);

        assertThat(resultado.getEstadoPedido()).isEqualTo("CANCELADO");
        verify(inventarioClient).liberarStock(10L, 2);
    }

    // ── Cancelar pedido ya PAGADO → 400 ────────────────────────────────────
    @Test
    @DisplayName("cancelar pedido en estado PAGADO → 400 BAD_REQUEST")
    void cancelar_pedidoYaPagado_lanza400() {
        pedidoPendiente.setEstadoPedido("PAGADO");
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedidoPendiente));

        assertThatThrownBy(() -> pedidoService.cancelarPedido(1L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("PENDIENTE_PAGO");
    }

    // ── cambiarEstado: flujo básico ──────────────────────────────────────────
    @Test
    @DisplayName("cambiarEstado actualiza estadoPedido y persiste")
    void cambiarEstado_persiste() {
        when(pedidoRepository.findById(1L)).thenReturn(Optional.of(pedidoPendiente));
        when(pedidoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Pedido resultado = pedidoService.cambiarEstado(1L, "PAGADO");

        assertThat(resultado.getEstadoPedido()).isEqualTo("PAGADO");
    }

    // ── listarPorCliente ─────────────────────────────────────────────────────
    @Test
    @DisplayName("listarPorCliente retorna solo pedidos del cliente indicado")
    void listarPorCliente_retornaListaCorrecta() {
        when(pedidoRepository.findByIdCliente(100L)).thenReturn(List.of(pedidoPendiente));
        List<Pedido> resultado = pedidoService.listarPorCliente(100L);
        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getIdCliente()).isEqualTo(100L);
    }
}
