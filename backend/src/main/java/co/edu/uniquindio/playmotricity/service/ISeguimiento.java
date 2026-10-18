package co.edu.uniquindio.playmotricity.service;

import co.edu.uniquindio.playmotricity.dto.ProgresoPerfilResponse;
import co.edu.uniquindio.playmotricity.dto.ReporteProgresoResponse;
import co.edu.uniquindio.playmotricity.dto.ResultadoDetalleResponse;
import co.edu.uniquindio.playmotricity.entity.ReporteProgreso;

import java.util.List;
import java.util.UUID;

public interface ISeguimiento {

    ReporteProgreso generarReporte(UUID perfilId);

    ReporteProgreso generarReporte(UUID perfilId, String correoUsuario);

    List<ResultadoDetalleResponse> consultarActividadesCompletadas(UUID perfilId, String correoUsuario);

    List<ResultadoDetalleResponse> consultarResultados(UUID perfilId, String correoUsuario);

    ProgresoPerfilResponse calcularProgreso(UUID perfilId, String correoUsuario);

    List<ReporteProgresoResponse> listarReportes(UUID perfilId, String correoUsuario);
}
