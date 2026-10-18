package co.edu.uniquindio.playmotricity;

import co.edu.uniquindio.playmotricity.entity.Actividad;
import co.edu.uniquindio.playmotricity.entity.AsignacionActividad;
import co.edu.uniquindio.playmotricity.entity.EstadoAsignacion;
import co.edu.uniquindio.playmotricity.entity.Minijuego;
import co.edu.uniquindio.playmotricity.entity.PerfilInfantil;
import co.edu.uniquindio.playmotricity.entity.TipoActividad;
import co.edu.uniquindio.playmotricity.entity.Usuario;
import co.edu.uniquindio.playmotricity.repository.ActividadRepository;
import co.edu.uniquindio.playmotricity.repository.AsignacionActividadRepository;
import co.edu.uniquindio.playmotricity.repository.PerfilInfantilRepository;
import co.edu.uniquindio.playmotricity.repository.ResultadoActividadRepository;
import co.edu.uniquindio.playmotricity.repository.UsuarioRepository;
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
import org.springframework.test.web.servlet.ResultActions;

import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class RegistroResultadosTest {

    private static final String COMPLETADO = """
            {"puntaje":85.5,"precision":90,"tiempoEjecucionSeg":120,"completada":true}""";
    private static final String NO_COMPLETADO = """
            {"puntaje":40,"precision":55.5,"tiempoEjecucionSeg":60,"completada":false}""";

    @Autowired private MockMvc mvc;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private PerfilInfantilRepository perfilRepository;
    @Autowired private ActividadRepository actividadRepository;
    @Autowired private AsignacionActividadRepository asignacionRepository;
    @Autowired private ResultadoActividadRepository resultadoRepository;

    private final ObjectMapper json = new ObjectMapper();
    private String tokenDocente;
    private String correoDocente;
    private UUID asignacionId;

    @BeforeEach
    void setUp() throws Exception {
        correoDocente = correoUnico();
        tokenDocente = registrar("/api/auth/register/docente", """
                {"nombre":"Docente Resultados","correo":"%s","password":"Password123!","institucion":"Jardin"}
                """.formatted(correoDocente));
        asignacionId = crearAsignacionPara(correoDocente, tokenDocente);
    }

    private String correoUnico() {
        return "resultado-" + UUID.randomUUID() + "@playmotricity.test";
    }

    private String registrar(String url, String body) throws Exception {
        String r = mvc.perform(post(url).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return json.readTree(r).get("token").asText();
    }

    /** Crea un perfil (via API, queda vinculado al usuario), una actividad y una asignacion PENDIENTE. */
    private UUID crearAsignacionPara(String correo, String token) throws Exception {
        String perfilJson = mvc.perform(post("/api/perfiles").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Nino Prueba\",\"fechaNacimiento\":\"%s\"}"
                                .formatted(LocalDate.now().minusYears(4))))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        PerfilInfantil perfil = perfilRepository.findById(UUID.fromString(json.readTree(perfilJson).get("id").asText())).orElseThrow();

        Actividad actividad = actividadRepository.save(new Minijuego("Salta la cuerda", "Saltar al ritmo",
                TipoActividad.MOTRICIDAD_GRUESA, 3, 6, "Salta 10 veces", "TACTIL", 180));
        Usuario usuario = usuarioRepository.findByCorreo(correo).orElseThrow();
        return asignacionRepository.save(new AsignacionActividad(perfil, actividad, usuario)).getId();
    }

    private ResultActions registrarResultado(UUID id, String token, String body) throws Exception {
        return mvc.perform(post("/api/asignaciones/" + id + "/resultados")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private EstadoAsignacion estadoEnBd(UUID id) {
        return asignacionRepository.findById(id).orElseThrow().getEstado();
    }

    // ---------- SUB-32.2 / 32.3: registro y cambio de estado ----------

    @Test
    @DisplayName("Resultado completado: se guarda y la asignacion pasa de PENDIENTE a COMPLETADA")
    void resultadoCompletadoMarcaCompletada() throws Exception {
        assertEquals(EstadoAsignacion.PENDIENTE, estadoEnBd(asignacionId));

        registrarResultado(asignacionId, tokenDocente, COMPLETADO)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.puntaje").value(85.5))
                .andExpect(jsonPath("$.precision").value(90.0))
                .andExpect(jsonPath("$.tiempoEjecucionSeg").value(120))
                .andExpect(jsonPath("$.completada").value(true))
                .andExpect(jsonPath("$.estadoAsignacion").value("COMPLETADA"))
                .andExpect(jsonPath("$.fechaRealizacion").isNotEmpty());

        assertEquals(EstadoAsignacion.COMPLETADA, estadoEnBd(asignacionId));
        assertTrue(resultadoRepository.findByAsignacionId(asignacionId).isPresent());
    }

    @Test
    @DisplayName("Resultado no completado: la asignacion queda EN_PROGRESO")
    void resultadoNoCompletadoMarcaEnProgreso() throws Exception {
        registrarResultado(asignacionId, tokenDocente, NO_COMPLETADO)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estadoAsignacion").value("EN_PROGRESO"));
        assertEquals(EstadoAsignacion.EN_PROGRESO, estadoEnBd(asignacionId));
    }

    @Test
    @DisplayName("Un nuevo intento reemplaza al intento no completado (un solo resultado por asignacion)")
    void nuevoIntentoReemplazaAlAnterior() throws Exception {
        String primero = registrarResultado(asignacionId, tokenDocente, NO_COMPLETADO)
                .andReturn().getResponse().getContentAsString();
        String segundo = registrarResultado(asignacionId, tokenDocente, COMPLETADO)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estadoAsignacion").value("COMPLETADA"))
                .andExpect(jsonPath("$.puntaje").value(85.5))
                .andReturn().getResponse().getContentAsString();

        assertEquals(json.readTree(primero).get("id").asText(), json.readTree(segundo).get("id").asText());
    }

    @Test
    @DisplayName("GET de la asignacion muestra el estado actualizado y su resultado")
    void consultarAsignacionMuestraResultado() throws Exception {
        mvc.perform(get("/api/asignaciones/" + asignacionId).header("Authorization", "Bearer " + tokenDocente))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("PENDIENTE"))
                .andExpect(jsonPath("$.resultado").doesNotExist());

        registrarResultado(asignacionId, tokenDocente, COMPLETADO);

        mvc.perform(get("/api/asignaciones/" + asignacionId).header("Authorization", "Bearer " + tokenDocente))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("COMPLETADA"))
                .andExpect(jsonPath("$.actividadNombre").value("Salta la cuerda"))
                .andExpect(jsonPath("$.resultado.puntaje").value(85.5));
    }

    @Test
    @DisplayName("Un padre tambien puede registrar resultados de un nino a su cargo")
    void padrePuedeRegistrar() throws Exception {
        String correoPadre = correoUnico();
        String tokenPadre = registrar("/api/auth/register/padre", """
                {"nombre":"Padre Resultados","correo":"%s","password":"Password123!","parentesco":"MADRE"}
                """.formatted(correoPadre));
        UUID asignacionPadre = crearAsignacionPara(correoPadre, tokenPadre);

        registrarResultado(asignacionPadre, tokenPadre, COMPLETADO).andExpect(status().isCreated());
    }

    // ---------- SUB-32.1 / 32.4: validaciones y errores ----------

    @Test
    @DisplayName("Asignacion ya COMPLETADA: 409 y no se modifica")
    void asignacionCompletadaDevuelve409() throws Exception {
        registrarResultado(asignacionId, tokenDocente, COMPLETADO).andExpect(status().isCreated());
        registrarResultado(asignacionId, tokenDocente, NO_COMPLETADO)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.mensaje").isNotEmpty());
        assertEquals(EstadoAsignacion.COMPLETADA, estadoEnBd(asignacionId));
        assertEquals(85.5f, resultadoRepository.findByAsignacionId(asignacionId).orElseThrow().getPuntaje());
    }

    @Test
    @DisplayName("Asignacion inexistente: 404")
    void asignacionInexistenteDevuelve404() throws Exception {
        registrarResultado(UUID.randomUUID(), tokenDocente, COMPLETADO)
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.mensaje").isNotEmpty());
    }

    @Test
    @DisplayName("Asignacion de un nino que no esta a cargo del usuario: 403 y no se registra nada")
    void asignacionAjenaDevuelve403() throws Exception {
        String tokenOtro = registrar("/api/auth/register/padre", """
                {"nombre":"Otro Padre","correo":"%s","password":"Password123!","parentesco":"PADRE"}
                """.formatted(correoUnico()));

        registrarResultado(asignacionId, tokenOtro, COMPLETADO).andExpect(status().isForbidden());
        mvc.perform(get("/api/asignaciones/" + asignacionId).header("Authorization", "Bearer " + tokenOtro))
                .andExpect(status().isForbidden());
        assertEquals(EstadoAsignacion.PENDIENTE, estadoEnBd(asignacionId));
    }

    @Test
    @DisplayName("Puntaje fuera de rango: 400 con mensaje")
    void puntajeFueraDeRangoDevuelve400() throws Exception {
        registrarResultado(asignacionId, tokenDocente,
                "{\"puntaje\":150,\"precision\":90,\"tiempoEjecucionSeg\":120,\"completada\":true}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("puntaje: El puntaje debe estar entre 0 y 100"));
        assertEquals(EstadoAsignacion.PENDIENTE, estadoEnBd(asignacionId));
    }

    @Test
    @DisplayName("Tiempo de ejecucion 0 o campos faltantes: 400")
    void datosInvalidosDevuelven400() throws Exception {
        registrarResultado(asignacionId, tokenDocente,
                "{\"puntaje\":50,\"precision\":50,\"tiempoEjecucionSeg\":0,\"completada\":true}")
                .andExpect(status().isBadRequest());
        registrarResultado(asignacionId, tokenDocente,
                "{\"puntaje\":50,\"precision\":50,\"tiempoEjecucionSeg\":30}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("completada: Debe indicarse si la actividad fue completada"));
    }

    @Test
    @DisplayName("JSON mal formado o UUID invalido: 400")
    void formatoInvalidoDevuelve400() throws Exception {
        registrarResultado(asignacionId, tokenDocente, "{\"puntaje\":\"mucho\"}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").isNotEmpty());
        mvc.perform(post("/api/asignaciones/no-es-un-uuid/resultados")
                        .header("Authorization", "Bearer " + tokenDocente)
                        .contentType(MediaType.APPLICATION_JSON).content(COMPLETADO))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Sin token: 401")
    void sinTokenDevuelve401() throws Exception {
        mvc.perform(post("/api/asignaciones/" + asignacionId + "/resultados")
                        .contentType(MediaType.APPLICATION_JSON).content(COMPLETADO))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Eliminar un perfil con asignaciones: 409 con mensaje (no 401 ni 500) y la sesion sigue valida")
    void eliminarPerfilConAsignacionesDevuelve409() throws Exception {
        UUID perfilId = asignacionRepository.findById(asignacionId).orElseThrow().getPerfil().getId();
        mvc.perform(delete("/api/perfiles/" + perfilId).header("Authorization", "Bearer " + tokenDocente))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.mensaje").isNotEmpty());
        assertTrue(perfilRepository.findById(perfilId).isPresent());
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + tokenDocente))
                .andExpect(status().isOk());
    }
}
