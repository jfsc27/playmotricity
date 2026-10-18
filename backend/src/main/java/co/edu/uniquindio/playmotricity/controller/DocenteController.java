package co.edu.uniquindio.playmotricity.controller;

import co.edu.uniquindio.playmotricity.dto.ResumenDocenteResponse;
import co.edu.uniquindio.playmotricity.service.AutorizacionService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Endpoints exclusivos del rol DOCENTE (ademas de la regla /api/docente/** en SecurityConfig). */
@RestController
@RequestMapping("/api/docente")
@PreAuthorize("hasRole('DOCENTE')")
public class DocenteController {

    private final AutorizacionService autorizacionService;

    public DocenteController(AutorizacionService autorizacionService) {
        this.autorizacionService = autorizacionService;
    }

    @GetMapping("/resumen")
    public ResumenDocenteResponse resumen(Authentication authentication) {
        return autorizacionService.resumenDocente(authentication.getName());
    }
}
