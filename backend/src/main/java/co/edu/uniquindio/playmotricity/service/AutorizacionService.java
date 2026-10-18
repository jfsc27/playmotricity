package co.edu.uniquindio.playmotricity.service;

import co.edu.uniquindio.playmotricity.dto.ResumenDocenteResponse;
import co.edu.uniquindio.playmotricity.dto.ResumenPadreResponse;
import co.edu.uniquindio.playmotricity.entity.Docente;
import co.edu.uniquindio.playmotricity.entity.PadreAcudiente;
import co.edu.uniquindio.playmotricity.entity.Usuario;
import co.edu.uniquindio.playmotricity.repository.UsuarioRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AutorizacionService {

    private final UsuarioRepository usuarioRepository;

    public AutorizacionService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public ResumenDocenteResponse resumenDocente(String correo) {
        if (!(buscar(correo) instanceof Docente d)) {
            throw new AccessDeniedException("El usuario no es docente");
        }
        return new ResumenDocenteResponse(d.getNombre(), d.getCorreo(), d.getInstitucion(),
                d.getGrupoAsignado(), d.getPerfiles().size());
    }

    @Transactional(readOnly = true)
    public ResumenPadreResponse resumenPadre(String correo) {
        if (!(buscar(correo) instanceof PadreAcudiente p)) {
            throw new AccessDeniedException("El usuario no es padre o acudiente");
        }
        return new ResumenPadreResponse(p.getNombre(), p.getCorreo(), p.getParentesco(),
                p.getTelefonoContacto(), p.getPerfiles().size());
    }

    private Usuario buscar(String correo) {
        return usuarioRepository.findByCorreo(correo).orElseThrow(
                () -> new AccessDeniedException("Usuario no encontrado"));
    }
}
