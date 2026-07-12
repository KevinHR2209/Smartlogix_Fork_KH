package com.smartlogix.msventas.task;

import com.smartlogix.msventas.model.Pedido;
import com.smartlogix.msventas.repository.PedidoRepository;
import com.smartlogix.msventas.service.PedidoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class PedidoCleanerTask {

    private final PedidoRepository pedidoRepository;
    private final PedidoService pedidoService;

    // Se ejecuta cada 15 minutos (900,000 milisegundos)
    @Scheduled(fixedRate = 900000)
    public void limpiarPedidosExpirados() {
        log.info("Iniciando tarea de limpieza de pedidos expirados...");

        // Calculamos la hora límite: hace 30 minutos
        OffsetDateTime hace30Minutos = OffsetDateTime.now().minusMinutes(30);

        // Buscamos los pedidos "zombies"
        List<Pedido> pedidosExpirados = pedidoRepository
                .findByEstadoPedidoAndFechaCreacionBefore("PENDIENTE_PAGO", hace30Minutos);

        if (pedidosExpirados.isEmpty()) {
            log.info("No se encontraron pedidos expirados.");
            return;
        }

        // Cancelamos y liberamos el stock de cada uno
        for (Pedido pedido : pedidosExpirados) {
            try {
                pedidoService.cancelarPedidoYLiberarStock(pedido.getIdPedido());
                log.info("Pedido zombie {} limpiado exitosamente.", pedido.getIdPedido());
            } catch (Exception e) {
                log.error("Error al limpiar el pedido zombie {}", pedido.getIdPedido(), e);
            }
        }
    }
}