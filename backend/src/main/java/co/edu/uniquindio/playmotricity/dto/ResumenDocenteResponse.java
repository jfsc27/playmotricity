package co.edu.uniquindio.playmotricity.dto;

public record ResumenDocenteResponse(
        String nombre,
        String correo,
        String institucion,
        String grupoAsignado,
        int perfilesACargo
) {
}
