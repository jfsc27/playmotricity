package co.edu.uniquindio.playmotricity.service;

import co.edu.uniquindio.playmotricity.dto.ProgresoPerfilResponse;
import co.edu.uniquindio.playmotricity.dto.ProgresoTipoResponse;
import co.edu.uniquindio.playmotricity.dto.ReporteProgresoResponse;
import co.edu.uniquindio.playmotricity.dto.ResultadoDetalleResponse;
import co.edu.uniquindio.playmotricity.entity.AsignacionActividad;
import co.edu.uniquindio.playmotricity.entity.EstadoAsignacion;
import co.edu.uniquindio.playmotricity.entity.PerfilInfantil;
import co.edu.uniquindio.playmotricity.entity.ReporteProgreso;
import co.edu.uniquindio.playmotricity.entity.ResultadoActividad;
import co.edu.uniquindio.playmotricity.entity.TipoActividad;
import co.edu.uniquindio.playmotricity.entity.Usuario;
import co.edu.uniquindio.playmotricity.exception.PerfilNoEncontradoException;
import co.edu.uniquindio.playmotricity.repository.AsignacionActividadRepository;
import co.edu.uniquindio.playmotricity.repository.PerfilInfantilRepository;
import co.edu.uniquindio.playmotricity.repository.ReporteProgresoRepository;
import co.edu.uniquindio.playmotricity.repository.ResultadoActividadRepository;
import co.edu.uniquindio.playmotricity.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * Seguimiento y reportes de un perfil infantil. Solo se puede consultar un perfil a cargo del usuario
 * (si no, 404 como en el módulo de perfiles). Los promedios se calculan sobre actividades completadas.
 */
@Service
public class SeguimientoService implements ISeguimiento {

    private final PerfilInfantilRepository perfilRepository;
    private final AsignacionActividadRepository asignacionRepository;
    private final ResultadoActividadRepository resultadoRepository;
    private final ReporteProgresoRepository reporteRepository;
    private final UsuarioRepository usuarioRepository;

    public SeguimientoService(
            PerfilInfantilRepository perfilRepository,
            AsignacionActividadRepository asignacionRepository,
            ResultadoActividadRepository resultadoRepository,
            ReporteProgresoRepository reporteRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.perfilRepository = perfilRepository;
        this.asignacionRepository = asignacionRepository;
        this.resultadoRepository = resultadoRepository;
        this.reporteRepository = reporteRepository;
        this.usuarioRepository = usuarioRepository;
    }

    /** Genera el reporte a nombre del usuario autenticado en la petición actual. */
    @Override
    @Transactional
    public ReporteProgreso generarReporte(UUID perfilId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new UsernameNotFoundException("No hay un usuario autenticado para generar el reporte");
        }
        return generarReporte(perfilId, auth.getName());
    }

    /** SUB-38.6: guarda una foto del progreso actual en reporte_progreso. */
    @Override
    @Transactional
    public ReporteProgreso generarReporte(UUID perfilId, String correoUsuario) {
        PerfilInfantil perfil = perfilACargo(perfilId, correoUsuario);
        Usuario usuario = usuarioRepository.findByCorreo(correoUsuario)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + correoUsuario));
        List<ResultadoActividad> completadas = completadas(perfilId);

        ReporteProgreso reporte = new ReporteProgreso(
                perfil,
                usuario,
                completadas.size(),
                aFloat(CalculadoraProgreso.promedioPuntaje(completadas)),
                aFloat(CalculadoraProgreso.promedioPrecision(completadas)),
                aFloat(CalculadoraProgreso.tiempoPromedio(completadas))
        );
        return reporteRepository.save(reporte);
    }

    /** SUB-38.1 */
    @Override
    @Transactional(readOnly = true)
    public List<ResultadoDetalleResponse> consultarActividadesCompletadas(UUID perfilId, String correoUsuario) {
        perfilACargo(perfilId, correoUsuario);
        return completadas(perfilId).stream().map(ResultadoDetalleResponse::fromEntity).toList();
    }

    /** SUB-38.2: todos los resultados registrados (incluye intentos no completados). */
    @Override
    @Transactional(readOnly = true)
    public List<ResultadoDetalleResponse> consultarResultados(UUID perfilId, String correoUsuario) {
        perfilACargo(perfilId, correoUsuario);
        return resultadoRepository.findByAsignacionPerfilIdOrderByFechaRealizacionDesc(perfilId)
                .stream().map(ResultadoDetalleResponse::fromEntity).toList();
    }

    /** SUB-38.3 a 38.6: información de progreso calculada en el momento. */
    @Override
    @Transactional(readOnly = true)
    public ProgresoPerfilResponse calcularProgreso(UUID perfilId, String correoUsuario) {
        PerfilInfantil perfil = perfilACargo(perfilId, correoUsuario);
        List<AsignacionActividad> asignaciones = asignacionRepository.findByPerfilId(perfilId);
        List<ResultadoActividad> completadas = completadas(perfilId);

        int total = asignaciones.size();
        int nCompletadas = contar(asignaciones, EstadoAsignacion.COMPLETADA);
        int enProgreso = contar(asignaciones, EstadoAsignacion.EN_PROGRESO);
        int pendientes = contar(asignaciones, EstadoAsignacion.PENDIENTE);

        Double promedioPuntaje = CalculadoraProgreso.promedioPuntaje(completadas);
        String nivel = CalculadoraProgreso.nivel(promedioPuntaje);

        List<ProgresoTipoResponse> porTipo = Arrays.stream(TipoActividad.values())
                .map(tipo -> {
                    List<ResultadoActividad> delTipo = completadas.stream()
                            .filter(r -> r.getAsignacion().getActividad().getTipoActividad() == tipo)
                            .toList();
                    return new ProgresoTipoResponse(tipo, delTipo.size(), CalculadoraProgreso.promedioPuntaje(delTipo));
                })
                .toList();

        LocalDateTime ultima = completadas.stream()
                .map(ResultadoActividad::getFechaRealizacion)
                .filter(Objects::nonNull)
                .max(Comparator.naturalOrder())
                .orElse(null);

        return new ProgresoPerfilResponse(
                perfil.getId(),
                perfil.getNombre(),
                perfil.calcularEdad(),
                total,
                nCompletadas,
                enProgreso,
                pendientes,
                CalculadoraProgreso.porcentajeAvance(nCompletadas, total),
                promedioPuntaje,
                CalculadoraProgreso.promedioPrecision(completadas),
                CalculadoraProgreso.tiempoPromedio(completadas),
                nivel,
                CalculadoraProgreso.mensaje(nivel, primerNombre(perfil.getNombre())),
                ultima,
                porTipo
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReporteProgresoResponse> listarReportes(UUID perfilId, String correoUsuario) {
        perfilACargo(perfilId, correoUsuario);
        return reporteRepository.findByPerfilIdOrderByFechaGeneracionDesc(perfilId)
                .stream().map(ReporteProgresoResponse::fromEntity).toList();
    }

    private PerfilInfantil perfilACargo(UUID perfilId, String correoUsuario) {
        return perfilRepository.findByIdAndUsuariosCorreo(perfilId, correoUsuario)
                .orElseThrow(() -> new PerfilNoEncontradoException(String.format(
                        "No se encontró el perfil infantil con id %s asociado al usuario actual", perfilId)));
    }

    /** Resultados de actividades completadas: la asignación está COMPLETADA y el intento se completó. */
    private List<ResultadoActividad> completadas(UUID perfilId) {
        return resultadoRepository.findByAsignacionPerfilIdOrderByFechaRealizacionDesc(perfilId).stream()
                .filter(r -> r.isCompletada() && r.getAsignacion().getEstado() == EstadoAsignacion.COMPLETADA)
                .toList();
    }

    private static int contar(List<AsignacionActividad> asignaciones, EstadoAsignacion estado) {
        return (int) asignaciones.stream().filter(a -> a.getEstado() == estado).count();
    }

    private static float aFloat(Double valor) {
        return valor == null ? 0f : valor.floatValue();
    }

    private static String primerNombre(String nombre) {
        return nombre == null ? "" : nombre.trim().split("\\s+")[0];
    }
}
