package co.edu.uniquindio.playmotricity;

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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AutorizacionRolesTest {

    @Autowired
    private MockMvc mvc;

    private final ObjectMapper json = new ObjectMapper();
    private String tokenDocente;
    private String tokenPadre;

    @BeforeEach
    void setUp() throws Exception {
        tokenDocente = registrar("/api/auth/register/docente", """
                {"nombre":"Docente Rol","correo":"%s","password":"Password123!","institucion":"Jardin","grupoAsignado":"Transicion A"}
                """.formatted(correoUnico()));
        tokenPadre = registrar("/api/auth/register/padre", """
                {"nombre":"Padre Rol","correo":"%s","password":"Password123!","parentesco":"PADRE","telefonoContacto":"3001234567"}
                """.formatted(correoUnico()));
    }

    private String correoUnico() {
        return "rol-" + UUID.randomUUID() + "@playmotricity.test";
    }

    private String registrar(String url, String body) throws Exception {
        String respuesta = mvc.perform(post(url).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return json.readTree(respuesta).get("token").asText();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    @Test
    @DisplayName("El token y /me exponen el rol correcto de cada usuario")
    void meDevuelveElRol() throws Exception {
        mvc.perform(get("/api/auth/me").header("Authorization", bearer(tokenDocente)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.rol").value("DOCENTE"));
        mvc.perform(get("/api/auth/me").header("Authorization", bearer(tokenPadre)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.rol").value("PADRE"));
    }

    @Test
    @DisplayName("Permitido: docente accede a /api/docente/**")
    void docentePuedeVerResumenDocente() throws Exception {
        mvc.perform(get("/api/docente/resumen").header("Authorization", bearer(tokenDocente)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.institucion").value("Jardin"))
                .andExpect(jsonPath("$.grupoAsignado").value("Transicion A"))
                .andExpect(jsonPath("$.perfilesACargo").value(0));
    }

    @Test
    @DisplayName("Permitido: padre accede a /api/padre/**")
    void padrePuedeVerResumenPadre() throws Exception {
        mvc.perform(get("/api/padre/resumen").header("Authorization", bearer(tokenPadre)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.parentesco").value("PADRE"))
                .andExpect(jsonPath("$.telefonoContacto").value("3001234567"));
    }

    @Test
    @DisplayName("Rechazado: padre no accede a /api/docente/** (403)")
    void padreNoPuedeVerResumenDocente() throws Exception {
        mvc.perform(get("/api/docente/resumen").header("Authorization", bearer(tokenPadre)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.mensaje").value("No tienes permisos para acceder a este recurso"));
    }

    @Test
    @DisplayName("Rechazado: docente no accede a /api/padre/** (403)")
    void docenteNoPuedeVerResumenPadre() throws Exception {
        mvc.perform(get("/api/padre/resumen").header("Authorization", bearer(tokenDocente)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Rechazado: sin token los endpoints por rol devuelven 401")
    void sinTokenDevuelve401() throws Exception {
        mvc.perform(get("/api/docente/resumen")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/padre/resumen")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/perfiles")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Permitido: ambos roles acceden a /api/perfiles")
    void ambosRolesAccedenAPerfiles() throws Exception {
        mvc.perform(get("/api/perfiles").header("Authorization", bearer(tokenDocente))).andExpect(status().isOk());
        mvc.perform(get("/api/perfiles").header("Authorization", bearer(tokenPadre))).andExpect(status().isOk());
    }

    @Test
    @DisplayName("Rechazado: token invalido en endpoint por rol devuelve 401")
    void tokenInvalidoDevuelve401() throws Exception {
        mvc.perform(get("/api/docente/resumen").header("Authorization", "Bearer token.falso.xyz"))
                .andExpect(status().isUnauthorized());
    }
}
