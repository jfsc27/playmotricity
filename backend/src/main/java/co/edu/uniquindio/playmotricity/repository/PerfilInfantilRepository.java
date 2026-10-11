package co.edu.uniquindio.playmotricity.repository;

import co.edu.uniquindio.playmotricity.entity.PerfilInfantil;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PerfilInfantilRepository
        extends JpaRepository<PerfilInfantil, UUID> {
}