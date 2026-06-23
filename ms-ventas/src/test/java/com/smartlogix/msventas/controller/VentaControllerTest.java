package com.smartlogix.msventas.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlogix.msventas.model.Pago;
import com.smartlogix.msventas.model.Pedido;
import com.smartlogix.msventas.repository.PagoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PagoController.class)
class VentaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PagoRepository pagoRepository;

    @Autowired
    private ObjectMapper objectMapper;

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
    void listar_retornaListaDePagos() throws Exception {
        when(pagoRepository.findAll()).thenReturn(List.of(pago));

        mockMvc.perform(get("/api/pagos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].idPago").value(1))
                .andExpect(jsonPath("$[0].estadoPago").value("APROBADO"))
                .andExpect(jsonPath("$[0].tokenTransaccion").value("TOKEN-ABC-123"));
    }

    @Test
    void registrar_pagoSinFecha_asignaFechaAutomatica() throws Exception {
        Pago sinFecha = Pago.builder()
                .montoTransaccion(45000)
                .metodoPago("TARJETA")
                .estadoPago("APROBADO")
                .tokenTransaccion("TOKEN-XYZ")
                .build();

        Pago guardado = Pago.builder()
                .idPago(2L)
                .montoTransaccion(45000)
                .metodoPago("TARJETA")
                .estadoPago("APROBADO")
                .fechaPago(OffsetDateTime.now())
                .tokenTransaccion("TOKEN-XYZ")
                .build();

        when(pagoRepository.save(any(Pago.class))).thenReturn(guardado);

        mockMvc.perform(post("/api/pagos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sinFecha)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idPago").value(2))
                .andExpect(jsonPath("$.fechaPago").isNotEmpty());
    }

    @Test
    void registrar_pagoConFecha_conservaFechaOriginal() throws Exception {
        when(pagoRepository.save(any(Pago.class))).thenReturn(pago);

        mockMvc.perform(post("/api/pagos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pago)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estadoPago").value("APROBADO"))
                .andExpect(jsonPath("$.metodoPago").value("TARJETA"));

        verify(pagoRepository, times(1)).save(any(Pago.class));
    }

    @Test
    void listar_sinPagos_retornaListaVacia() throws Exception {
        when(pagoRepository.findAll()).thenReturn(List.of());

        mockMvc.perform(get("/api/pagos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}