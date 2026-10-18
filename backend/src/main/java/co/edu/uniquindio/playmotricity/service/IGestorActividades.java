package co.edu.uniquindio.playmotricity.service;

import co.edu.uniquindio.playmotricity.dto.RegistrarResultadoDirectoRequest;
import co.edu.uniquindio.playmotricity.dto.ResultadoActividadResponse;
import co.edu.uniquindio.playmotricity.entity.Actividad;
import co.edu.uniquindio.playmotricity.entity.AsignacionActividad;
import co.edu.uniquindio.playmotricity.entity.EstadoAsignacion;
import co.edu.uniquindio.playmotricity.entity.TipoActividad;

import java.util.List;
import java.util.UUID;

public interface IGestorActividades {

    List<Actividad> listarTodas();

    List<Actividad> listarPorEdad(int edad);

    List<Actividad> listarPorTipo(TipoActividad tipo);

    Actividad obtener(UUID id);

    AsignacionActividad asignarActividad(UUID perfilId, UUID actividadId, String correoUsuario);

    List<AsignacionActividad> listarAsignaciones(UUID perfilId, String correoUsuario);

    List<AsignacionActividad> listarAsignacionesPorEstado(UUID perfilId, EstadoAsignacion estado, String correoUsuario);

    ResultadoActividadResponse registrarResultadoDirecto(RegistrarResultadoDirectoRequest request, String correoUsuario);
}
