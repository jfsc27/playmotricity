package co.edu.uniquindio.playmotricity.dto;

import co.edu.uniquindio.playmotricity.entity.ReporteProgreso;

import java.time.LocalDateTime;
import java.util.UUID;

public record ReporteProgresoResponse(
        UUID id,
        UUID perfilId,
        String perfilNombre,
        LocalDateTime fechaGeneracion,
        int totalActividadesCompletadas,
        float promedioPuntaje,
        float promedioPrecision,
        float tiempoPromedioEjecucionSeg,
        String generadoPor
) {
    public static ReporteProgresoResponse fromEntity(ReporteProgreso r) {
        return new ReporteProgresoResponse(
                r.getId(),
                r.getPerfil().getId(),
                r.getPerfil().getNombre(),
                r.getFechaGeneracion(),
                r.getTotalActividadesCompletadas(),
                r.getPromedioPuntaje(),
                r.getPromedioPrecision(),
                r.getTiempoPromedioEjecucionSeg(),
                r.getUsuarioGenera().getNombre()
        );
    }
}
