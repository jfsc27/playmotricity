package co.edu.uniquindio.playmotricity.controller;

import co.edu.uniquindio.playmotricity.dto.AsignacionResponse;
import co.edu.uniquindio.playmotricity.dto.RegistrarResultadoRequest;
import co.edu.uniquindio.playmotricity.dto.ResultadoActividadResponse;
import co.edu.uniquindio.playmotricity.service.IRegistroResultados;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/asignaciones")
public class AsignacionController {

    private final IRegistroResultados registroResultados;

    public AsignacionController(IRegistroResultados registroResultados) {
        this.registroResultados = registroResultados;
    }

    @GetMapping("/{id}")
    public AsignacionResponse obtener(@PathVariable UUID id, Authentication authentication) {
        return registroResultados.obtenerAsignacion(id, authentication.getName());
    }

    @PostMapping("/{id}/resultados")
    @ResponseStatus(HttpStatus.CREATED)
    public ResultadoActividadResponse registrarResultado(
            @PathVariable UUID id,
            @Valid @RequestBody RegistrarResultadoRequest request,
            Authentication authentication
    ) {
        return registroResultados.registrarResultado(id, request, authentication.getName());
    }
}
