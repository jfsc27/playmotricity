package co.edu.uniquindio.playmotricity.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Información de progreso calculada en el momento (no se guarda).
 * Los promedios se calculan solo sobre actividades completadas; son null si aún no hay ninguna.
 */
public record ProgresoPerfilResponse(
        UUID perfilId,
        String perfilNombre,
        int edad,
        int totalAsignadas,
        int completadas,
        int enProgreso,
        int pendientes,
        double porcentajeAvance,
        Double promedioPuntaje,
        Double promedioPrecision,
        Double tiempoPromedioEjecucionSeg,
        String nivel,
        String mensaje,
        LocalDateTime ultimaActividad,
        List<ProgresoTipoResponse> progresoPorTipo
) {
}
