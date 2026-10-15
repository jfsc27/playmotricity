package co.edu.uniquindio.playmotricity.dto;

public record AuthResponse(String token, String tipo, long expiraEnMs, UsuarioResponse usuario) {
}
