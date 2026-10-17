package co.edu.uniquindio.playmotricity;

import co.edu.uniquindio.playmotricity.entity.PerfilInfantil;
import co.edu.uniquindio.playmotricity.exception.EdadInvalidaException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ReglaEdadTest {

    @Test
    @DisplayName("Regla de edad: Cálculo exacto de edad (niño de 4 años)")
    void reglaEdad_calculoCorrecto_4Anos() {
        LocalDate fechaNacimiento = LocalDate.now().minusYears(4).minusMonths(2);
        PerfilInfantil perfil = new PerfilInfantil("Lucas Restrepo", fechaNacimiento, "Jardín A");

        assertEquals(4, perfil.calcularEdad());
        perfil.validarReglaEdad(); // Debe pasar sin excepciones
    }

    @Test
    @DisplayName("Regla de edad: Límite inferior permitido (exactamente 2 años)")
    void reglaEdad_limiteInferior_2AnosValido() {
        LocalDate fechaNacimiento = LocalDate.now().minusYears(2);
        PerfilInfantil perfil = new PerfilInfantil("Martina", fechaNacimiento, "Párvulos");

        assertEquals(2, perfil.calcularEdad());
        perfil.validarReglaEdad(); // Válido en PlayMotricity
    }

    @Test
    @DisplayName("Regla de edad: Límite superior permitido (exactamente 6 años)")
    void reglaEdad_limiteSuperior_6AnosValido() {
        LocalDate fechaNacimiento = LocalDate.now().minusYears(6);
        PerfilInfantil perfil = new PerfilInfantil("Mateo", fechaNacimiento, "Transición");

        assertEquals(6, perfil.calcularEdad());
        perfil.validarReglaEdad(); // Válido en PlayMotricity
    }

    @Test
    @DisplayName("Regla de edad: Rechaza edad menor al mínimo (1 año) con excepción de dominio")
    void reglaEdad_menorQueMinimo_lanzaEdadInvalidaException() {
        LocalDate fechaNacimiento = LocalDate.now().minusYears(1).minusMonths(6);
        PerfilInfantil perfil = new PerfilInfantil("Bebé Tomás", fechaNacimiento, "Maternal");

        EdadInvalidaException ex = assertThrows(EdadInvalidaException.class, perfil::validarReglaEdad);
        assertNotNull(ex.getMessage());
        assertTrue(ex.getMessage().contains("no es válida") || ex.getMessage().contains("rango"));
        assertEquals(1, ex.getEdadCalculada());
        assertEquals(2, ex.getEdadMinima());
        assertEquals(6, ex.getEdadMaxima());
    }

    @Test
    @DisplayName("Regla de edad: Rechaza edad mayor al máximo (7 años) con excepción de dominio")
    void reglaEdad_mayorQueMaximo_lanzaEdadInvalidaException() {
        LocalDate fechaNacimiento = LocalDate.now().minusYears(7).minusMonths(1);
        PerfilInfantil perfil = new PerfilInfantil("Camilo", fechaNacimiento, "Primero de Primaria");

        EdadInvalidaException ex = assertThrows(EdadInvalidaException.class, perfil::validarReglaEdad);
        assertNotNull(ex.getMessage());
        assertTrue(ex.getMessage().contains("no es válida") || ex.getMessage().contains("rango"));
        assertEquals(7, ex.getEdadCalculada());
    }

    @Test
    @DisplayName("Regla de edad: Rechaza fecha de nacimiento en el futuro con excepción de dominio")
    void reglaEdad_fechaFutura_lanzaEdadInvalidaException() {
        LocalDate fechaFutura = LocalDate.now().plusDays(10);
        PerfilInfantil perfil = new PerfilInfantil("Bebé Futuro", fechaFutura, "Ninguno");

        EdadInvalidaException ex = assertThrows(EdadInvalidaException.class, perfil::validarReglaEdad);
        assertTrue(ex.getMessage().contains("futura"));
    }

    @Test
    @DisplayName("Regla de edad: Rechaza fecha de nacimiento nula con excepción de dominio")
    void reglaEdad_fechaNula_lanzaEdadInvalidaException() {
        PerfilInfantil perfil = new PerfilInfantil("Sin Fecha", null, "Ninguno");

        EdadInvalidaException ex = assertThrows(EdadInvalidaException.class, perfil::validarReglaEdad);
        assertTrue(ex.getMessage().contains("obligatoria"));
    }
}
