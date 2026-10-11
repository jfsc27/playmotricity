package co.edu.uniquindio.playmotricity;

import co.edu.uniquindio.playmotricity.entity.PerfilInfantil;
import co.edu.uniquindio.playmotricity.repository.PerfilInfantilRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class PersistenciaNeonTest {

    @Autowired
    private PerfilInfantilRepository perfilInfantilRepository;

    @Test
    void guardarYConsultarPerfilInfantil() {

        PerfilInfantil perfil = new PerfilInfantil(
                "Perfil de prueba",
                LocalDate.of(2021, 5, 15),
                "Preescolar"
        );

        PerfilInfantil guardado = perfilInfantilRepository.save(perfil);

        assertNotNull(guardado.getId());

        PerfilInfantil encontrado = perfilInfantilRepository
                .findById(guardado.getId())
                .orElse(null);

        assertNotNull(encontrado);
        assertEquals("Perfil de prueba", encontrado.getNombre());
        assertEquals("Preescolar", encontrado.getGrupoGrado());

        System.out.println("Perfil guardado correctamente en Neon");
        System.out.println("ID: " + guardado.getId());
    }
}