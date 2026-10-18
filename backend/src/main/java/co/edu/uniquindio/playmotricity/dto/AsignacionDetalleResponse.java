package co.edu.uniquindio.playmotricity.dto;

import co.edu.uniquindio.playmotricity.entity.Actividad;
import co.edu.uniquindio.playmotricity.entity.AsignacionActividad;
import co.edu.uniquindio.playmotricity.entity.DesafioMotriz;
import co.edu.uniquindio.playmotricity.entity.EstadoAsignacion;
import co.edu.uniquindio.playmotricity.entity.Minijuego;
import co.edu.uniquindio.playmotricity.entity.TipoActividad;

import java.time.LocalDateTime;
import java.util.UUID;

public record AsignacionDetalleResponse(
        UUID id,
        EstadoAsignacion estado,
        LocalDateTime fechaAsignacion,
        UUID perfilId,
        String perfilNombre,
        UUID actividadId,
        String actividadNombre,
        TipoActividad tipoActividad,
        String subtipo,
        String formatoInteraccion,
        Integer duracionEstimadaSeg,
        String instrucciones,
        String tipoMovimiento,
        Boolean requiereAcompanante
) {
    public static AsignacionDetalleResponse fromEntity(AsignacionActividad a) {
        Actividad act = a.getActividad();
        String subtipo = "ACTIVIDAD";
        String formato = null;
        Integer duracion = null;
        String movimiento = null;
        Boolean acompanante = null;

        if (act instanceof Minijuego m) {
            subtipo = "MINIJUEGO";
            formato = m.getFormatoInteraccion();
            duracion = m.getDuracionEstimadaSeg();
        } else if (act instanceof DesafioMotriz d) {
            subtipo = "DESAFIO_MOTRIZ";
            movimiento = d.getTipoMovimiento();
            acompanante = d.isRequiereAcompanante();
        }

        return new AsignacionDetalleResponse(
                a.getId(),
                a.getEstado(),
                a.getFechaAsignacion(),
                a.getPerfil().getId(),
                a.getPerfil().getNombre(),
                act.getId(),
                act.getNombre(),
                act.getTipoActividad(),
                subtipo,
                formato,
                duracion,
                act.getInstrucciones(),
                movimiento,
                acompanante
        );
    }
}
