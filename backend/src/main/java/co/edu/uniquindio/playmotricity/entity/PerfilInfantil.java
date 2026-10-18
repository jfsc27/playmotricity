package co.edu.uniquindio.playmotricity.entity;

import co.edu.uniquindio.playmotricity.exception.EdadInvalidaException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "perfil_infantil")
public class PerfilInfantil {

    public static final int EDAD_MINIMA = 2;
    public static final int EDAD_MAXIMA = 6;

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nombre;

    @Column(name = "fecha_nacimiento", nullable = false)
    private LocalDate fechaNacimiento;

    @Column(name = "grupo_grado")
    private String grupoGrado;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro;

    @Column(name = "foto_perfil", columnDefinition = "TEXT")
    private String fotoPerfil;

    @ManyToMany(mappedBy = "perfiles")
    private Set<Usuario> usuarios = new HashSet<>();

    public PerfilInfantil() {
    }

    public PerfilInfantil(
            String nombre,
            LocalDate fechaNacimiento,
            String grupoGrado
    ) {
        this.nombre = nombre;
        this.fechaNacimiento = fechaNacimiento;
        this.grupoGrado = grupoGrado;
    }

    @PrePersist
    public void prePersist() {
        if (fechaRegistro == null) {
            fechaRegistro = LocalDateTime.now();
        }
        validarReglaEdad();
    }

    @PreUpdate
    public void preUpdate() {
        validarReglaEdad();
    }

    public int calcularEdad() {
        if (fechaNacimiento == null) {
            return 0;
        }

        return Period.between(
                fechaNacimiento,
                LocalDate.now()
        ).getYears();
    }

    public void validarReglaEdad() {
        if (fechaNacimiento == null) {
            throw new EdadInvalidaException("La fecha de nacimiento es obligatoria para el perfil infantil.");
        }
        if (fechaNacimiento.isAfter(LocalDate.now())) {
            throw new EdadInvalidaException("La fecha de nacimiento no puede ser una fecha futura.");
        }
        int edad = calcularEdad();
        if (edad < EDAD_MINIMA || edad > EDAD_MAXIMA) {
            throw new EdadInvalidaException(edad, EDAD_MINIMA, EDAD_MAXIMA);
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public LocalDate getFechaNacimiento() {
        return fechaNacimiento;
    }

    public void setFechaNacimiento(LocalDate fechaNacimiento) {
        this.fechaNacimiento = fechaNacimiento;
    }

    public String getGrupoGrado() {
        return grupoGrado;
    }

    public void setGrupoGrado(String grupoGrado) {
        this.grupoGrado = grupoGrado;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }

    public Set<Usuario> getUsuarios() {
        return usuarios;
    }

    public void setUsuarios(Set<Usuario> usuarios) {
        this.usuarios = usuarios;
    }

    public String getFotoPerfil() {
        return fotoPerfil;
    }

    public void setFotoPerfil(String fotoPerfil) {
        this.fotoPerfil = fotoPerfil;
    }
}