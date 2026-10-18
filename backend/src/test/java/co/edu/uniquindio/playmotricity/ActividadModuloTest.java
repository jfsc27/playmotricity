package co.edu.uniquindio.playmotricity;

import co.edu.uniquindio.playmotricity.entity.Actividad;
import co.edu.uniquindio.playmotricity.entity.PerfilInfantil;
import co.edu.uniquindio.playmotricity.repository.ActividadRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ActividadModuloTest {

    @Autowired private MockMvc mvc;
    @Autowired private ActividadRepository actividadRepository;

    private final ObjectMapper json = new ObjectMapper();
    private String tokenDocente;
    private String perfilId;

    @BeforeEach
    void setUp() throws Exception {
        String correo = "docente-act-" + UUID.randomUUID() + "@test.com";
        String res = mvc.perform(post("/api/auth/register/docente")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"nombre":"Docente Test","correo":"%s","password":"Password123!","institucion":"Colegio"}
                """.formatted(correo)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        tokenDocente = json.readTree(res).get("token").asText();

        // Crear un perfil infantil de prueba (4 años)
        String fechaValida = java.time.LocalDate.now().minusYears(4).toString();
        String perfilRes = mvc.perform(post("/api/perfiles")
                .header("Authorization", "Bearer " + tokenDocente)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"nombre":"Mateo Gomez","fechaNacimiento":"%s","grupoGrado":"Jardín B"}
                """.formatted(fechaValida)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        perfilId = json.readTree(perfilRes).get("id").asText();
    }

    @Test
    @DisplayName("Debe listar las actividades sembradas en Neon DB")
    void debeListarActividades() throws Exception {
        mvc.perform(get("/api/actividades")
                .header("Authorization", "Bearer " + tokenDocente))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", greaterThanOrEqualTo(10)));
    }

    @Test
    @DisplayName("Debe permitir asignar una actividad a un perfil infantil y registrar su resultado")
    void debeAsignarYRegistrarResultado() throws Exception {
        Actividad actividad = actividadRepository.findAll().getFirst();

        // 1. Asignar actividad al perfil
        String asignacionRes = mvc.perform(post("/api/actividades/asignar")
                .header("Authorization", "Bearer " + tokenDocente)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"perfilId":"%s","actividadId":"%s"}
                """.formatted(perfilId, actividad.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.perfilNombre", is("Mateo Gomez")))
                .andReturn().getResponse().getContentAsString();

        String asignacionId = json.readTree(asignacionRes).get("id").asText();

        // 2. Registrar resultado
        mvc.perform(post("/api/asignaciones/" + asignacionId + "/resultados")
                .header("Authorization", "Bearer " + tokenDocente)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"puntaje":95.0,"precision":90.0,"tiempoEjecucionSeg":45,"completada":true}
                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.completada", is(true)))
                .andExpect(jsonPath("$.puntaje", is(95.0)));

        // 3. Consultar asignaciones del perfil
        mvc.perform(get("/api/actividades/asignaciones/" + perfilId)
                .header("Authorization", "Bearer " + tokenDocente))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()", is(1)))
                .andExpect(jsonPath("$[0].estado", is("COMPLETADA")));
    }
}
