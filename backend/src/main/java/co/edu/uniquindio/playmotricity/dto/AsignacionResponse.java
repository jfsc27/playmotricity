package co.edu.uniquindio.playmotricity.dto;

import co.edu.uniquindio.playmotricity.entity.AsignacionActividad;
import co.edu.uniquindio.playmotricity.entity.EstadoAsignacion;
import co.edu.uniquindio.playmotricity.entity.ResultadoActividad;

import java.time.LocalDateTime;
import java.util.UUID;

public record AsignacionResponse(
        UUID id,
        EstadoAsignacion estado,
        LocalDateTime fechaAsignacion,
        UUID perfilId,
        String perfilNombre,
        UUID actividadId,
        String actividadNombre,
        ResultadoActividadResponse resultado
) {
    public static AsignacionResponse fromEntity(AsignacionActividad a, ResultadoActividad resultado) {
        return new AsignacionResponse(
                a.getId(),
                a.getEstado(),
                a.getFechaAsignacion(),
                a.getPerfil().getId(),
                a.getPerfil().getNombre(),
                a.getActividad().getId(),
                a.getActividad().getNombre(),
                resultado != null ? ResultadoActividadResponse.fromEntity(resultado) : null
        );
    }
}
