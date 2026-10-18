package co.edu.uniquindio.playmotricity.controller;

import co.edu.uniquindio.playmotricity.dto.ResumenPadreResponse;
import co.edu.uniquindio.playmotricity.service.AutorizacionService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Endpoints exclusivos del rol PADRE (ademas de la regla /api/padre/** en SecurityConfig). */
@RestController
@RequestMapping("/api/padre")
@PreAuthorize("hasRole('PADRE')")
public class PadreController {

    private final AutorizacionService autorizacionService;

    public PadreController(AutorizacionService autorizacionService) {
        this.autorizacionService = autorizacionService;
    }

    @GetMapping("/resumen")
    public ResumenPadreResponse resumen(Authentication authentication) {
        return autorizacionService.resumenPadre(authentication.getName());
    }
}
