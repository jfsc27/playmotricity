package co.edu.uniquindio.playmotricity;

import co.edu.uniquindio.playmotricity.entity.ResultadoActividad;
import co.edu.uniquindio.playmotricity.service.CalculadoraProgreso;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class CalculadoraProgresoTest {

    private ResultadoActividad r(float puntaje, float precision, int tiempo) {
        return new ResultadoActividad(null, puntaje, precision, tiempo, true);
    }

    private final List<ResultadoActividad> tres = List.of(r(80, 90, 100), r(70, 60, 50), r(95.5f, 75, 61));

    @Test
    @DisplayName("SUB-38.3: promedio de puntajes redondeado a 2 decimales")
    void promedioPuntaje() {
        assertEquals(81.83, CalculadoraProgreso.promedioPuntaje(tres));
    }

    @Test
    @DisplayName("SUB-38.4: promedio de precision")
    void promedioPrecision() {
        assertEquals(75.0, CalculadoraProgreso.promedioPrecision(tres));
    }

    @Test
    @DisplayName("SUB-38.5: tiempo promedio de ejecucion")
    void tiempoPromedio() {
        assertEquals(70.33, CalculadoraProgreso.tiempoPromedio(tres));
    }

    @Test
    @DisplayName("Sin actividades completadas los promedios son null (no 0)")
    void sinDatos() {
        assertNull(CalculadoraProgreso.promedioPuntaje(List.of()));
        assertNull(CalculadoraProgreso.promedioPrecision(null));
        assertNull(CalculadoraProgreso.tiempoPromedio(List.of()));
    }

    @Test
    @DisplayName("Porcentaje de avance, incluido el caso sin asignaciones")
    void porcentajeAvance() {
        assertEquals(66.67, CalculadoraProgreso.porcentajeAvance(2, 3));
        assertEquals(100.0, CalculadoraProgreso.porcentajeAvance(4, 4));
        assertEquals(0.0, CalculadoraProgreso.porcentajeAvance(0, 0));
    }

    @Test
    @DisplayName("Nivel segun el promedio de puntaje y sus limites")
    void nivel() {
        assertEquals("SIN_DATOS", CalculadoraProgreso.nivel(null));
        assertEquals("INICIAL", CalculadoraProgreso.nivel(59.99));
        assertEquals("EN_DESARROLLO", CalculadoraProgreso.nivel(60.0));
        assertEquals("EN_DESARROLLO", CalculadoraProgreso.nivel(79.99));
        assertEquals("AVANZADO", CalculadoraProgreso.nivel(80.0));
    }
}
