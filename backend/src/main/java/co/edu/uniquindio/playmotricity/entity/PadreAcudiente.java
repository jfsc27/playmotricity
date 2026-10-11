package co.edu.uniquindio.playmotricity.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "padre_acudiente")
@PrimaryKeyJoinColumn(name = "id_usuario")
public class PadreAcudiente extends Usuario {

    @Column(nullable = false)
    private String parentesco;

    @Column(name = "telefono_contacto")
    private String telefonoContacto;

    public PadreAcudiente() {
    }

    public PadreAcudiente(
            String nombre,
            String correo,
            String passwordHash,
            String parentesco,
            String telefonoContacto
    ) {
        super(nombre, correo, passwordHash);
        this.parentesco = parentesco;
        this.telefonoContacto = telefonoContacto;
    }

    public String getParentesco() {
        return parentesco;
    }

    public void setParentesco(String parentesco) {
        this.parentesco = parentesco;
    }

    public String getTelefonoContacto() {
        return telefonoContacto;
    }

    public void setTelefonoContacto(String telefonoContacto) {
        this.telefonoContacto = telefonoContacto;
    }
}