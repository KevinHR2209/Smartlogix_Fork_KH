package com.smartlogix.msclientes.service;

import com.smartlogix.msclientes.model.Cliente;
import com.smartlogix.msclientes.repository.ClienteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClienteServiceTest {

    @Mock
    private ClienteRepository repository;

    @InjectMocks
    private ClienteService service;

    private Cliente cliente;

    @BeforeEach
    void setUp() {
        cliente = new Cliente();
        cliente.setIdCliente(1L);
        cliente.setRut("12345678-9");
        cliente.setNombre("Kevin");
        cliente.setApellidoPaterno("Hernandez");
        cliente.setApellidoMaterno("Ramirez");
        cliente.setCorreo("kevin@test.com");
        cliente.setTelefono("912345678");
    }

    @Test
    void listar_debeRetornarListaDeClientes() {
        when(repository.findAll()).thenReturn(Arrays.asList(cliente));
        List<Cliente> resultado = service.listar();
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals("Kevin", resultado.get(0).getNombre());
        verify(repository, times(1)).findAll();
    }

    @Test
    void buscarPorId_cuandoExiste_debeRetornarCliente() {
        when(repository.findById(1L)).thenReturn(Optional.of(cliente));
        Cliente resultado = service.buscarPorId(1L);
        assertNotNull(resultado);
        assertEquals(1L, resultado.getIdCliente());
        assertEquals("kevin@test.com", resultado.getCorreo());
    }

    @Test
    void buscarPorId_cuandoNoExiste_debeLanzarExcepcion() {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.buscarPorId(99L));
        assertEquals("Cliente no encontrado", ex.getMessage());
    }

    @Test
    void crear_debeGuardarYRetornarCliente() {
        when(repository.save(any(Cliente.class))).thenReturn(cliente);
        Cliente resultado = service.crear(cliente);
        assertNotNull(resultado);
        assertEquals("12345678-9", resultado.getRut());
        verify(repository, times(1)).save(cliente);
    }

    @Test
    void actualizar_cuandoExiste_debeActualizarDatos() {
        Cliente actualizado = new Cliente();
        actualizado.setRut("98765432-1");
        actualizado.setNombre("Carlos");
        actualizado.setApellidoPaterno("Perez");
        actualizado.setApellidoMaterno("Lopez");
        actualizado.setCorreo("carlos@test.com");
        actualizado.setTelefono("987654321");
        when(repository.findById(1L)).thenReturn(Optional.of(cliente));
        when(repository.save(any(Cliente.class))).thenReturn(cliente);
        Cliente resultado = service.actualizar(1L, actualizado);
        assertNotNull(resultado);
        verify(repository).save(any(Cliente.class));
    }

    @Test
    void eliminar_debeInvocarDeleteById() {
        doNothing().when(repository).deleteById(1L);
        service.eliminar(1L);
        verify(repository, times(1)).deleteById(1L);
    }
}