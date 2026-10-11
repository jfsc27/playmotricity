package co.edu.uniquindio.playmotricity.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reporte_progreso")
public class ReporteProgreso {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "fecha_generacion", nullable = false)
    private LocalDateTime fechaGeneracion;

    @Column(name = "total_actividades_completadas", nullable = false)
    private int totalActividadesCompletadas;

    @Column(name = "promedio_puntaje", nullable = false)
    private float promedioPuntaje;

    @Column(name = "promedio_precision", nullable = false)
    private float promedioPrecision;

    @Column(name = "tiempo_promedio_ejecucion_seg", nullable = false)
    private float tiempoPromedioEjecucionSeg;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_perfil", nullable = false)
    private PerfilInfantil perfil;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario_genera", nullable = false)
    private Usuario usuarioGenera;

    public ReporteProgreso() {
    }

    public ReporteProgreso(
            PerfilInfantil perfil,
            Usuario usuarioGenera,
            int totalActividadesCompletadas,
            float promedioPuntaje,
            float promedioPrecision,
            float tiempoPromedioEjecucionSeg
    ) {
        this.perfil = perfil;
        this.usuarioGenera = usuarioGenera;
        this.totalActividadesCompletadas = totalActividadesCompletadas;
        this.promedioPuntaje = promedioPuntaje;
        this.promedioPrecision = promedioPrecision;
        this.tiempoPromedioEjecucionSeg = tiempoPromedioEjecucionSeg;
    }

    @PrePersist
    public void prePersist() {
        if (fechaGeneracion == null) {
            fechaGeneracion = LocalDateTime.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public LocalDateTime getFechaGeneracion() {
        return fechaGeneracion;
    }

    public void setFechaGeneracion(LocalDateTime fechaGeneracion) {
        this.fechaGeneracion = fechaGeneracion;
    }

    public int getTotalActividadesCompletadas() {
        return totalActividadesCompletadas;
    }

    public void setTotalActividadesCompletadas(int totalActividadesCompletadas) {
        this.totalActividadesCompletadas = totalActividadesCompletadas;
    }

    public float getPromedioPuntaje() {
        return promedioPuntaje;
    }

    public void setPromedioPuntaje(float promedioPuntaje) {
        this.promedioPuntaje = promedioPuntaje;
    }

    public float getPromedioPrecision() {
        return promedioPrecision;
    }

    public void setPromedioPrecision(float promedioPrecision) {
        this.promedioPrecision = promedioPrecision;
    }

    public float getTiempoPromedioEjecucionSeg() {
        return tiempoPromedioEjecucionSeg;
    }

    public void setTiempoPromedioEjecucionSeg(float tiempoPromedioEjecucionSeg) {
        this.tiempoPromedioEjecucionSeg = tiempoPromedioEjecucionSeg;
    }

    public PerfilInfantil getPerfil() {
        return perfil;
    }

    public void setPerfil(PerfilInfantil perfil) {
        this.perfil = perfil;
    }

    public Usuario getUsuarioGenera() {
        return usuarioGenera;
    }

    public void setUsuarioGenera(Usuario usuarioGenera) {
        this.usuarioGenera = usuarioGenera;
    }
}