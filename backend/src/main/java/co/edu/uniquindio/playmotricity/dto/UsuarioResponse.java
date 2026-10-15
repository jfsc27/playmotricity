package co.edu.uniquindio.playmotricity.dto;

import java.util.UUID;

public record UsuarioResponse(UUID id, String nombre, String correo, String rol) {
}
