package co.edu.uniquindio.playmotricity.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "docente")
@PrimaryKeyJoinColumn(name = "id_usuario")
public class Docente extends Usuario {

    @Column(nullable = false)
    private String institucion;

    @Column(name = "grupo_asignado")
    private String grupoAsignado;

    public Docente() {
    }

    public Docente(
            String nombre,
            String correo,
            String passwordHash,
            String institucion,
            String grupoAsignado
    ) {
        super(nombre, correo, passwordHash);
        this.institucion = institucion;
        this.grupoAsignado = grupoAsignado;
    }

    public String getInstitucion() {
        return institucion;
    }

    public void setInstitucion(String institucion) {
        this.institucion = institucion;
    }

    public String getGrupoAsignado() {
        return grupoAsignado;
    }

    public void setGrupoAsignado(String grupoAsignado) {
        this.grupoAsignado = grupoAsignado;
    }
}