package co.edu.uniquindio.playmotricity.repository;

import co.edu.uniquindio.playmotricity.entity.AsignacionActividad;
import co.edu.uniquindio.playmotricity.entity.EstadoAsignacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AsignacionActividadRepository
        extends JpaRepository<AsignacionActividad, UUID> {

    List<AsignacionActividad> findByPerfilId(UUID perfilId);

    List<AsignacionActividad> findByPerfilIdAndEstado(
            UUID perfilId,
            EstadoAsignacion estado
    );
}