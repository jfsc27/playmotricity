package co.edu.uniquindio.playmotricity.repository;

import co.edu.uniquindio.playmotricity.entity.Actividad;
import co.edu.uniquindio.playmotricity.entity.TipoActividad;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ActividadRepository
        extends JpaRepository<Actividad, UUID> {

    List<Actividad> findByTipoActividad(TipoActividad tipoActividad);

    List<Actividad> findByEdadMinimaLessThanEqualAndEdadMaximaGreaterThanEqual(int edad, int edad2);

    List<Actividad> findAllByOrderByEdadMinimaAscNombreAsc();

    boolean existsByNombre(String nombre);
}