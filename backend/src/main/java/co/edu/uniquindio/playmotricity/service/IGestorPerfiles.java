package co.edu.uniquindio.playmotricity.service;

import co.edu.uniquindio.playmotricity.entity.PerfilInfantil;

import java.util.List;
import java.util.UUID;

public interface IGestorPerfiles {

    PerfilInfantil crearPerfil(PerfilInfantil perfil);

    PerfilInfantil obtenerPerfil(UUID id);

    List<PerfilInfantil> listarPerfiles();

    PerfilInfantil actualizarPerfil(UUID id, PerfilInfantil perfil);
}