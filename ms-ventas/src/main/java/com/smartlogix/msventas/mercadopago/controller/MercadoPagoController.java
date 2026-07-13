package com.smartlogix.msventas.mercadopago.controller;

import com.smartlogix.msventas.mercadopago.dto.MercadoPagoDto.PreferenciaResponse;
import com.smartlogix.msventas.mercadopago.dto.MercadoPagoDto.WebhookNotification;
import com.smartlogix.msventas.mercadopago.service.MercadoPagoService;
import com.smartlogix.msventas.model.Pago;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/pagos/mercadopago")
@RequiredArgsConstructor
public class MercadoPagoController {

    private final MercadoPagoService mercadoPagoService;

    /**
     * Inicia el pago de un pedido: crea una preferencia en Mercado Pago y
     * devuelve la URL de checkout. En modo de prueba (access token TEST-...),
     * usar sandboxInitPoint junto con una cuenta de comprador de prueba.
     *
     * No requiere el header Authorization a proposito: este endpoint es
     * llamado por el flujo de checkout del propio pedido ya creado (que si
     * paso por la validacion de PedidoController al crearse). Si se quiere
     * agregar la misma proteccion IDOR que tiene el resto de ms-ventas,
     * agregar aqui la misma validacion de token + comparacion de idCliente
     * que usan PedidoController/PagoController.
     */
    @PostMapping("/preferencia/{idPedido}")
    public ResponseEntity<PreferenciaResponse> iniciarPago(@PathVariable Long idPedido) {
        PreferenciaResponse preferencia = mercadoPagoService.iniciarPago(idPedido);
        return ResponseEntity.status(201).body(preferencia);
    }

    /**
     * Consulta el estado del ultimo pago registrado localmente para un
     * pedido (no llama a Mercado Pago, lee el estado ya guardado por el
     * webhook). Sirve para hacer polling desde un frontend de prueba.
     */
    @GetMapping("/estado/{idPedido}")
    public ResponseEntity<Pago> consultarEstado(@PathVariable Long idPedido) {
        return ResponseEntity.ok(mercadoPagoService.consultarEstado(idPedido));
    }

    /**
     * Webhook que Mercado Pago llama cuando cambia el estado de un pago.
     * Acepta tanto el formato "webhooks v2" (JSON body con type/data.id)
     * como el formato IPN legacy (query params topic/id).
     *
     * Siempre responde 200 rapido (Mercado Pago reintenta si no responde
     * 2xx). Los errores se loguean pero no se propagan como error HTTP,
     * para no quedar en un loop de reintentos por un problema que no se
     * resuelve solo (ej. pedido de prueba que ya no existe).
     */
    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(
            @RequestBody(required = false) WebhookNotification body,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String id
    ) {
        String tipo = body != null ? body.type() : topic;
        String idPago = body != null && body.data() != null ? body.data().id() : id;

        if ("payment".equals(tipo) && idPago != null) {
            try {
                mercadoPagoService.procesarNotificacionPago(idPago);
            } catch (Exception e) {
                log.warn("Error procesando webhook de Mercado Pago para pago {}: {}", idPago, e.getMessage());
            }
        } else {
            log.info("Webhook de Mercado Pago ignorado (tipo={}, id={})", tipo, idPago);
        }
        return ResponseEntity.ok().build();
    }
}
