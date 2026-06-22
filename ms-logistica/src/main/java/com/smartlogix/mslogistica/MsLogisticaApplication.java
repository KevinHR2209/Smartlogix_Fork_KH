package com.smartlogix.mslogistica;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@OpenAPIDefinition(servers = {@Server(url = "/", description = "Servidor API Gateway")})
@SpringBootApplication
public class MsLogisticaApplication {
    public static void main(String[] args) {
        SpringApplication.run(MsLogisticaApplication.class, args);
    }
}