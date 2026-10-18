package co.edu.uniquindio.playmotricity.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AsignarActividadRequest(
        @NotNull(message = "El id del perfil infantil es obligatorio")
        UUID perfilId,

        @NotNull(message = "El id de la actividad es obligatorio")
        UUID actividadId
) {
}
