package co.edu.uniquindio.playmotricity.repository;

import co.edu.uniquindio.playmotricity.entity.ResultadoActividad;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ResultadoActividadRepository
        extends JpaRepository<ResultadoActividad, UUID> {

    Optional<ResultadoActividad> findByAsignacionId(UUID asignacionId);
}