package co.edu.uniquindio.playmotricity.service;

import co.edu.uniquindio.playmotricity.dto.AsignacionResponse;
import co.edu.uniquindio.playmotricity.dto.RegistrarResultadoRequest;
import co.edu.uniquindio.playmotricity.dto.ResultadoActividadResponse;
import co.edu.uniquindio.playmotricity.entity.AsignacionActividad;
import co.edu.uniquindio.playmotricity.entity.EstadoAsignacion;
import co.edu.uniquindio.playmotricity.entity.ResultadoActividad;
import co.edu.uniquindio.playmotricity.exception.AsignacionAjenaException;
import co.edu.uniquindio.playmotricity.exception.AsignacionNoEncontradaException;
import co.edu.uniquindio.playmotricity.exception.ResultadoYaRegistradoException;
import co.edu.uniquindio.playmotricity.repository.AsignacionActividadRepository;
import co.edu.uniquindio.playmotricity.repository.ResultadoActividadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Regla de resultados:
 * 1. La asignación debe existir y pertenecer a un perfil infantil a cargo del usuario.
 * 2. No se aceptan resultados para una asignación ya COMPLETADA.
 * 3. Se guarda el ResultadoActividad (un intento no completado se puede reemplazar por uno nuevo).
 * 4. El estado de la asignación pasa a COMPLETADA si se completó, o a EN_PROGRESO si no.
 */
@Service
public class RegistroResultadosService implements IRegistroResultados {

    private final AsignacionActividadRepository asignacionRepository;
    private final ResultadoActividadRepository resultadoRepository;

    public RegistroResultadosService(
            AsignacionActividadRepository asignacionRepository,
            ResultadoActividadRepository resultadoRepository
    ) {
        this.asignacionRepository = asignacionRepository;
        this.resultadoRepository = resultadoRepository;
    }

    @Override
    @Transactional
    public ResultadoActividadResponse registrarResultado(
            UUID asignacionId,
            RegistrarResultadoRequest request,
            String correoUsuario
    ) {
        AsignacionActividad asignacion = validarAsignacion(asignacionId, correoUsuario);

        if (asignacion.getEstado() == EstadoAsignacion.COMPLETADA) {
            throw new ResultadoYaRegistradoException(asignacionId);
        }

        ResultadoActividad resultado = resultadoRepository.findByAsignacionId(asignacionId)
                .orElseGet(ResultadoActividad::new);
        resultado.setAsignacion(asignacion);
        resultado.setPuntaje(request.puntaje());
        resultado.setPrecision(request.precision());
        resultado.setTiempoEjecucionSeg(request.tiempoEjecucionSeg());
        resultado.setCompletada(request.completada());
        resultado.setFechaRealizacion(LocalDateTime.now());

        asignacion.setEstado(request.completada() ? EstadoAsignacion.COMPLETADA : EstadoAsignacion.EN_PROGRESO);
        asignacionRepository.save(asignacion);

        return ResultadoActividadResponse.fromEntity(resultadoRepository.save(resultado));
    }

    @Override
    @Transactional(readOnly = true)
    public AsignacionResponse obtenerAsignacion(UUID asignacionId, String correoUsuario) {
        AsignacionActividad asignacion = validarAsignacion(asignacionId, correoUsuario);
        ResultadoActividad resultado = resultadoRepository.findByAsignacionId(asignacionId).orElse(null);
        return AsignacionResponse.fromEntity(asignacion, resultado);
    }

    /** SUB-32.1: la asignación existe y su perfil infantil está a cargo del usuario en sesión. */
    private AsignacionActividad validarAsignacion(UUID asignacionId, String correoUsuario) {
        AsignacionActividad asignacion = asignacionRepository.findById(asignacionId)
                .orElseThrow(() -> new AsignacionNoEncontradaException(asignacionId));

        boolean aCargo = asignacion.getPerfil().getUsuarios().stream()
                .anyMatch(u -> u.getCorreo().equalsIgnoreCase(correoUsuario));
        if (!aCargo) {
            throw new AsignacionAjenaException(asignacionId);
        }
        return asignacion;
    }
}
