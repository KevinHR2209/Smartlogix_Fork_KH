package com.smartlogix.msclientes.service;

import com.smartlogix.msclientes.model.Cliente;
import com.smartlogix.msclientes.model.DireccionCliente;
import com.smartlogix.msclientes.repository.ClienteRepository;
import com.smartlogix.msclientes.repository.DireccionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClienteServiceTest {

    @Mock
    private ClienteRepository repository;

    @Mock
    private DireccionRepository direccionRepository;

    @InjectMocks
    private ClienteService clienteService;

    private Cliente cliente;
    private DireccionCliente direccion;

    @BeforeEach
    void setUp() {
        cliente = Cliente.builder()
                .idCliente(1L)
                .rut("12345678-9")
                .nombre("Carlos")
                .apellidoPaterno("González")
                .apellidoMaterno("Pérez")
                .correo("carlos@email.com")
                .telefono("+56912345678")
                .build();

        direccion = DireccionCliente.builder()
                .idDireccion(1L)
                .cliente(cliente)
                .calle("Avenida Errázuriz")
                .numero("500")
                .detalle("Valparaíso")
                .idComuna(1)
                .esPrincipal(true)
                .build();
    }

    // ─── listar ──────────────────────────────────────────────────────────────

    @Test
    void listar_retornaClientesConRegion() {
        when(repository.findAll()).thenReturn(List.of(cliente));
        when(direccionRepository.findAll()).thenReturn(List.of(direccion));

        List<Cliente> resultado = clienteService.listar();

        assertEquals(1, resultado.size());
        assertEquals("Valparaíso", resultado.get(0).getRegion());
    }

    @Test
    void listar_clienteSinDireccionPrincipal_regionEsNull() {
        DireccionCliente sinPrincipal = DireccionCliente.builder()
                .idDireccion(2L)
                .cliente(cliente)
                .detalle("Coquimbo")
                .esPrincipal(false)
                .build();

        when(repository.findAll()).thenReturn(List.of(cliente));
        when(direccionRepository.findAll()).thenReturn(List.of(sinPrincipal));

        List<Cliente> resultado = clienteService.listar();

        assertNull(resultado.get(0).getRegion());
    }

    @Test
    void listar_sinClientes_retornaListaVacia() {
        when(repository.findAll()).thenReturn(List.of());

        List<Cliente> resultado = clienteService.listar();

        assertTrue(resultado.isEmpty());
        // si no hay clientes, no se consultan direcciones
        verify(direccionRepository, never()).findAll();
    }

    // ─── buscarPorId ─────────────────────────────────────────────────────────

    @Test
    void buscarPorId_existente_retornaCliente() {
        when(repository.findById(1L)).thenReturn(Optional.of(cliente));

        Cliente resultado = clienteService.buscarPorId(1L);

        assertNotNull(resultado);
        assertEquals("12345678-9", resultado.getRut());
    }

    @Test
    void buscarPorId_noExistente_lanzaExcepcion() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> clienteService.buscarPorId(99L));

        assertEquals("Cliente no encontrado", ex.getMessage());
    }

    // ─── crear ────────────────────────────────────────────────────────────────

    @Test
    void crear_guardaClienteYCreaUnadireccion() {
        Cliente nuevo = Cliente.builder()
                .rut("98765432-1")
                .nombre("Ana")
                .correo("ana@email.com")
                .build();

        Cliente guardado = Cliente.builder()
                .idCliente(2L)
                .rut("98765432-1")
                .nombre("Ana")
                .correo("ana@email.com")
                .build();

        when(repository.save(nuevo)).thenReturn(guardado);
        when(direccionRepository.save(any(DireccionCliente.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        Cliente resultado = clienteService.crear(nuevo);

        assertNotNull(resultado);
        assertEquals(2L, resultado.getIdCliente());
        // debe guardar exactamente una dirección
        verify(direccionRepository, times(1)).save(any(DireccionCliente.class));
    }

    @Test
    void crear_direccionGenerada_esPrincipalTrue() {
        when(repository.save(any())).thenReturn(cliente);

        ArgumentCaptor<DireccionCliente> captor = ArgumentCaptor.forClass(DireccionCliente.class);
        when(direccionRepository.save(captor.capture()))
                .thenAnswer(inv -> inv.getArgument(0));

        clienteService.crear(cliente);

        DireccionCliente dirCreada = captor.getValue();
        assertTrue(dirCreada.getEsPrincipal());
    }

    @Test
    void crear_direccionGenerada_tieneRegionValida() {
        List<String> regionesValidas = List.of("Valparaíso", "Coquimbo", "Metropolitana");

        when(repository.save(any())).thenReturn(cliente);

        ArgumentCaptor<DireccionCliente> captor = ArgumentCaptor.forClass(DireccionCliente.class);
        when(direccionRepository.save(captor.capture()))
                .thenAnswer(inv -> inv.getArgument(0));

        clienteService.crear(cliente);

        String regionGenerada = captor.getValue().getDetalle();
        assertTrue(regionesValidas.contains(regionGenerada),
                "La región generada '" + regionGenerada + "' no es válida");
    }

    @Test
    void crear_retornaClienteConRegionAsignada() {
        when(repository.save(any())).thenReturn(cliente);
        when(direccionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Cliente resultado = clienteService.crear(cliente);

        assertNotNull(resultado.getRegion(),
                "El cliente retornado debe tener región asignada");
    }

    // ─── actualizar ───────────────────────────────────────────────────────────

    @Test
    void actualizar_modificaTodosLosCampos() {
        Cliente cambios = Cliente.builder()
                .rut("11111111-1")
                .nombre("Pedro")
                .apellidoPaterno("Martínez")
                .apellidoMaterno("López")
                .correo("pedro@email.com")
                .telefono("+56911111111")
                .build();

        when(repository.findById(1L)).thenReturn(Optional.of(cliente));
        when(repository.save(any(Cliente.class))).thenAnswer(inv -> inv.getArgument(0));

        Cliente resultado = clienteService.actualizar(1L, cambios);

        assertEquals("11111111-1", resultado.getRut());
        assertEquals("Pedro", resultado.getNombre());
        assertEquals("Martínez", resultado.getApellidoPaterno());
        assertEquals("pedro@email.com", resultado.getCorreo());
        verify(repository).save(cliente);
    }

    @Test
    void actualizar_noExistente_lanzaExcepcion() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
                () -> clienteService.actualizar(99L, new Cliente()));
    }

    @Test
    void actualizar_noTocaDirecciones() {
        when(repository.findById(1L)).thenReturn(Optional.of(cliente));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        clienteService.actualizar(1L, cliente);

        verify(direccionRepository, never()).save(any());
        verify(direccionRepository, never()).deleteById(any());
    }

    // ─── eliminar ─────────────────────────────────────────────────────────────

    @Test
    void eliminar_llamaDeleteById() {
        doNothing().when(repository).deleteById(1L);

        clienteService.eliminar(1L);

        verify(repository, times(1)).deleteById(1L);
    }
}