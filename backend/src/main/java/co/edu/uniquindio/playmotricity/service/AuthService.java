package co.edu.uniquindio.playmotricity.service;

import co.edu.uniquindio.playmotricity.dto.AuthResponse;
import co.edu.uniquindio.playmotricity.dto.LoginRequest;
import co.edu.uniquindio.playmotricity.dto.RegistroDocenteRequest;
import co.edu.uniquindio.playmotricity.dto.RegistroPadreRequest;
import co.edu.uniquindio.playmotricity.dto.UsuarioResponse;
import co.edu.uniquindio.playmotricity.entity.Docente;
import co.edu.uniquindio.playmotricity.entity.PadreAcudiente;
import co.edu.uniquindio.playmotricity.entity.Usuario;
import co.edu.uniquindio.playmotricity.exception.CorreoDuplicadoException;
import co.edu.uniquindio.playmotricity.repository.UsuarioRepository;
import co.edu.uniquindio.playmotricity.security.JwtService;
import co.edu.uniquindio.playmotricity.security.UsuarioDetailsService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse registrarDocente(RegistroDocenteRequest r) {
        validarCorreoLibre(r.correo());
        Docente docente = new Docente(r.nombre(), r.correo(), passwordEncoder.encode(r.password()),
                r.institucion(), r.grupoAsignado());
        return respuesta(usuarioRepository.save(docente));
    }

    @Transactional
    public AuthResponse registrarPadre(RegistroPadreRequest r) {
        validarCorreoLibre(r.correo());
        PadreAcudiente padre = new PadreAcudiente(r.nombre(), r.correo(), passwordEncoder.encode(r.password()),
                r.parentesco(), r.telefonoContacto());
        return respuesta(usuarioRepository.save(padre));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest r) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(r.correo(), r.password()));
        Usuario usuario = usuarioRepository.findByCorreo(r.correo()).orElseThrow();
        return respuesta(usuario);
    }

    @Transactional(readOnly = true)
    public UsuarioResponse perfilDe(String correo) {
        return aDto(usuarioRepository.findByCorreo(correo).orElseThrow());
    }

    @Transactional
    public UsuarioResponse actualizarFoto(String correo, String fotoPerfil) {
        Usuario usuario = usuarioRepository.findByCorreo(correo).orElseThrow();
        usuario.setFotoPerfil(fotoPerfil);
        Usuario guardado = usuarioRepository.save(usuario);
        return aDto(guardado);
    }

    private void validarCorreoLibre(String correo) {
        if (usuarioRepository.existsByCorreo(correo)) {
            throw new CorreoDuplicadoException(correo);
        }
    }

    private AuthResponse respuesta(Usuario u) {
        String token = jwtService.generarToken(u.getCorreo(), UsuarioDetailsService.rolDe(u));
        return new AuthResponse(token, "Bearer", jwtService.getExpirationMs(), aDto(u));
    }

    private UsuarioResponse aDto(Usuario u) {
        return new UsuarioResponse(u.getId(), u.getNombre(), u.getCorreo(), UsuarioDetailsService.rolDe(u), u.getFotoPerfil());
    }
}
