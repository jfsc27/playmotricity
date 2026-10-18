package co.edu.uniquindio.playmotricity.dto;

import co.edu.uniquindio.playmotricity.entity.AsignacionActividad;
import co.edu.uniquindio.playmotricity.entity.EstadoAsignacion;
import co.edu.uniquindio.playmotricity.entity.ResultadoActividad;
import co.edu.uniquindio.playmotricity.entity.TipoActividad;

import java.time.LocalDateTime;
import java.util.UUID;

/** Resultado de una actividad junto con los datos de la actividad y de su asignación. */
public record ResultadoDetalleResponse(
        UUID resultadoId,
        UUID asignacionId,
        UUID actividadId,
        String actividadNombre,
        TipoActividad tipoActividad,
        EstadoAsignacion estadoAsignacion,
        boolean completada,
        float puntaje,
        float precision,
        int tiempoEjecucionSeg,
        LocalDateTime fechaAsignacion,
        LocalDateTime fechaRealizacion
) {
    public static ResultadoDetalleResponse fromEntity(ResultadoActividad r) {
        AsignacionActividad a = r.getAsignacion();
        return new ResultadoDetalleResponse(
                r.getId(),
                a.getId(),
                a.getActividad().getId(),
                a.getActividad().getNombre(),
                a.getActividad().getTipoActividad(),
                a.getEstado(),
                r.isCompletada(),
                r.getPuntaje(),
                r.getPrecision(),
                r.getTiempoEjecucionSeg(),
                a.getFechaAsignacion(),
                r.getFechaRealizacion()
        );
    }
}
