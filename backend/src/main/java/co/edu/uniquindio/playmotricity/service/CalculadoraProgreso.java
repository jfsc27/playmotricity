package co.edu.uniquindio.playmotricity.service;

import co.edu.uniquindio.playmotricity.entity.ResultadoActividad;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.function.ToDoubleFunction;

/** Cálculos de progreso (SUB-38.3, 38.4, 38.5). Sin estado y sin acceso a BD, para poder probarlos aislados. */
public final class CalculadoraProgreso {

    public static final double UMBRAL_EN_DESARROLLO = 60;
    public static final double UMBRAL_AVANZADO = 80;

    private CalculadoraProgreso() {
    }

    /** Promedio redondeado a 2 decimales; null si la lista está vacía. */
    public static Double promedio(List<ResultadoActividad> resultados, ToDoubleFunction<ResultadoActividad> campo) {
        if (resultados == null || resultados.isEmpty()) {
            return null;
        }
        double promedio = resultados.stream().mapToDouble(campo).average().orElse(0);
        return redondear(promedio);
    }

    public static Double promedioPuntaje(List<ResultadoActividad> completadas) {
        return promedio(completadas, ResultadoActividad::getPuntaje);
    }

    public static Double promedioPrecision(List<ResultadoActividad> completadas) {
        return promedio(completadas, ResultadoActividad::getPrecision);
    }

    public static Double tiempoPromedio(List<ResultadoActividad> completadas) {
        return promedio(completadas, ResultadoActividad::getTiempoEjecucionSeg);
    }

    /** Porcentaje de asignaciones completadas (0 si no hay asignaciones). */
    public static double porcentajeAvance(int completadas, int totalAsignadas) {
        if (totalAsignadas <= 0) {
            return 0;
        }
        return redondear(completadas * 100.0 / totalAsignadas);
    }

    /** Nivel según el promedio de puntaje: SIN_DATOS, INICIAL (<60), EN_DESARROLLO (<80) o AVANZADO. */
    public static String nivel(Double promedioPuntaje) {
        if (promedioPuntaje == null) {
            return "SIN_DATOS";
        }
        if (promedioPuntaje < UMBRAL_EN_DESARROLLO) {
            return "INICIAL";
        }
        if (promedioPuntaje < UMBRAL_AVANZADO) {
            return "EN_DESARROLLO";
        }
        return "AVANZADO";
    }

    public static String mensaje(String nivel, String nombre) {
        return switch (nivel) {
            case "INICIAL" -> nombre + " está dando sus primeros pasos: conviene repetir las actividades con acompañamiento.";
            case "EN_DESARROLLO" -> nombre + " avanza bien: sigue practicando para afianzar sus habilidades motrices.";
            case "AVANZADO" -> "¡" + nombre + " tiene un desempeño destacado! Puede pasar a retos de mayor dificultad.";
            default -> nombre + " aún no ha completado actividades. Asígnale una para comenzar su seguimiento.";
        };
    }

    private static double redondear(double valor) {
        return BigDecimal.valueOf(valor).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
