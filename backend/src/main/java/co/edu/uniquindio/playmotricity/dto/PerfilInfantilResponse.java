package co.edu.uniquindio.playmotricity.dto;

import co.edu.uniquindio.playmotricity.entity.PerfilInfantil;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record PerfilInfantilResponse(
        UUID id,
        String nombre,
        LocalDate fechaNacimiento,
        int edad,
        String grupoGrado,
        LocalDateTime fechaRegistro
) {
    public static PerfilInfantilResponse fromEntity(PerfilInfantil perfil) {
        return new PerfilInfantilResponse(
                perfil.getId(),
                perfil.getNombre(),
                perfil.getFechaNacimiento(),
                perfil.calcularEdad(),
                perfil.getGrupoGrado(),
                perfil.getFechaRegistro()
        );
    }
}
