package co.edu.uniquindio.playmotricity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PerfilInfantilTest {

    @Autowired
    private MockMvc mvc;

    private final ObjectMapper json = new ObjectMapper();
    private String tokenDocente;

    @BeforeEach
    void setUp() throws Exception {
        String correo = "docente-" + UUID.randomUUID() + "@playmotricity.test";
        String body = """
                {"nombre":"Docente Perfil Test","correo":"%s","password":"Password123!","institucion":"Jardín Central"}
                """.formatted(correo);

        String respuesta = mvc.perform(post("/api/auth/register/docente")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        JsonNode node = json.readTree(respuesta);
        this.tokenDocente = node.get("token").asText();
    }

    @Test
    @DisplayName("API: Registrar perfil infantil válido devuelve 201 y edad calculada")
    void api_crearPerfilValido_devuelve201() throws Exception {
        LocalDate fechaValida = LocalDate.now().minusYears(3).minusMonths(2);
        String body = """
                {"nombre":"Sara Sofía Gómez","fechaNacimiento":"%s","grupoGrado":"Párvulos 2"}
                """.formatted(fechaValida);

        mvc.perform(post("/api/perfiles")
                        .header("Authorization", "Bearer " + tokenDocente)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nombre").value("Sara Sofía Gómez"))
                .andExpect(jsonPath("$.edad").value(3))
                .andExpect(jsonPath("$.grupoGrado").value("Párvulos 2"))
                .andExpect(jsonPath("$.id").isNotEmpty());
    }

    @Test
    @DisplayName("API: Registrar perfil con edad fuera de rango (1 año) devuelve 400 con mensaje de dominio")
    void api_crearPerfilMenorDe2Anos_devuelve400() throws Exception {
        LocalDate fechaInvalida = LocalDate.now().minusMonths(10);
        String body = """
                {"nombre":"Bebé Tomás","fechaNacimiento":"%s","grupoGrado":"Lactantes"}
                """.formatted(fechaInvalida);

        mvc.perform(post("/api/perfiles")
                        .header("Authorization", "Bearer " + tokenDocente)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").isNotEmpty());
    }

    @Test
    @DisplayName("API: Flujo completo CRUD de gestión de perfiles (crear, listar, actualizar, eliminar)")
    void api_flujoCompletoGestionPerfiles() throws Exception {
        LocalDate nacimiento = LocalDate.now().minusYears(4);
        String bodyCrear = """
                {"nombre":"Samuel Duque","fechaNacimiento":"%s","grupoGrado":"Jardín A"}
                """.formatted(nacimiento);

        // 1. Crear
        String resCrear = mvc.perform(post("/api/perfiles")
                        .header("Authorization", "Bearer " + tokenDocente)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bodyCrear))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nombre").value("Samuel Duque"))
                .andReturn().getResponse().getContentAsString();

        String idPerfil = json.readTree(resCrear).get("id").asText();

        // 2. Listar
        mvc.perform(get("/api/perfiles")
                        .header("Authorization", "Bearer " + tokenDocente))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(idPerfil));

        // 3. Actualizar
        LocalDate nacimientoAct = LocalDate.now().minusYears(5);
        String bodyActualizar = """
                {"nombre":"Samuel Duque Editado","fechaNacimiento":"%s","grupoGrado":"Transición B"}
                """.formatted(nacimientoAct);

        mvc.perform(put("/api/perfiles/" + idPerfil)
                        .header("Authorization", "Bearer " + tokenDocente)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bodyActualizar))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Samuel Duque Editado"))
                .andExpect(jsonPath("$.edad").value(5))
                .andExpect(jsonPath("$.grupoGrado").value("Transición B"));

        // 4. Eliminar
        mvc.perform(delete("/api/perfiles/" + idPerfil)
                        .header("Authorization", "Bearer " + tokenDocente))
                .andExpect(status().isNoContent());

        // 5. Confirmar eliminación
        mvc.perform(get("/api/perfiles/" + idPerfil)
                        .header("Authorization", "Bearer " + tokenDocente))
                .andExpect(status().isNotFound());
    }
}
