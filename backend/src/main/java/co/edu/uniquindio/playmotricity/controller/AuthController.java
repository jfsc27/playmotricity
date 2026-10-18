package co.edu.uniquindio.playmotricity.controller;

import co.edu.uniquindio.playmotricity.dto.AuthResponse;
import co.edu.uniquindio.playmotricity.dto.LoginRequest;
import co.edu.uniquindio.playmotricity.dto.RegistroDocenteRequest;
import co.edu.uniquindio.playmotricity.dto.RegistroPadreRequest;
import co.edu.uniquindio.playmotricity.dto.UsuarioResponse;
import co.edu.uniquindio.playmotricity.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/register/docente")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse registrarDocente(@Valid @RequestBody RegistroDocenteRequest request) {
        return authService.registrarDocente(request);
    }

    @PostMapping("/register/padre")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse registrarPadre(@Valid @RequestBody RegistroPadreRequest request) {
        return authService.registrarPadre(request);
    }

    @GetMapping("/me")
    public UsuarioResponse me(Authentication authentication) {
        return authService.perfilDe(authentication.getName());
    }

    @org.springframework.web.bind.annotation.PutMapping("/foto")
    public UsuarioResponse actualizarFoto(@RequestBody co.edu.uniquindio.playmotricity.dto.FotoRequest request, Authentication authentication) {
        return authService.actualizarFoto(authentication.getName(), request.fotoPerfil());
    }
}
