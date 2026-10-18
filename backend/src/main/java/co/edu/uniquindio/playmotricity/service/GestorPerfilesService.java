package co.edu.uniquindio.playmotricity.service;

import co.edu.uniquindio.playmotricity.entity.PerfilInfantil;
import co.edu.uniquindio.playmotricity.entity.Usuario;
import co.edu.uniquindio.playmotricity.exception.PerfilNoEncontradoException;
import co.edu.uniquindio.playmotricity.repository.PerfilInfantilRepository;
import co.edu.uniquindio.playmotricity.repository.UsuarioRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class GestorPerfilesService implements IGestorPerfiles {

    private final PerfilInfantilRepository perfilInfantilRepository;
    private final UsuarioRepository usuarioRepository;

    public GestorPerfilesService(
            PerfilInfantilRepository perfilInfantilRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.perfilInfantilRepository = perfilInfantilRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    @Transactional
    public PerfilInfantil crearPerfil(PerfilInfantil perfil) {
        perfil.validarReglaEdad();
        return perfilInfantilRepository.save(perfil);
    }

    @Override
    @Transactional(readOnly = true)
    public PerfilInfantil obtenerPerfil(UUID id) {
        return perfilInfantilRepository.findById(id)
                .orElseThrow(() -> new PerfilNoEncontradoException(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PerfilInfantil> listarPerfiles() {
        return perfilInfantilRepository.findAll();
    }

    @Override
    @Transactional
    public PerfilInfantil actualizarPerfil(UUID id, PerfilInfantil datosActualizados) {
        PerfilInfantil existente = obtenerPerfil(id);
        existente.setNombre(datosActualizados.getNombre());
        existente.setFechaNacimiento(datosActualizados.getFechaNacimiento());
        existente.setGrupoGrado(datosActualizados.getGrupoGrado());
        existente.validarReglaEdad();
        return perfilInfantilRepository.save(existente);
    }

    @Override
    @Transactional
    public PerfilInfantil crearPerfilParaUsuario(PerfilInfantil perfil, String correoUsuario) {
        Usuario usuario = usuarioRepository.findByCorreo(correoUsuario)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con correo: " + correoUsuario));

        perfil.validarReglaEdad();
        PerfilInfantil guardado = perfilInfantilRepository.save(perfil);

        usuario.agregarPerfil(guardado);
        usuarioRepository.save(usuario);

        return guardado;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PerfilInfantil> listarPerfilesDeUsuario(String correoUsuario) {
        return perfilInfantilRepository.findByUsuariosCorreoOrderByFechaRegistroDesc(correoUsuario);
    }

    @Override
    @Transactional(readOnly = true)
    public PerfilInfantil obtenerPerfilDeUsuario(UUID id, String correoUsuario) {
        return perfilInfantilRepository.findByIdAndUsuariosCorreo(id, correoUsuario)
                .orElseThrow(() -> new PerfilNoEncontradoException(
                        String.format("No se encontró el perfil infantil con id %s asociado al usuario actual", id)
                ));
    }

    @Override
    @Transactional
    public PerfilInfantil actualizarPerfilDeUsuario(UUID id, PerfilInfantil datosActualizados, String correoUsuario) {
        PerfilInfantil perfil = obtenerPerfilDeUsuario(id, correoUsuario);
        perfil.setNombre(datosActualizados.getNombre());
        perfil.setFechaNacimiento(datosActualizados.getFechaNacimiento());
        perfil.setGrupoGrado(datosActualizados.getGrupoGrado());
        if (datosActualizados.getFotoPerfil() != null) {
            perfil.setFotoPerfil(datosActualizados.getFotoPerfil());
        }
        perfil.validarReglaEdad();
        return perfilInfantilRepository.save(perfil);
    }

    @Override
    @Transactional
    public PerfilInfantil actualizarFotoDePerfil(UUID id, String fotoPerfil, String correoUsuario) {
        PerfilInfantil perfil = obtenerPerfilDeUsuario(id, correoUsuario);
        perfil.setFotoPerfil(fotoPerfil);
        return perfilInfantilRepository.save(perfil);
    }

    @Override
    @Transactional
    public void eliminarPerfilDeUsuario(UUID id, String correoUsuario) {
        Usuario usuario = usuarioRepository.findByCorreo(correoUsuario)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + correoUsuario));

        PerfilInfantil perfil = obtenerPerfilDeUsuario(id, correoUsuario);
        usuario.eliminarPerfil(perfil);
        usuarioRepository.save(usuario);

        // Si el perfil ya no pertenece a ningún usuario, se elimina de la base de datos
        if (perfil.getUsuarios() == null || perfil.getUsuarios().isEmpty() ||
                (perfil.getUsuarios().size() == 1 && perfil.getUsuarios().contains(usuario))) {
            perfilInfantilRepository.delete(perfil);
        }
    }
}
