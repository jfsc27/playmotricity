package co.edu.uniquindio.playmotricity.controller;

import co.edu.uniquindio.playmotricity.dto.ActividadResponse;
import co.edu.uniquindio.playmotricity.dto.AsignacionDetalleResponse;
import co.edu.uniquindio.playmotricity.dto.AsignarActividadRequest;
import co.edu.uniquindio.playmotricity.dto.RegistrarResultadoDirectoRequest;
import co.edu.uniquindio.playmotricity.dto.ResultadoActividadResponse;
import co.edu.uniquindio.playmotricity.entity.Actividad;
import co.edu.uniquindio.playmotricity.entity.AsignacionActividad;
import co.edu.uniquindio.playmotricity.entity.EstadoAsignacion;
import co.edu.uniquindio.playmotricity.entity.TipoActividad;
import co.edu.uniquindio.playmotricity.service.IGestorActividades;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/actividades")
public class ActividadController {

    private final IGestorActividades gestorActividades;

    public ActividadController(IGestorActividades gestorActividades) {
        this.gestorActividades = gestorActividades;
    }

    @GetMapping
    public List<ActividadResponse> listarActividades(
            @RequestParam(required = false) Integer edad,
            @RequestParam(required = false) TipoActividad tipo
    ) {
        List<Actividad> lista;
        if (edad != null) {
            lista = gestorActividades.listarPorEdad(edad);
        } else if (tipo != null) {
            lista = gestorActividades.listarPorTipo(tipo);
        } else {
            lista = gestorActividades.listarTodas();
        }

        return lista.stream()
                .map(ActividadResponse::fromEntity)
                .toList();
    }

    @GetMapping("/{id}")
    public ActividadResponse obtenerActividad(@PathVariable UUID id) {
        return ActividadResponse.fromEntity(gestorActividades.obtener(id));
    }

    @PostMapping("/asignar")
    @ResponseStatus(HttpStatus.CREATED)
    public AsignacionDetalleResponse asignarActividad(
            @Valid @RequestBody AsignarActividadRequest request,
            Authentication authentication
    ) {
        AsignacionActividad asignacion = gestorActividades.asignarActividad(
                request.perfilId(),
                request.actividadId(),
                authentication.getName()
        );
        return AsignacionDetalleResponse.fromEntity(asignacion);
    }

    @GetMapping("/asignaciones/{perfilId}")
    public List<AsignacionDetalleResponse> listarAsignaciones(
            @PathVariable UUID perfilId,
            @RequestParam(required = false) EstadoAsignacion estado,
            Authentication authentication
    ) {
        List<AsignacionActividad> asignaciones;
        if (estado != null) {
            asignaciones = gestorActividades.listarAsignacionesPorEstado(perfilId, estado, authentication.getName());
        } else {
            asignaciones = gestorActividades.listarAsignaciones(perfilId, authentication.getName());
        }

        return asignaciones.stream()
                .map(AsignacionDetalleResponse::fromEntity)
                .toList();
    }

    @PostMapping("/resultados")
    @ResponseStatus(HttpStatus.CREATED)
    public ResultadoActividadResponse registrarResultado(
            @Valid @RequestBody RegistrarResultadoDirectoRequest request,
            Authentication authentication
    ) {
        return gestorActividades.registrarResultadoDirecto(request, authentication.getName());
    }
}
