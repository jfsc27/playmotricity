package co.edu.uniquindio.playmotricity.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record RegistrarResultadoRequest(
        @NotNull(message = "El puntaje es obligatorio")
        @DecimalMin(value = "0", message = "El puntaje debe estar entre 0 y 100")
        @DecimalMax(value = "100", message = "El puntaje debe estar entre 0 y 100")
        Float puntaje,

        @NotNull(message = "La precisión es obligatoria")
        @DecimalMin(value = "0", message = "La precisión debe estar entre 0 y 100")
        @DecimalMax(value = "100", message = "La precisión debe estar entre 0 y 100")
        Float precision,

        @NotNull(message = "El tiempo de ejecución es obligatorio")
        @Positive(message = "El tiempo de ejecución debe ser mayor a 0 segundos")
        @Max(value = 7200, message = "El tiempo de ejecución no puede superar 7200 segundos (2 horas)")
        Integer tiempoEjecucionSeg,

        @NotNull(message = "Debe indicarse si la actividad fue completada")
        Boolean completada
) {
}
