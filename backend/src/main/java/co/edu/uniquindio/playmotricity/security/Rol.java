package co.edu.uniquindio.playmotricity.security;

import co.edu.uniquindio.playmotricity.entity.Docente;
import co.edu.uniquindio.playmotricity.entity.Usuario;

/**
 * Roles de la plataforma. El nombre del enum es el valor que viaja en el JWT y en las
 * respuestas JSON ("DOCENTE" / "PADRE"); Spring Security lo usa con el prefijo "ROLE_".
 */
public enum Rol {
    DOCENTE,
    PADRE;

    /** Nombres para usar en @PreAuthorize / hasRole (sin el prefijo ROLE_). */
    public static final String DOCENTE_NOMBRE = "DOCENTE";
    public static final String PADRE_NOMBRE = "PADRE";

    public String authority() {
        return "ROLE_" + name();
    }

    public static Rol de(Usuario usuario) {
        return usuario instanceof Docente ? DOCENTE : PADRE;
    }
}
