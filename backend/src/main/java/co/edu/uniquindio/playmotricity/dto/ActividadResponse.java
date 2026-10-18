package co.edu.uniquindio.playmotricity.dto;

import co.edu.uniquindio.playmotricity.entity.Actividad;
import co.edu.uniquindio.playmotricity.entity.DesafioMotriz;
import co.edu.uniquindio.playmotricity.entity.Minijuego;
import co.edu.uniquindio.playmotricity.entity.TipoActividad;

import java.util.UUID;

public record ActividadResponse(
        UUID id,
        String nombre,
        String descripcion,
        TipoActividad tipoActividad,
        int edadMinima,
        int edadMaxima,
        String instrucciones,
        String subtipo,
        String formatoInteraccion,
        Integer duracionEstimadaSeg,
        String tipoMovimiento,
        Boolean requiereAcompanante
) {
    public static ActividadResponse fromEntity(Actividad a) {
        String subtipo = "ACTIVIDAD";
        String formato = null;
        Integer duracion = null;
        String movimiento = null;
        Boolean acompanante = null;

        if (a instanceof Minijuego m) {
            subtipo = "MINIJUEGO";
            formato = m.getFormatoInteraccion();
            duracion = m.getDuracionEstimadaSeg();
        } else if (a instanceof DesafioMotriz d) {
            subtipo = "DESAFIO_MOTRIZ";
            movimiento = d.getTipoMovimiento();
            acompanante = d.isRequiereAcompanante();
        }

        return new ActividadResponse(
                a.getId(),
                a.getNombre(),
                a.getDescripcion(),
                a.getTipoActividad(),
                a.getEdadMinima(),
                a.getEdadMaxima(),
                a.getInstrucciones(),
                subtipo,
                formato,
                duracion,
                movimiento,
                acompanante
        );
    }
}
