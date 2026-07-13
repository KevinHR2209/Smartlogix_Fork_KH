package com.smartlogix.msautenticacion.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlogix.msautenticacion.dto.*;
import com.smartlogix.msautenticacion.model.Rol;
import com.smartlogix.msautenticacion.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Pruebas de capa web para AuthController.
 * Casos AU-01 al AU-10 del Plan de Pruebas SmartLogix.
 *
 * Se usa @WebMvcTest + @MockBean para aislar el controller de la BD y JWT.
 */
@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    // ── Helpers de construcción de DTOs ────────────────────────────────────

    private RegisterRequest buildRegisterRequest(String correo) {
        DireccionPrincipalRequest dir = DireccionPrincipalRequest.builder()
                .idComuna(1)
                .calle("Av. Principal")
                .numero("123")
                .detalle("Depto 4")
                .build();

        RegisterRequest req = new RegisterRequest();
        req.setNombre("Test");
        req.setApellidoPaterno("Prueba");
        req.setApellidoMaterno("QA");
        req.setCorreo(correo);
        req.setPassword("Password123!");
        req.setRol(Rol.CLIENTE);
        req.setRut("12.345.678-9");
        req.setTelefono("+56912345678");
        req.setDireccionPrincipal(dir);
        return req;
    }

    private AuthResponse buildAuthResponse() {
        return AuthResponse.builder()
                .token("jwt.token.test")
                .tipo("Bearer")
                .idUsuario(1L)
                .nombre("Test Prueba")
                .correo("usuario@test.com")
                .rol("CLIENTE")
                .build();
    }

    // ── AU-01: Registro exitoso ────────────────────────────────────────────

    @Test
    @DisplayName("AU-01 - Registro exitoso retorna 201 y JWT")
    @WithMockUser
    void AU01_registroExitoso() throws Exception {
        when(authService.register(any())).thenReturn(buildAuthResponse());

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildRegisterRequest("nuevo@test.com"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("jwt.token.test"))
                .andExpect(jsonPath("$.tipo").value("Bearer"))
                .andExpect(jsonPath("$.rol").value("CLIENTE"));
    }

    // ── AU-02: Registro con correo duplicado ──────────────────────────────

    @Test
    @DisplayName("AU-02 - Registro con correo duplicado retorna 4xx")
    @WithMockUser
    void AU02_registroCorreoDuplicado() throws Exception {
        when(authService.register(any()))
                .thenThrow(new RuntimeException("Ya existe un usuario con ese correo"));

        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildRegisterRequest("existente@test.com"))))
                .andExpect(status().is4xxClientError());
    }

    // ── AU-03: Registro con body vacío → @Valid activa 400 ────────────────

    @Test
    @DisplayName("AU-03 - Registro con body vacío retorna 400 por validaciones @NotBlank")
    @WithMockUser
    void AU03_registroCamposVacios() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                // GlobalExceptionHandler devuelve mapa de errores de campo
                .andExpect(jsonPath("$.correo").exists());
    }

    // ── AU-04: Login correcto ─────────────────────────────────────────────

    @Test
    @DisplayName("AU-04 - Login con credenciales válidas retorna 200 y token")
    @WithMockUser
    void AU04_loginCorrecto() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setCorreo("usuario@test.com");
        req.setPassword("Password123!");

        when(authService.login(any())).thenReturn(buildAuthResponse());

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt.token.test"))
                .andExpect(jsonPath("$.correo").value("usuario@test.com"));
    }

    // ── AU-05: Login con password incorrecto ──────────────────────────────

    @Test
    @DisplayName("AU-05 - Login con password incorrecto retorna 401")
    @WithMockUser
    void AU05_loginPasswordIncorrecto() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setCorreo("usuario@test.com");
        req.setPassword("WrongPass!");

        when(authService.login(any()))
                .thenThrow(new BadCredentialsException("Credenciales inválidas"));

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    // ── AU-06: Login con correo inexistente ───────────────────────────────

    @Test
    @DisplayName("AU-06 - Login con correo inexistente retorna 401")
    @WithMockUser
    void AU06_loginCorreoInexistente() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setCorreo("noexiste@test.com");
        req.setPassword("Password123!");

        when(authService.login(any()))
                .thenThrow(new BadCredentialsException("Credenciales inválidas"));

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    // ── AU-07: GET /me con JWT válido ─────────────────────────────────────

    @Test
    @DisplayName("AU-07 - GET /me con token válido retorna 200 y datos del usuario")
    @WithMockUser(username = "usuario@test.com")
    void AU07_obtenerPerfilAutenticado() throws Exception {
        UsuarioResponse resp = UsuarioResponse.builder()
                .idUsuario(1L)
                .nombre("Test Prueba")
                .correo("usuario@test.com")
                .rol("CLIENTE")
                .activo(true)
                .build();

        when(authService.me(anyString())).thenReturn(resp);

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correo").value("usuario@test.com"))
                .andExpect(jsonPath("$.activo").value(true));
    }

    // ── AU-08: GET /me sin token → 401 ────────────────────────────────────

    @Test
    @DisplayName("AU-08 - GET /me sin token retorna 401")
    @WithAnonymousUser
    void AU08_accesoMeSinToken() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    // ── AU-09: GET /validate con token válido ─────────────────────────────

    @Test
    @DisplayName("AU-09 - GET /validate con token válido retorna authenticated:true y correo")
    @WithMockUser(username = "usuario@test.com")
    void AU09_validarTokenVigente() throws Exception {
        mockMvc.perform(get("/api/auth/validate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true))
                .andExpect(jsonPath("$.correo").value("usuario@test.com"));
    }

    // ── AU-10: GET /validate sin token → 401 ─────────────────────────────

    @Test
    @DisplayName("AU-10 - GET /validate sin token retorna 401")
    @WithAnonymousUser
    void AU10_validarTokenInvalido() throws Exception {
        mockMvc.perform(get("/api/auth/validate"))
                .andExpect(status().isUnauthorized());
    }
}
