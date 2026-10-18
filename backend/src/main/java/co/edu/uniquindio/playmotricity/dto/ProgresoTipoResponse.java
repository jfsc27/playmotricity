package co.edu.uniquindio.playmotricity.dto;

import co.edu.uniquindio.playmotricity.entity.TipoActividad;

public record ProgresoTipoResponse(
        TipoActividad tipoActividad,
        int completadas,
        Double promedioPuntaje
) {
}
