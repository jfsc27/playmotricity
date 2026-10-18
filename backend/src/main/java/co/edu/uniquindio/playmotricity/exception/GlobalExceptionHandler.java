package co.edu.uniquindio.playmotricity.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.ResponseEntity;
import co.edu.uniquindio.playmotricity.security.AccesoDenegadoHandler;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, String>> credencialesInvalidas(AuthenticationException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("mensaje", "Correo o contrasena incorrectos"));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> accesoDenegado(AccessDeniedException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("mensaje", AccesoDenegadoHandler.MENSAJE));
    }

    @ExceptionHandler(AsignacionNoEncontradaException.class)
    public ResponseEntity<Map<String, String>> asignacionNoEncontrada(AsignacionNoEncontradaException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("mensaje", e.getMessage()));
    }

    @ExceptionHandler(AsignacionAjenaException.class)
    public ResponseEntity<Map<String, String>> asignacionAjena(AsignacionAjenaException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("mensaje", e.getMessage()));
    }

    @ExceptionHandler(ResultadoYaRegistradoException.class)
    public ResponseEntity<Map<String, String>> resultadoYaRegistrado(ResultadoYaRegistradoException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje", e.getMessage()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> integridadDatos(DataIntegrityViolationException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje",
                "No se puede completar la operación porque hay registros relacionados "
                        + "(por ejemplo, un perfil con actividades asignadas)."));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, String>> parametroInvalido(MethodArgumentTypeMismatchException e) {
        return ResponseEntity.badRequest().body(Map.of("mensaje",
                "El parámetro '" + e.getName() + "' tiene un formato inválido: " + e.getValue()));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> cuerpoInvalido(HttpMessageNotReadableException e) {
        return ResponseEntity.badRequest().body(Map.of("mensaje",
                "El cuerpo de la petición no es un JSON válido o tiene tipos de datos incorrectos"));
    }

    @ExceptionHandler(CorreoDuplicadoException.class)
    public ResponseEntity<Map<String, String>> correoDuplicado(CorreoDuplicadoException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("mensaje", e.getMessage()));
    }

    @ExceptionHandler(EdadInvalidaException.class)
    public ResponseEntity<Map<String, Object>> edadInvalida(EdadInvalidaException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "mensaje", e.getMessage(),
                "edadCalculada", e.getEdadCalculada() != null ? e.getEdadCalculada() : 0,
                "edadMinima", PerfilInfantilConsts.EDAD_MINIMA,
                "edadMaxima", PerfilInfantilConsts.EDAD_MAXIMA
        ));
    }

    @ExceptionHandler(PerfilNoEncontradoException.class)
    public ResponseEntity<Map<String, String>> perfilNoEncontrado(PerfilNoEncontradoException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("mensaje", e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> validacion(MethodArgumentNotValidException e) {
        String mensaje = e.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + ": " + f.getDefaultMessage())
                .findFirst().orElse("Datos invalidos");
        return ResponseEntity.badRequest().body(Map.of("mensaje", mensaje));
    }

    private static class PerfilInfantilConsts {
        private static final int EDAD_MINIMA = 2;
        private static final int EDAD_MAXIMA = 6;
    }
}
