package com.smartlogix.inventario.controller;

import com.smartlogix.inventario.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/archivos")
@RequiredArgsConstructor
public class FileController {

    private final S3Service s3Service;

    @PostMapping("/subir")
    public ResponseEntity<String> subirArchivo(
            @RequestParam("archivo") MultipartFile archivo,
            @RequestParam("sku") String sku) {
        try {
            String urlPublica = s3Service.subirArchivo(archivo, sku);
            return ResponseEntity.ok(urlPublica);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al subir a S3: " + e.getMessage());
        }
    }
}