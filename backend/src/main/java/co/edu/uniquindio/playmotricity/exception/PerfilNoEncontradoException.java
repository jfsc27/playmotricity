package co.edu.uniquindio.playmotricity.exception;

import java.util.UUID;

public class PerfilNoEncontradoException extends RuntimeException {

    public PerfilNoEncontradoException(UUID id) {
        super(String.format("No se encontró el perfil infantil con identificador: %s", id));
    }

    public PerfilNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}
