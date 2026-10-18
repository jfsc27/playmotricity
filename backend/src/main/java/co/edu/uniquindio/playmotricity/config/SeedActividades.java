package co.edu.uniquindio.playmotricity.config;

import co.edu.uniquindio.playmotricity.entity.Actividad;
import co.edu.uniquindio.playmotricity.entity.DesafioMotriz;
import co.edu.uniquindio.playmotricity.entity.Minijuego;
import co.edu.uniquindio.playmotricity.entity.TipoActividad;
import co.edu.uniquindio.playmotricity.repository.ActividadRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SeedActividades implements CommandLineRunner {

    private final ActividadRepository actividadRepository;

    public SeedActividades(ActividadRepository actividadRepository) {
        this.actividadRepository = actividadRepository;
    }

    @Override
    public void run(String... args) {
        if (actividadRepository.count() > 0) {
            return;
        }

        List<Actividad> semillas = List.of(
                // 1. Minijuego: Arrastra los Colores (2-3 años)
                new Minijuego(
                        "Arrastra los Colores",
                        "Juego de arrastrar figuras de colores hacia contenedores correspondientes para desarrollar coordinación ojo-mano.",
                        TipoActividad.MOTRICIDAD_FINA,
                        2,
                        3,
                        "Arrastra cada figura de color hacia el contenedor que le corresponda. ¡Toca y arrastra!",
                        "DRAG_DROP",
                        120
                ),
                // 2. Minijuego: Alimenta al Monstruo (2-3 años)
                new Minijuego(
                        "Alimenta al Monstruo",
                        "Juego de arrastre temático donde el niño alimenta a un monstruo amigable arrastrando frutas.",
                        TipoActividad.MOTRICIDAD_FINA,
                        2,
                        3,
                        "¡El monstruo tiene hambre! Arrastra las frutas hacia su boca para alimentarlo.",
                        "DRAG_DROP",
                        90
                ),
                // 3. Minijuego: Clasifica las Formas (4-5 años)
                new Minijuego(
                        "Clasifica las Formas",
                        "Clasificación de formas geométricas en categorías para estimular el razonamiento lógico y la motricidad fina.",
                        TipoActividad.MOTRICIDAD_FINA,
                        4,
                        5,
                        "Clasifica cada forma geométrica arrastrándola hacia su grupo correcto: círculos, cuadrados o triángulos.",
                        "DRAG_DROP_MULTIPLE",
                        180
                ),
                // 4. Minijuego: Carrera contra el Tiempo (4-5 años)
                new Minijuego(
                        "Carrera contra el Tiempo",
                        "Desafío cronometrado que combina velocidad de reacción y precisión táctil.",
                        TipoActividad.MIXTA,
                        4,
                        5,
                        "¡Toca todos los objetivos que aparecen antes de que se acabe el tiempo! Sé rápido y preciso.",
                        "TIMED_CHALLENGE",
                        60
                ),
                // 5. Minijuego: Trazo Mágico (5-6 años)
                new Minijuego(
                        "Trazo Mágico",
                        "Trazado guiado sobre lienzo digital para evaluar y desarrollar la precisión del trazo y el control del pulso.",
                        TipoActividad.MOTRICIDAD_FINA,
                        5,
                        6,
                        "Sigue el camino trazado con tu dedo sin salirte de la línea. ¡Mantén el pulso firme!",
                        "CANVAS_TRACE",
                        240
                ),
                // 6. Minijuego: Conecta los Puntos (4-6 años)
                new Minijuego(
                        "Conecta los Puntos",
                        "Unión secuencial de puntos numerados para revelar figuras, estimulando coordinación y reconocimiento numérico.",
                        TipoActividad.MOTRICIDAD_FINA,
                        4,
                        6,
                        "Une los puntos en orden siguiendo los números. ¡Descubre la figura oculta!",
                        "CANVAS_TRACE",
                        150
                ),
                // 7. Desafío Motriz: Salta como Canguro (2-3 años)
                new DesafioMotriz(
                        "Salta como Canguro",
                        "Reto asistido de saltos en el lugar imitando a un canguro, supervisado por un adulto.",
                        TipoActividad.MOTRICIDAD_GRUESA,
                        2,
                        3,
                        "¡Es hora de saltar! Imita al canguro y salta en el mismo lugar. Un adulto debe verificar cada salto.",
                        "SALTO",
                        true
                ),
                // 8. Desafío Motriz: Equilibrio del Flamenco (4-5 años)
                new DesafioMotriz(
                        "Equilibrio del Flamenco",
                        "Desafío de equilibrio estático sobre un pie para fortalecer la estabilidad corporal.",
                        TipoActividad.MOTRICIDAD_GRUESA,
                        4,
                        5,
                        "Mantén el equilibrio en un pie como un flamenco. ¡Aguanta lo más que puedas!",
                        "EQUILIBRIO",
                        true
                ),
                // 9. Desafío Motriz: Carrera de Obstáculos (4-6 años)
                new DesafioMotriz(
                        "Carrera de Obstáculos",
                        "Circuito de obstáculos guiado que combina saltos, agachadas y carrera para desarrollo motriz integral.",
                        TipoActividad.MOTRICIDAD_GRUESA,
                        4,
                        6,
                        "Sigue las instrucciones del circuito: salta, agáchate y corre. ¡El adulto registra tu tiempo!",
                        "CARRERA_OBSTACULOS",
                        true
                ),
                // 10. Desafío Motriz: Lanza y Atrapa (3-5 años)
                new DesafioMotriz(
                        "Lanza y Atrapa",
                        "Ejercicio de lanzamiento y recepción con pelota suave para coordinar brazos y vista.",
                        TipoActividad.MIXTA,
                        3,
                        5,
                        "Lanza la pelota suave hacia el objetivo y luego intenta atraparla. ¡Practica con un adulto!",
                        "LANZAMIENTO",
                        true
                )
        );

        actividadRepository.saveAll(semillas);
    }
}
