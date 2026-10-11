package co.edu.uniquindio.playmotricity.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

@Entity
@Table(name = "minijuego")
@PrimaryKeyJoinColumn(name = "id_actividad")
public class Minijuego extends Actividad {

    @Column(name = "formato_interaccion", nullable = false)
    private String formatoInteraccion;

    @Column(name = "duracion_estimada_seg", nullable = false)
    private int duracionEstimadaSeg;

    public Minijuego() {
    }

    public Minijuego(
            String nombre,
            String descripcion,
            TipoActividad tipoActividad,
            int edadMinima,
            int edadMaxima,
            String instrucciones,
            String formatoInteraccion,
            int duracionEstimadaSeg
    ) {
        super(
                nombre,
                descripcion,
                tipoActividad,
                edadMinima,
                edadMaxima,
                instrucciones
        );

        this.formatoInteraccion = formatoInteraccion;
        this.duracionEstimadaSeg = duracionEstimadaSeg;
    }

    public String getFormatoInteraccion() {
        return formatoInteraccion;
    }

    public void setFormatoInteraccion(String formatoInteraccion) {
        this.formatoInteraccion = formatoInteraccion;
    }

    public int getDuracionEstimadaSeg() {
        return duracionEstimadaSeg;
    }

    public void setDuracionEstimadaSeg(int duracionEstimadaSeg) {
        this.duracionEstimadaSeg = duracionEstimadaSeg;
    }
}