package co.edu.uniquindio.playmotricity.dto;

import co.edu.uniquindio.playmotricity.entity.EstadoAsignacion;
import co.edu.uniquindio.playmotricity.entity.ResultadoActividad;

import java.time.LocalDateTime;
import java.util.UUID;

public record ResultadoActividadResponse(
        UUID id,
        UUID asignacionId,
        float puntaje,
        float precision,
        int tiempoEjecucionSeg,
        boolean completada,
        LocalDateTime fechaRealizacion,
        EstadoAsignacion estadoAsignacion
) {
    public static ResultadoActividadResponse fromEntity(ResultadoActividad r) {
        return new ResultadoActividadResponse(
                r.getId(),
                r.getAsignacion().getId(),
                r.getPuntaje(),
                r.getPrecision(),
                r.getTiempoEjecucionSeg(),
                r.isCompletada(),
                r.getFechaRealizacion(),
                r.getAsignacion().getEstado()
        );
    }
}
