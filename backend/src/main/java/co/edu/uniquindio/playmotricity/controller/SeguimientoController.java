package co.edu.uniquindio.playmotricity.controller;

import co.edu.uniquindio.playmotricity.dto.ProgresoPerfilResponse;
import co.edu.uniquindio.playmotricity.dto.ReporteProgresoResponse;
import co.edu.uniquindio.playmotricity.dto.ResultadoDetalleResponse;
import co.edu.uniquindio.playmotricity.service.ISeguimiento;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/seguimiento/perfiles/{perfilId}")
public class SeguimientoController {

    private final ISeguimiento seguimiento;

    public SeguimientoController(ISeguimiento seguimiento) {
        this.seguimiento = seguimiento;
    }

    @GetMapping("/actividades-completadas")
    public List<ResultadoDetalleResponse> actividadesCompletadas(@PathVariable UUID perfilId, Authentication auth) {
        return seguimiento.consultarActividadesCompletadas(perfilId, auth.getName());
    }

    @GetMapping("/resultados")
    public List<ResultadoDetalleResponse> resultados(@PathVariable UUID perfilId, Authentication auth) {
        return seguimiento.consultarResultados(perfilId, auth.getName());
    }

    @GetMapping("/progreso")
    public ProgresoPerfilResponse progreso(@PathVariable UUID perfilId, Authentication auth) {
        return seguimiento.calcularProgreso(perfilId, auth.getName());
    }

    @PostMapping("/reportes")
    @ResponseStatus(HttpStatus.CREATED)
    public ReporteProgresoResponse generarReporte(@PathVariable UUID perfilId, Authentication auth) {
        return ReporteProgresoResponse.fromEntity(seguimiento.generarReporte(perfilId, auth.getName()));
    }

    @GetMapping("/reportes")
    public List<ReporteProgresoResponse> reportes(@PathVariable UUID perfilId, Authentication auth) {
        return seguimiento.listarReportes(perfilId, auth.getName());
    }
}
