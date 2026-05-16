package com.smartlogix.gateway;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RequestPredicates;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;
import static org.springframework.cloud.gateway.server.mvc.filter.BeforeFilterFunctions.uri;

@Configuration
public class GatewayConfig {

    // 1. Ruta para ms-inventario (Puerto 8081)
    @Bean
    public RouterFunction<ServerResponse> inventarioRoute() {
        return route("inventario_route")
                .route(RequestPredicates.path("/api/productos").or(RequestPredicates.path("/api/productos/**")), http())
                .before(uri("http://localhost:8081"))
                .build();
    }

    // 2. Ruta para ms-clientes (Puerto 8082)
    @Bean
    public RouterFunction<ServerResponse> clientesRoute() {
        return route("clientes_route")
                .route(RequestPredicates.path("/api/clientes").or(RequestPredicates.path("/api/clientes/**")), http())
                .before(uri("http://localhost:8082"))
                .build();
    }

    // 3. Ruta para ms-ventas (Puerto 8083) - Incluye pedidos y pagos
    @Bean
    public RouterFunction<ServerResponse> ventasRoute() {
        return route("ventas_route")
                .route(RequestPredicates.path("/api/pedidos").or(RequestPredicates.path("/api/pedidos/**"))
                        .or(RequestPredicates.path("/api/pagos")).or(RequestPredicates.path("/api/pagos/**")), http())
                .before(uri("http://localhost:8083"))
                .build();
    }

    // 4. Ruta para ms-logistica (Puerto 8084) - Incluye despachos y transportistas
    @Bean
    public RouterFunction<ServerResponse> logisticaRoute() {
        return route("logistica_route")
                .route(RequestPredicates.path("/api/despachos").or(RequestPredicates.path("/api/despachos/**"))
                        .or(RequestPredicates.path("/api/transportistas")).or(RequestPredicates.path("/api/transportistas/**")), http())
                .before(uri("http://localhost:8084"))
                .build();
    }
}