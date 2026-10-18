package co.edu.uniquindio.playmotricity.service;

import co.edu.uniquindio.playmotricity.dto.AsignacionResponse;
import co.edu.uniquindio.playmotricity.dto.RegistrarResultadoRequest;
import co.edu.uniquindio.playmotricity.dto.ResultadoActividadResponse;

import java.util.UUID;

public interface IRegistroResultados {

    ResultadoActividadResponse registrarResultado(UUID asignacionId, RegistrarResultadoRequest request, String correoUsuario);

    AsignacionResponse obtenerAsignacion(UUID asignacionId, String correoUsuario);
}
