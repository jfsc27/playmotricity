package co.edu.uniquindio.playmotricity;

import co.edu.uniquindio.playmotricity.entity.AsignacionActividad;
import co.edu.uniquindio.playmotricity.entity.Minijuego;
import co.edu.uniquindio.playmotricity.entity.PerfilInfantil;
import co.edu.uniquindio.playmotricity.entity.TipoActividad;
import co.edu.uniquindio.playmotricity.entity.Usuario;
import co.edu.uniquindio.playmotricity.repository.ActividadRepository;
import co.edu.uniquindio.playmotricity.repository.AsignacionActividadRepository;
import co.edu.uniquindio.playmotricity.repository.PerfilInfantilRepository;
import co.edu.uniquindio.playmotricity.repository.ReporteProgresoRepository;
import co.edu.uniquindio.playmotricity.repository.UsuarioRepository;
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

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SeguimientoTest {

    @Autowired private MockMvc mvc;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private PerfilInfantilRepository perfilRepository;
    @Autowired private ActividadRepository actividadRepository;
    @Autowired private AsignacionActividadRepository asignacionRepository;
    @Autowired private ReporteProgresoRepository reporteRepository;

    private final ObjectMapper json = new ObjectMapper();
    private String token;
    private String correo;
    private PerfilInfantil perfil;

    @BeforeEach
    void setUp() throws Exception {
        correo = correoUnico();
        token = registrar("/api/auth/register/docente", """
                {"nombre":"Docente Seguimiento","correo":"%s","password":"Password123!","institucion":"Jardin"}
                """.formatted(correo));
        perfil = crearPerfil(token, "Lucia Fernanda");
    }

    private String correoUnico() {
        return "seguimiento-" + UUID.randomUUID() + "@playmotricity.test";
    }

    private String registrar(String url, String body) throws Exception {
        String r = mvc.perform(post(url).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return json.readTree(r).get("token").asText();
    }

    private PerfilInfantil crearPerfil(String tk, String nombre) throws Exception {
        String r = mvc.perform(post("/api/perfiles").header("Authorization", "Bearer " + tk)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"%s\",\"fechaNacimiento\":\"%s\"}".formatted(nombre, LocalDate.now().minusYears(5))))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return perfilRepository.findById(UUID.fromString(json.readTree(r).get("id").asText())).orElseThrow();
    }

    private UUID asignar(TipoActividad tipo, String nombre) {
        Minijuego juego = actividadRepository.save(new Minijuego(nombre, "desc", tipo, 2, 6, "inst", "TACTIL", 120));
        Usuario usuario = usuarioRepository.findByCorreo(correo).orElseThrow();
        return asignacionRepository.save(new AsignacionActividad(perfil, juego, usuario)).getId();
    }

    private void resultado(UUID asignacionId, double puntaje, double precision, int tiempo, boolean completada) throws Exception {
        mvc.perform(post("/api/asignaciones/" + asignacionId + "/resultados")
                        .header("Authorization", "Bearer " + token).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"puntaje\":%s,\"precision\":%s,\"tiempoEjecucionSeg\":%d,\"completada\":%s}"
                                .formatted(puntaje, precision, tiempo, completada)))
                .andExpect(status().isCreated());
    }

    private ResultActions getSeg(String ruta) throws Exception {
        return mvc.perform(get("/api/seguimiento/perfiles/" + perfil.getId() + ruta).header("Authorization", "Bearer " + token));
    }

    /** 4 asignaciones: 2 completadas (80/90/100s fina, 60/70/50s gruesa), 1 en progreso, 1 pendiente. */
    private void escenario() throws Exception {
        resultado(asignar(TipoActividad.MOTRICIDAD_FINA, "Ensartar cuentas"), 80, 90, 100, true);
        resultado(asignar(TipoActividad.MOTRICIDAD_GRUESA, "Salto de rana"), 60, 70, 50, true);
        resultado(asignar(TipoActividad.MIXTA, "Circuito"), 20, 30, 40, false);
        asignar(TipoActividad.MIXTA, "Pendiente");
    }

    @Test
    @DisplayName("SUB-38.1: solo devuelve actividades completadas")
    void actividadesCompletadas() throws Exception {
        escenario();
        getSeg("/actividades-completadas")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[*].estadoAsignacion", org.hamcrest.Matchers.everyItem(org.hamcrest.Matchers.is("COMPLETADA"))))
                .andExpect(jsonPath("$[*].actividadNombre", org.hamcrest.Matchers.containsInAnyOrder("Ensartar cuentas", "Salto de rana")));
    }

    @Test
    @DisplayName("SUB-38.2: devuelve todos los resultados del perfil, incluido el intento no completado")
    void resultadosDelPerfil() throws Exception {
        escenario();
        getSeg("/resultados")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[?(@.completada == false)].estadoAsignacion").value("EN_PROGRESO"));
    }

    @Test
    @DisplayName("SUB-38.3 a 38.6: progreso con promedios, conteos, nivel y desglose por tipo")
    void progreso() throws Exception {
        escenario();
        getSeg("/progreso")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.perfilNombre").value("Lucia Fernanda"))
                .andExpect(jsonPath("$.totalAsignadas").value(4))
                .andExpect(jsonPath("$.completadas").value(2))
                .andExpect(jsonPath("$.enProgreso").value(1))
                .andExpect(jsonPath("$.pendientes").value(1))
                .andExpect(jsonPath("$.porcentajeAvance").value(50.0))
                .andExpect(jsonPath("$.promedioPuntaje").value(70.0))
                .andExpect(jsonPath("$.promedioPrecision").value(80.0))
                .andExpect(jsonPath("$.tiempoPromedioEjecucionSeg").value(75.0))
                .andExpect(jsonPath("$.nivel").value("EN_DESARROLLO"))
                .andExpect(jsonPath("$.mensaje").value(org.hamcrest.Matchers.startsWith("Lucia")))
                .andExpect(jsonPath("$.ultimaActividad").isNotEmpty())
                .andExpect(jsonPath("$.progresoPorTipo[?(@.tipoActividad == 'MOTRICIDAD_FINA')].promedioPuntaje").value(80.0))
                .andExpect(jsonPath("$.progresoPorTipo[?(@.tipoActividad == 'MIXTA')].completadas").value(0));
    }

    @Test
    @DisplayName("Perfil sin actividades: progreso en cero y promedios null")
    void progresoSinDatos() throws Exception {
        getSeg("/progreso")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAsignadas").value(0))
                .andExpect(jsonPath("$.porcentajeAvance").value(0.0))
                .andExpect(jsonPath("$.promedioPuntaje").doesNotExist())
                .andExpect(jsonPath("$.nivel").value("SIN_DATOS"));
        getSeg("/actividades-completadas").andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("SUB-38.6: generar reporte lo guarda en reporte_progreso y aparece en el historial")
    void generarReporte() throws Exception {
        escenario();
        mvc.perform(post("/api/seguimiento/perfiles/" + perfil.getId() + "/reportes").header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.totalActividadesCompletadas").value(2))
                .andExpect(jsonPath("$.promedioPuntaje").value(70.0))
                .andExpect(jsonPath("$.promedioPrecision").value(80.0))
                .andExpect(jsonPath("$.tiempoPromedioEjecucionSeg").value(75.0))
                .andExpect(jsonPath("$.generadoPor").value("Docente Seguimiento"));

        assertEquals(1, reporteRepository.findByPerfilId(perfil.getId()).size());
        getSeg("/reportes").andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    @DisplayName("Perfil que no esta a cargo del usuario: 404 en todos los endpoints")
    void perfilAjenoDevuelve404() throws Exception {
        String otro = registrar("/api/auth/register/padre", """
                {"nombre":"Otro","correo":"%s","password":"Password123!","parentesco":"PADRE"}
                """.formatted(correoUnico()));
        for (String ruta : new String[]{"/actividades-completadas", "/resultados", "/progreso", "/reportes"}) {
            mvc.perform(get("/api/seguimiento/perfiles/" + perfil.getId() + ruta).header("Authorization", "Bearer " + otro))
                    .andExpect(status().isNotFound());
        }
        mvc.perform(post("/api/seguimiento/perfiles/" + perfil.getId() + "/reportes").header("Authorization", "Bearer " + otro))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Sin token: 401; perfil inexistente: 404")
    void erroresDeAcceso() throws Exception {
        mvc.perform(get("/api/seguimiento/perfiles/" + perfil.getId() + "/progreso")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/seguimiento/perfiles/" + UUID.randomUUID() + "/progreso").header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }
}
