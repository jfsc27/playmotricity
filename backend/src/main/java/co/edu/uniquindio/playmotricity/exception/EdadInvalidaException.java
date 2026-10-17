package co.edu.uniquindio.playmotricity.exception;

public class EdadInvalidaException extends RuntimeException {

    private final Integer edadCalculada;
    private final Integer edadMinima;
    private final Integer edadMaxima;

    public EdadInvalidaException(int edadCalculada, int edadMinima, int edadMaxima) {
        super(String.format(
                "La edad calculada (%d años) no es válida. PlayMotricity está diseñado exclusivamente para niños en el rango de %d a %d años.",
                edadCalculada, edadMinima, edadMaxima
        ));
        this.edadCalculada = edadCalculada;
        this.edadMinima = edadMinima;
        this.edadMaxima = edadMaxima;
    }

    public EdadInvalidaException(String mensaje) {
        super(mensaje);
        this.edadCalculada = null;
        this.edadMinima = null;
        this.edadMaxima = null;
    }

    public Integer getEdadCalculada() {
        return edadCalculada;
    }

    public Integer getEdadMinima() {
        return edadMinima;
    }

    public Integer getEdadMaxima() {
        return edadMaxima;
    }
}
