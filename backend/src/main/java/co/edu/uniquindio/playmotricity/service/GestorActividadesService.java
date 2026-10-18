package co.edu.uniquindio.playmotricity.service;

import co.edu.uniquindio.playmotricity.dto.RegistrarResultadoDirectoRequest;
import co.edu.uniquindio.playmotricity.dto.ResultadoActividadResponse;
import co.edu.uniquindio.playmotricity.entity.Actividad;
import co.edu.uniquindio.playmotricity.entity.AsignacionActividad;
import co.edu.uniquindio.playmotricity.entity.EstadoAsignacion;
import co.edu.uniquindio.playmotricity.entity.PerfilInfantil;
import co.edu.uniquindio.playmotricity.entity.ResultadoActividad;
import co.edu.uniquindio.playmotricity.entity.TipoActividad;
import co.edu.uniquindio.playmotricity.entity.Usuario;
import co.edu.uniquindio.playmotricity.exception.PerfilNoEncontradoException;
import co.edu.uniquindio.playmotricity.repository.ActividadRepository;
import co.edu.uniquindio.playmotricity.repository.AsignacionActividadRepository;
import co.edu.uniquindio.playmotricity.repository.PerfilInfantilRepository;
import co.edu.uniquindio.playmotricity.repository.ResultadoActividadRepository;
import co.edu.uniquindio.playmotricity.repository.UsuarioRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class GestorActividadesService implements IGestorActividades {

    private final ActividadRepository actividadRepository;
    private final AsignacionActividadRepository asignacionRepository;
    private final PerfilInfantilRepository perfilRepository;
    private final UsuarioRepository usuarioRepository;
    private final ResultadoActividadRepository resultadoRepository;

    public GestorActividadesService(
            ActividadRepository actividadRepository,
            AsignacionActividadRepository asignacionRepository,
            PerfilInfantilRepository perfilRepository,
            UsuarioRepository usuarioRepository,
            ResultadoActividadRepository resultadoRepository
    ) {
        this.actividadRepository = actividadRepository;
        this.asignacionRepository = asignacionRepository;
        this.perfilRepository = perfilRepository;
        this.usuarioRepository = usuarioRepository;
        this.resultadoRepository = resultadoRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Actividad> listarTodas() {
        return actividadRepository.findAllByOrderByEdadMinimaAscNombreAsc();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Actividad> listarPorEdad(int edad) {
        return actividadRepository.findByEdadMinimaLessThanEqualAndEdadMaximaGreaterThanEqual(edad, edad);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Actividad> listarPorTipo(TipoActividad tipo) {
        return actividadRepository.findByTipoActividad(tipo);
    }

    @Override
    @Transactional(readOnly = true)
    public Actividad obtener(UUID id) {
        return actividadRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Actividad no encontrada con ID: " + id));
    }

    @Override
    @Transactional
    public AsignacionActividad asignarActividad(UUID perfilId, UUID actividadId, String correoUsuario) {
        PerfilInfantil perfil = validarPerfilDeUsuario(perfilId, correoUsuario);
        Actividad actividad = obtener(actividadId);
        Usuario usuario = usuarioRepository.findByCorreo(correoUsuario)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + correoUsuario));

        // Verificar si ya existe una asignación activa (no completada) para este perfil y actividad
        boolean yaAsignadaActiva = asignacionRepository.existsByPerfilIdAndActividadIdAndEstadoNot(
                perfilId, actividadId, EstadoAsignacion.COMPLETADA
        );
        if (yaAsignadaActiva) {
            throw new IllegalStateException("Esta actividad ya se encuentra asignada y activa para el infante.");
        }

        AsignacionActividad asignacion = new AsignacionActividad(perfil, actividad, usuario);
        return asignacionRepository.save(asignacion);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AsignacionActividad> listarAsignaciones(UUID perfilId, String correoUsuario) {
        validarPerfilDeUsuario(perfilId, correoUsuario);
        return asignacionRepository.findByPerfilIdOrderByFechaAsignacionDesc(perfilId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AsignacionActividad> listarAsignacionesPorEstado(UUID perfilId, EstadoAsignacion estado, String correoUsuario) {
        validarPerfilDeUsuario(perfilId, correoUsuario);
        return asignacionRepository.findByPerfilIdAndEstado(perfilId, estado);
    }

    @Override
    @Transactional
    public ResultadoActividadResponse registrarResultadoDirecto(RegistrarResultadoDirectoRequest request, String correoUsuario) {
        PerfilInfantil perfil = validarPerfilDeUsuario(request.perfilInfantilId(), correoUsuario);
        Actividad actividad = obtener(request.actividadId());
        Usuario usuario = usuarioRepository.findByCorreo(correoUsuario)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + correoUsuario));

        // Buscar si existe una asignación pendiente o en progreso para esta actividad y perfil
        List<AsignacionActividad> asignaciones = asignacionRepository.findByPerfilIdAndActividadId(
                perfil.getId(), actividad.getId()
        );

        AsignacionActividad asignacion = asignaciones.stream()
                .filter(a -> a.getEstado() != EstadoAsignacion.COMPLETADA)
                .findFirst()
                .orElseGet(() -> {
                    AsignacionActividad nueva = new AsignacionActividad(perfil, actividad, usuario);
                    nueva.setEstado(EstadoAsignacion.EN_PROGRESO);
                    return asignacionRepository.save(nueva);
                });

        ResultadoActividad resultado = resultadoRepository.findByAsignacionId(asignacion.getId())
                .orElseGet(ResultadoActividad::new);

        resultado.setAsignacion(asignacion);
        resultado.setPuntaje(request.puntajeObtenido());
        float precision = request.precisionPorcentaje() != null ? request.precisionPorcentaje() : request.puntajeObtenido();
        resultado.setPrecision(precision);
        resultado.setTiempoEjecucionSeg(request.tiempoSegundos());
        resultado.setCompletada(true);
        resultado.setFechaRealizacion(request.fechaRealizacion() != null ? request.fechaRealizacion() : LocalDateTime.now());

        asignacion.setEstado(EstadoAsignacion.COMPLETADA);
        asignacionRepository.save(asignacion);

        ResultadoActividad guardado = resultadoRepository.save(resultado);
        return ResultadoActividadResponse.fromEntity(guardado);
    }

    private PerfilInfantil validarPerfilDeUsuario(UUID perfilId, String correoUsuario) {
        return perfilRepository.findByIdAndUsuariosCorreo(perfilId, correoUsuario)
                .orElseThrow(() -> new PerfilNoEncontradoException(
                        String.format("No se encontró el perfil infantil con id %s asociado al usuario actual", perfilId)
                ));
    }
}
