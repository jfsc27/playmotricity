package co.edu.uniquindio.playmotricity.exception;

import java.util.UUID;

public class ResultadoYaRegistradoException extends RuntimeException {

    public ResultadoYaRegistradoException(UUID asignacionId) {
        super(String.format(
                "La asignación %s ya está COMPLETADA y tiene un resultado registrado; no se puede registrar otro.",
                asignacionId));
    }
}
