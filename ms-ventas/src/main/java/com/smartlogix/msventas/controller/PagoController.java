package com.smartlogix.msventas.controller;

import com.smartlogix.msventas.model.Pago;
import com.smartlogix.msventas.repository.PagoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
public class PagoController {

    private final PagoRepository pagoRepository;

    @GetMapping
    public List<Pago> listar() {
        return pagoRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Pago> registrar(@RequestBody Pago pago) {
        if (pago.getFechaPago() == null) {
            pago.setFechaPago(OffsetDateTime.now());
        }
        Pago guardado = pagoRepository.save(pago);
        return ResponseEntity.status(201).body(guardado);
    }
}