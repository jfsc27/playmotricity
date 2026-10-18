package co.edu.uniquindio.playmotricity.exception;

import java.util.UUID;

/** La asignación existe pero pertenece a un perfil infantil que no está vinculado al usuario en sesión. */
public class AsignacionAjenaException extends RuntimeException {

    public AsignacionAjenaException(UUID asignacionId) {
        super(String.format("No tienes acceso a la asignación %s: el perfil infantil no está a tu cargo.", asignacionId));
    }
}
