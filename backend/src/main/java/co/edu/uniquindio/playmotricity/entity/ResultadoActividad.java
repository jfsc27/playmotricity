package co.edu.uniquindio.playmotricity.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "resultado_actividad")
public class ResultadoActividad {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "id_asignacion",
            nullable = false,
            unique = true
    )
    private AsignacionActividad asignacion;

    @Column(nullable = false)
    private float puntaje;

    @Column(nullable = false)
    private float precision;

    @Column(name = "tiempo_ejecucion_seg", nullable = false)
    private int tiempoEjecucionSeg;

    @Column(name = "fecha_realizacion", nullable = false)
    private LocalDateTime fechaRealizacion;

    @Column(nullable = false)
    private boolean completada;

    public ResultadoActividad() {
    }

    public ResultadoActividad(
            AsignacionActividad asignacion,
            float puntaje,
            float precision,
            int tiempoEjecucionSeg,
            boolean completada
    ) {
        this.asignacion = asignacion;
        this.puntaje = puntaje;
        this.precision = precision;
        this.tiempoEjecucionSeg = tiempoEjecucionSeg;
        this.completada = completada;
    }

    @PrePersist
    public void prePersist() {
        if (fechaRealizacion == null) {
            fechaRealizacion = LocalDateTime.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public AsignacionActividad getAsignacion() {
        return asignacion;
    }

    public void setAsignacion(AsignacionActividad asignacion) {
        this.asignacion = asignacion;
    }

    public float getPuntaje() {
        return puntaje;
    }

    public void setPuntaje(float puntaje) {
        this.puntaje = puntaje;
    }

    public float getPrecision() {
        return precision;
    }

    public void setPrecision(float precision) {
        this.precision = precision;
    }

    public int getTiempoEjecucionSeg() {
        return tiempoEjecucionSeg;
    }

    public void setTiempoEjecucionSeg(int tiempoEjecucionSeg) {
        this.tiempoEjecucionSeg = tiempoEjecucionSeg;
    }

    public LocalDateTime getFechaRealizacion() {
        return fechaRealizacion;
    }

    public void setFechaRealizacion(LocalDateTime fechaRealizacion) {
        this.fechaRealizacion = fechaRealizacion;
    }

    public boolean isCompletada() {
        return completada;
    }

    public void setCompletada(boolean completada) {
        this.completada = completada;
    }
}