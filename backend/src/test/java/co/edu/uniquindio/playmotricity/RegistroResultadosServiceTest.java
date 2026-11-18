package co.edu.uniquindio.playmotricity;

import co.edu.uniquindio.playmotricity.dto.RegistrarResultadoRequest;
import co.edu.uniquindio.playmotricity.dto.ResultadoActividadResponse;
import co.edu.uniquindio.playmotricity.entity.Actividad;
import co.edu.uniquindio.playmotricity.entity.AsignacionActividad;
import co.edu.uniquindio.playmotricity.entity.Docente;
import co.edu.uniquindio.playmotricity.entity.EstadoAsignacion;
import co.edu.uniquindio.playmotricity.entity.Minijuego;
import co.edu.uniquindio.playmotricity.entity.PerfilInfantil;
import co.edu.uniquindio.playmotricity.entity.ResultadoActividad;
import co.edu.uniquindio.playmotricity.entity.TipoActividad;
import co.edu.uniquindio.playmotricity.entity.Usuario;
import co.edu.uniquindio.playmotricity.exception.AsignacionAjenaException;
import co.edu.uniquindio.playmotricity.exception.AsignacionNoEncontradaException;
import co.edu.uniquindio.playmotricity.exception.ResultadoYaRegistradoException;
import co.edu.uniquindio.playmotricity.repository.AsignacionActividadRepository;
import co.edu.uniquindio.playmotricity.repository.ResultadoActividadRepository;
import co.edu.uniquindio.playmotricity.service.RegistroResultadosService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RegistroResultadosServiceTest {

    @Mock
    private AsignacionActividadRepository asignacionRepository;

    @Mock
    private ResultadoActividadRepository resultadoRepository;

    @InjectMocks
    private RegistroResultadosService service;

    private UUID asignacionId;
    private String correoDocente;
    private Usuario usuarioDocente;
    private PerfilInfantil perfil;
    private Actividad actividad;
    private AsignacionActividad asignacion;

    @BeforeEach
    void setUp() {
        asignacionId = UUID.randomUUID();
        correoDocente = "profesor@playmotricity.com";

        usuarioDocente = new Docente("Profesor Carlos", correoDocente, "Password123!", "Colegio ABC", "Jardín A");

        perfil = new PerfilInfantil("Lucas Restrepo", LocalDate.now().minusYears(4), "Jardín A");
        perfil.getUsuarios().add(usuarioDocente);

        actividad = new Minijuego("Salta la cuerda", "Saltar al ritmo",
                TipoActividad.MOTRICIDAD_GRUESA, 3, 6, "Salta 10 veces", "TACTIL", 180);

        asignacion = new AsignacionActividad(perfil, actividad, usuarioDocente);
        asignacion.setId(asignacionId);
        asignacion.setEstado(EstadoAsignacion.PENDIENTE);
    }

    @Test
    @DisplayName("Caso 1: Registrar un resultado válido - Guarda puntaje, precisión, tiempo y completa la actividad")
    void registrarResultadoValido_guardaDatosYMarcaCompletada() {
        RegistrarResultadoRequest request = new RegistrarResultadoRequest(
                85.0f,
                90.0f,
                120,
                true
        );

        when(asignacionRepository.findById(asignacionId)).thenReturn(Optional.of(asignacion));
        when(resultadoRepository.findByAsignacionId(asignacionId)).thenReturn(Optional.empty());
        when(resultadoRepository.save(any(ResultadoActividad.class))).thenAnswer(invocation -> {
            ResultadoActividad r = invocation.getArgument(0);
            r.setId(UUID.randomUUID());
            return r;
        });

        ResultadoActividadResponse response = service.registrarResultado(asignacionId, request, correoDocente);

        assertNotNull(response);
        assertEquals(85.0f, response.puntaje());
        assertEquals(90.0f, response.precision());
        assertEquals(120, response.tiempoEjecucionSeg());
        assertTrue(response.completada());
        assertEquals(EstadoAsignacion.COMPLETADA, response.estadoAsignacion());
        assertEquals(EstadoAsignacion.COMPLETADA, asignacion.getEstado());

        ArgumentCaptor<ResultadoActividad> resultadoCaptor = ArgumentCaptor.forClass(ResultadoActividad.class);
        verify(resultadoRepository).save(resultadoCaptor.capture());
        ResultadoActividad resultadoGuardado = resultadoCaptor.getValue();

        assertEquals(85.0f, resultadoGuardado.getPuntaje());
        assertEquals(90.0f, resultadoGuardado.getPrecision());
        assertEquals(120, resultadoGuardado.getTiempoEjecucionSeg());
        assertTrue(resultadoGuardado.isCompletada());
        assertEquals(asignacion, resultadoGuardado.getAsignacion());
        assertNotNull(resultadoGuardado.getFechaRealizacion());

        verify(asignacionRepository).save(asignacion);
    }

    @Test
    @DisplayName("Caso 2: Rechaza registro si la actividad pertenece a un perfil ajeno (no a cargo del usuario)")
    void registrarResultado_perfilNoCorrespondiente_lanzaAsignacionAjenaException() {
        RegistrarResultadoRequest request = new RegistrarResultadoRequest(
                85.0f,
                90.0f,
                120,
                true
        );

        when(asignacionRepository.findById(asignacionId)).thenReturn(Optional.of(asignacion));

        String correoOtro = "otro.usuario@playmotricity.com";

        assertThrows(AsignacionAjenaException.class, () ->
                service.registrarResultado(asignacionId, request, correoOtro)
        );

        verify(resultadoRepository, never()).save(any());
        verify(asignacionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Caso 3: No debe permitir duplicar el resultado de una actividad ya completada")
    void registrarResultado_actividadYaCompletada_lanzaResultadoYaRegistradoException() {
        asignacion.setEstado(EstadoAsignacion.COMPLETADA);

        RegistrarResultadoRequest request = new RegistrarResultadoRequest(
                85.0f,
                90.0f,
                120,
                true
        );

        when(asignacionRepository.findById(asignacionId)).thenReturn(Optional.of(asignacion));

        assertThrows(ResultadoYaRegistradoException.class, () ->
                service.registrarResultado(asignacionId, request, correoDocente)
        );

        verify(resultadoRepository, never()).save(any());
        verify(asignacionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Caso extra: Rechaza registro si la asignación no existe")
    void registrarResultado_asignacionInexistente_lanzaAsignacionNoEncontradaException() {
        UUID idInexistente = UUID.randomUUID();
        RegistrarResultadoRequest request = new RegistrarResultadoRequest(
                85.0f,
                90.0f,
                120,
                true
        );

        when(asignacionRepository.findById(idInexistente)).thenReturn(Optional.empty());

        assertThrows(AsignacionNoEncontradaException.class, () ->
                service.registrarResultado(idInexistente, request, correoDocente)
        );

        verify(resultadoRepository, never()).save(any());
    }

    @Test
    @DisplayName("Caso extra: Si la actividad no se completa, el estado de la asignación pasa a EN_PROGRESO")
    void registrarResultado_noCompletada_cambiaAEnProgreso() {
        RegistrarResultadoRequest request = new RegistrarResultadoRequest(
                50.0f,
                60.0f,
                90,
                false
        );

        when(asignacionRepository.findById(asignacionId)).thenReturn(Optional.of(asignacion));
        when(resultadoRepository.findByAsignacionId(asignacionId)).thenReturn(Optional.empty());
        when(resultadoRepository.save(any(ResultadoActividad.class))).thenAnswer(invocation -> {
            ResultadoActividad r = invocation.getArgument(0);
            r.setId(UUID.randomUUID());
            return r;
        });

        ResultadoActividadResponse response = service.registrarResultado(asignacionId, request, correoDocente);

        assertEquals(EstadoAsignacion.EN_PROGRESO, response.estadoAsignacion());
        assertEquals(EstadoAsignacion.EN_PROGRESO, asignacion.getEstado());
        verify(asignacionRepository).save(asignacion);
    }
}
