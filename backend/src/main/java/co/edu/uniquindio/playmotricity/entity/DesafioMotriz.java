package co.edu.uniquindio.playmotricity.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "desafio_motriz")
@PrimaryKeyJoinColumn(name = "id_actividad")
public class DesafioMotriz extends Actividad {

    @Column(name = "tipo_movimiento", nullable = false)
    private String tipoMovimiento;

    @Column(name = "requiere_acompanante", nullable = false)
    private boolean requiereAcompanante;

    public DesafioMotriz() {
    }

    public DesafioMotriz(
            String nombre,
            String descripcion,
            TipoActividad tipoActividad,
            int edadMinima,
            int edadMaxima,
            String instrucciones,
            String tipoMovimiento,
            boolean requiereAcompanante
    ) {
        super(
                nombre,
                descripcion,
                tipoActividad,
                edadMinima,
                edadMaxima,
                instrucciones
        );

        this.tipoMovimiento = tipoMovimiento;
        this.requiereAcompanante = requiereAcompanante;
    }

    public String getTipoMovimiento() {
        return tipoMovimiento;
    }

    public void setTipoMovimiento(String tipoMovimiento) {
        this.tipoMovimiento = tipoMovimiento;
    }

    public boolean isRequiereAcompanante() {
        return requiereAcompanante;
    }

    public void setRequiereAcompanante(boolean requiereAcompanante) {
        this.requiereAcompanante = requiereAcompanante;
    }
}