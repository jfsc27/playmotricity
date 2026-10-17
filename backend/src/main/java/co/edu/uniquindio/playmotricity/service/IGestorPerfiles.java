package co.edu.uniquindio.playmotricity.service;

import co.edu.uniquindio.playmotricity.entity.PerfilInfantil;

import java.util.List;
import java.util.UUID;

public interface IGestorPerfiles {

    PerfilInfantil crearPerfil(PerfilInfantil perfil);

    PerfilInfantil obtenerPerfil(UUID id);

    List<PerfilInfantil> listarPerfiles();

    PerfilInfantil actualizarPerfil(UUID id, PerfilInfantil perfil);

    PerfilInfantil crearPerfilParaUsuario(PerfilInfantil perfil, String correoUsuario);

    List<PerfilInfantil> listarPerfilesDeUsuario(String correoUsuario);

    PerfilInfantil obtenerPerfilDeUsuario(UUID id, String correoUsuario);

    PerfilInfantil actualizarPerfilDeUsuario(UUID id, PerfilInfantil datosActualizados, String correoUsuario);

    void eliminarPerfilDeUsuario(UUID id, String correoUsuario);
}