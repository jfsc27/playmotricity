package co.edu.uniquindio.playmotricity.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "asignacion_actividad")
public class AsignacionActividad {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "fecha_asignacion", nullable = false)
    private LocalDateTime fechaAsignacion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoAsignacion estado;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_perfil", nullable = false)
    private PerfilInfantil perfil;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_actividad", nullable = false)
    private Actividad actividad;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario_asigna", nullable = false)
    private Usuario usuarioAsigna;

    public AsignacionActividad() {
    }

    public AsignacionActividad(
            PerfilInfantil perfil,
            Actividad actividad,
            Usuario usuarioAsigna
    ) {
        this.perfil = perfil;
        this.actividad = actividad;
        this.usuarioAsigna = usuarioAsigna;
        this.estado = EstadoAsignacion.PENDIENTE;
    }

    @PrePersist
    public void prePersist() {

        if (fechaAsignacion == null) {
            fechaAsignacion = LocalDateTime.now();
        }

        if (estado == null) {
            estado = EstadoAsignacion.PENDIENTE;
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public LocalDateTime getFechaAsignignacion() {
        return fechaAsignacion;
    }

    public LocalDateTime getFechaAsignacion() {
        return fechaAsignacion;
    }

    public void setFechaAsignacion(LocalDateTime fechaAsignacion) {
        this.fechaAsignacion = fechaAsignacion;
    }

    public EstadoAsignacion getEstado() {
        return estado;
    }

    public void setEstado(EstadoAsignacion estado) {
        this.estado = estado;
    }

    public PerfilInfantil getPerfil() {
        return perfil;
    }

    public void setPerfil(PerfilInfantil perfil) {
        this.perfil = perfil;
    }

    public Actividad getActividad() {
        return actividad;
    }

    public void setActividad(Actividad actividad) {
        this.actividad = actividad;
    }

    public Usuario getUsuarioAsigna() {
        return usuarioAsigna;
    }

    public void setUsuarioAsigna(Usuario usuarioAsigna) {
        this.usuarioAsigna = usuarioAsigna;
    }
}