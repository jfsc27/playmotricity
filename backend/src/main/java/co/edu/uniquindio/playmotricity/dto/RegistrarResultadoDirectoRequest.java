package co.edu.uniquindio.playmotricity.dto;

import co.edu.uniquindio.playmotricity.entity.TipoActividad;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;
import java.util.UUID;

public record RegistrarResultadoDirectoRequest(
        @NotNull(message = "El id del perfil infantil es obligatorio")
        UUID perfilInfantilId,

        @NotNull(message = "El id de la actividad es obligatorio")
        UUID actividadId,

        TipoActividad tipoMotricidad,

        @NotNull(message = "El puntaje es obligatorio")
        @DecimalMin(value = "0", message = "El puntaje debe estar entre 0 y 100")
        @DecimalMax(value = "100", message = "El puntaje debe estar entre 0 y 100")
        Float puntajeObtenido,

        @DecimalMin(value = "0", message = "La precisión debe estar entre 0 y 100")
        @DecimalMax(value = "100", message = "La precisión debe estar entre 0 y 100")
        Float precisionPorcentaje,

        @NotNull(message = "El tiempo de ejecución es obligatorio")
        @Positive(message = "El tiempo debe ser mayor a 0 segundos")
        Integer tiempoSegundos,

        LocalDateTime fechaRealizacion
) {
}
