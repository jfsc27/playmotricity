package co.edu.uniquindio.playmotricity.repository;

import co.edu.uniquindio.playmotricity.entity.ReporteProgreso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReporteProgresoRepository
        extends JpaRepository<ReporteProgreso, UUID> {

    List<ReporteProgreso> findByPerfilId(UUID perfilId);
}