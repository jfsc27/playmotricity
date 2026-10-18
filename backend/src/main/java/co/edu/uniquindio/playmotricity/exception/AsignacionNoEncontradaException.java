package co.edu.uniquindio.playmotricity.exception;

import java.util.UUID;

public class AsignacionNoEncontradaException extends RuntimeException {

    public AsignacionNoEncontradaException(UUID id) {
        super(String.format("No existe una asignación de actividad con identificador: %s", id));
    }
}
