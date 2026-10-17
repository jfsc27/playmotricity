package co.edu.uniquindio.playmotricity.controller;

import co.edu.uniquindio.playmotricity.dto.ActualizarPerfilRequest;
import co.edu.uniquindio.playmotricity.dto.CrearPerfilRequest;
import co.edu.uniquindio.playmotricity.dto.PerfilInfantilResponse;
import co.edu.uniquindio.playmotricity.entity.PerfilInfantil;
import co.edu.uniquindio.playmotricity.service.IGestorPerfiles;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/perfiles")
public class PerfilInfantilController {

    private final IGestorPerfiles gestorPerfiles;

    public PerfilInfantilController(IGestorPerfiles gestorPerfiles) {
        this.gestorPerfiles = gestorPerfiles;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PerfilInfantilResponse crearPerfil(
            @Valid @RequestBody CrearPerfilRequest request,
            Authentication authentication
    ) {
        PerfilInfantil nuevo = new PerfilInfantil(
                request.nombre(),
                request.fechaNacimiento(),
                request.grupoGrado()
        );
        PerfilInfantil guardado = gestorPerfiles.crearPerfilParaUsuario(nuevo, authentication.getName());
        return PerfilInfantilResponse.fromEntity(guardado);
    }

    @GetMapping
    public List<PerfilInfantilResponse> listarMisPerfiles(Authentication authentication) {
        return gestorPerfiles.listarPerfilesDeUsuario(authentication.getName())
                .stream()
                .map(PerfilInfantilResponse::fromEntity)
                .toList();
    }

    @GetMapping("/{id}")
    public PerfilInfantilResponse obtenerPerfil(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        PerfilInfantil perfil = gestorPerfiles.obtenerPerfilDeUsuario(id, authentication.getName());
        return PerfilInfantilResponse.fromEntity(perfil);
    }

    @PutMapping("/{id}")
    public PerfilInfantilResponse actualizarPerfil(
            @PathVariable UUID id,
            @Valid @RequestBody ActualizarPerfilRequest request,
            Authentication authentication
    ) {
        PerfilInfantil datos = new PerfilInfantil(
                request.nombre(),
                request.fechaNacimiento(),
                request.grupoGrado()
        );
        PerfilInfantil actualizado = gestorPerfiles.actualizarPerfilDeUsuario(id, datos, authentication.getName());
        return PerfilInfantilResponse.fromEntity(actualizado);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminarPerfil(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        gestorPerfiles.eliminarPerfilDeUsuario(id, authentication.getName());
    }
}
