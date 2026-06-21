package com.smartlogix.mslogistica.config;

import com.smartlogix.mslogistica.model.Transportista;
import com.smartlogix.mslogistica.repository.TransportistaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initLogistica(TransportistaRepository transportistaRepo) {
        return args -> {
            if (transportistaRepo.count() == 0) {
                Transportista t1 = new Transportista();
                t1.setNombreCompleto("Juan Pérez - Express");
                t1.setPatenteVehiculo("AB-CD-12");
                t1.setTelefonoContacto("+56912345678");
                t1.setEstado("DISPONIBLE");

                Transportista t2 = new Transportista();
                t2.setNombreCompleto("Logística Rápida S.A.");
                t2.setPatenteVehiculo("XX-YY-99");
                t2.setTelefonoContacto("+56987654321");
                t2.setEstado("DISPONIBLE");

                transportistaRepo.save(t1);
                transportistaRepo.save(t2);
                System.out.println("🚚 LOGÍSTICA STARTUP: 2 Transportistas creados por defecto.");
            }
        };
    }
}