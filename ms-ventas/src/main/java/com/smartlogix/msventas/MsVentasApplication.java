package com.smartlogix.msventas;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@OpenAPIDefinition(servers = {@Server(url = "/", description = "Servidor API Gateway")})
@SpringBootApplication
public class MsVentasApplication {
    public static void main(String[] args) {
        SpringApplication.run(MsVentasApplication.class, args);
    }
}