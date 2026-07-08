package com.smartlogix.msautenticacion.service;

import com.smartlogix.msautenticacion.dto.*;
import com.smartlogix.msautenticacion.model.Rol;
import com.smartlogix.msautenticacion.model.Usuario;
import com.smartlogix.msautenticacion.repository.UsuarioRepository;
import com.smartlogix.msautenticacion.security.CustomUserDetailsService;
import com.smartlogix.msautenticacion.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;

    public AuthResponse register(RegisterRequest request) {
        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new RuntimeException("Ya existe un usuario con ese correo");
        }

        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .correo(request.getCorreo())
                .password(passwordEncoder.encode(request.getPassword()))
                .rol(request.getRol() != null ? request.getRol() : Rol.CLIENTE)
                .activo(true)
                .build();

        Usuario guardado = usuarioRepository.save(usuario);

        UserDetails userDetails = userDetailsService.loadUserByUsername(guardado.getCorreo());

        String token = jwtService.generateToken(userDetails, Map.of(
                "rol", guardado.getRol().name(),
                "nombre", guardado.getNombre()
        ));

        return AuthResponse.builder()
                .token(token)
                .tipo("Bearer")
                .idUsuario(guardado.getIdUsuario())
                .nombre(guardado.getNombre())
                .correo(guardado.getCorreo())
                .rol(guardado.getRol().name())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getCorreo(),
                            request.getPassword()
                    )
            );
        } catch (AuthenticationException e) {
            throw new BadCredentialsException("Credenciales inválidas");
        }

        Usuario usuario = usuarioRepository.findByCorreo(request.getCorreo())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(usuario.getCorreo());

        String token = jwtService.generateToken(userDetails, Map.of(
                "rol", usuario.getRol().name(),
                "nombre", usuario.getNombre()
        ));

        return AuthResponse.builder()
                .token(token)
                .tipo("Bearer")
                .idUsuario(usuario.getIdUsuario())
                .nombre(usuario.getNombre())
                .correo(usuario.getCorreo())
                .rol(usuario.getRol().name())
                .build();
    }
    public UsuarioResponse me(String correo) {
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return UsuarioResponse.builder()
                .idUsuario(usuario.getIdUsuario())
                .nombre(usuario.getNombre())
                .correo(usuario.getCorreo())
                .rol(usuario.getRol().name())
                .activo(usuario.getActivo())
                .build();
    }
}