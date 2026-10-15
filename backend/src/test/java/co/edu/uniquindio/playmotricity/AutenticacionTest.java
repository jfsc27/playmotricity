package co.edu.uniquindio.playmotricity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import co.edu.uniquindio.playmotricity.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AutenticacionTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private final ObjectMapper json = new ObjectMapper();

    private String registrarDocente(String correo, String password) throws Exception {
        String body = """
                {"nombre":"Docente Test","correo":"%s","password":"%s","institucion":"Colegio"}
                """.formatted(correo, password);
        return mvc.perform(post("/api/auth/register/docente").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
    }

    private String correoUnico() {
        return "test-" + UUID.randomUUID() + "@playmotricity.test";
    }

    @Test
    void endpointProtegidoSinTokenDevuelve401() throws Exception {
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void healthEsPublico() throws Exception {
        mvc.perform(get("/api/health")).andExpect(status().isOk());
    }

    @Test
    void registroGuardaLaContrasenaHasheada() throws Exception {
        String correo = correoUnico();
        registrarDocente(correo, "clave12345");
        String hash = usuarioRepository.findByCorreo(correo).orElseThrow().getPasswordHash();
        assertNotEquals("clave12345", hash);
        org.junit.jupiter.api.Assertions.assertTrue(hash.startsWith("$2"));
    }

    @Test
    void loginCorrectoPermiteAccederConElToken() throws Exception {
        String correo = correoUnico();
        registrarDocente(correo, "clave12345");

        String respuesta = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"correo\":\"%s\",\"password\":\"clave12345\"}".formatted(correo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usuario.rol").value("DOCENTE"))
                .andReturn().getResponse().getContentAsString();
        JsonNode node = json.readTree(respuesta);

        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + node.get("token").asText()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correo").value(correo));
    }

    @Test
    void loginConContrasenaIncorrectaDevuelve401() throws Exception {
        String correo = correoUnico();
        registrarDocente(correo, "clave12345");
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"correo\":\"%s\",\"password\":\"incorrecta\"}".formatted(correo)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void tokenInvalidoDevuelve401() throws Exception {
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer token.invalido.xyz"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void registroConCorreoRepetidoDevuelve409() throws Exception {
        String correo = correoUnico();
        registrarDocente(correo, "clave12345");
        mvc.perform(post("/api/auth/register/docente").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"X\",\"correo\":\"%s\",\"password\":\"clave12345\",\"institucion\":\"C\"}".formatted(correo)))
                .andExpect(status().isConflict());
    }

    @Test
    void registroConContrasenaCortaDevuelve400() throws Exception {
        mvc.perform(post("/api/auth/register/docente").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"X\",\"correo\":\"%s\",\"password\":\"123\",\"institucion\":\"C\"}".formatted(correoUnico())))
                .andExpect(status().isBadRequest());
    }
}
