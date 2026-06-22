package com.smartlogix.inventario.config;

import com.smartlogix.inventario.entity.Bodega;
import com.smartlogix.inventario.entity.Producto;
import com.smartlogix.inventario.entity.ProductoBodega;
import com.smartlogix.inventario.repository.BodegaRepository;
import com.smartlogix.inventario.repository.ProductoBodegaRepository;
import com.smartlogix.inventario.repository.ProductoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;

@Configuration
public class DataSeeder {

    @Bean
    @Transactional
    CommandLineRunner initDatabase(BodegaRepository bodegaRepo,
                                   ProductoRepository productoRepo,
                                   ProductoBodegaRepository stockRepo) {
        return args -> {
            if (bodegaRepo.count() == 0) {
                // 1. Crear Bodegas
                Bodega b1 = new Bodega();
                b1.setNombre("Bodega Central");
                b1.setDireccionFisica("Avenida Errázuriz 123, Valparaíso");

                Bodega b2 = new Bodega();
                b2.setNombre("Bodega Norte");
                b2.setDireccionFisica("Ruta 5 Norte Km 400, Coquimbo");

                Bodega b3 = new Bodega();
                b3.setNombre("Bodega Metropolitana");
                b3.setDireccionFisica("Alameda 456, Santiago, Metropolitana");

                bodegaRepo.saveAll(List.of(b1, b2, b3));

                // 2. Crear Productos iniciales
                if (productoRepo.count() == 0) {
                    Producto p1 = new Producto();
                    p1.setSku("TEC-001");
                    p1.setNombre("Teclado Mecánico RGB");
                    p1.setPrecioActual(45000);
                    p1.setEstado("ACTIVO");
                    p1.setPesoGramos(800);
                    p1.setDimensiones("44 x 13 x 3 cm");
                    p1.setDescripcion("Teclado mecánico con switches Blue, retroiluminación RGB personalizable por tecla, estructura de aluminio y disposición TKL. Compatible con Windows y macOS.");

                    Producto p2 = new Producto();
                    p2.setSku("MOU-002");
                    p2.setNombre("Mouse Gamer Inalámbrico");
                    p2.setPrecioActual(35000);
                    p2.setEstado("ACTIVO");
                    p2.setPesoGramos(150);
                    p2.setDimensiones("12 x 6 x 4 cm");
                    p2.setDescripcion("Mouse inalámbrico con sensor óptico de 16000 DPI, autonomía de 70 horas, 6 botones programables y conexión dual USB-A / Bluetooth 5.0.");

                    Producto p3 = new Producto();
                    p3.setSku("MON-003");
                    p3.setNombre("Monitor 24 pulgadas 144Hz");
                    p3.setPrecioActual(150000);
                    p3.setEstado("ACTIVO");
                    p3.setPesoGramos(4500);
                    p3.setDimensiones("54 x 32 x 20 cm");
                    p3.setDescripcion("Monitor IPS Full HD 1080p de 24 pulgadas con tasa de refresco de 144Hz, tiempo de respuesta 1ms, compatible con FreeSync y G-Sync. Incluye entradas HDMI y DisplayPort.");

                    productoRepo.saveAll(List.of(p1, p2, p3));

                    // 3. Distribuir Stock Aleatorio en todas las bodegas
                    Random random = new Random();
                    List<Bodega> todasLasBodegas = bodegaRepo.findAll();
                    List<Producto> todosLosProductos = productoRepo.findAll();

                    for (Producto producto : todosLosProductos) {
                        for (Bodega bodega : todasLasBodegas) {
                            ProductoBodega stock = new ProductoBodega();
                            stock.setProducto(producto);
                            stock.setBodega(bodega);
                            stock.setStockDisponible(random.nextInt(91) + 10);
                            stock.setStockReservado(0);
                            stockRepo.save(stock);
                        }
                    }
                    System.out.println("✅ STARTUP: Base de datos inicializada con 3 Bodegas, 3 Productos y Stock aleatorio.");
                }
            }
        };
    }
}