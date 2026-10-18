-- Datos de prueba para validar la regla de resultados (SUB-32.6) con Postman.
-- Crea (si no existen) un perfil infantil a cargo de docente@playmotricity.com,
-- un minijuego y una asignacion con IDs fijos que usa la coleccion de Postman.
-- Se puede ejecutar varias veces: deja la asignacion otra vez en PENDIENTE y borra su resultado.
-- Requisito: debe existir la cuenta docente@playmotricity.com (ver README).

BEGIN;

INSERT INTO perfil_infantil (id, nombre, fecha_nacimiento, grupo_grado, fecha_registro)
VALUES ('11111111-1111-1111-1111-111111111111', 'Niño Prueba Postman',
        (current_date - interval '4 years')::date, 'Transición A', now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO usuario_perfil (id_usuario, id_perfil)
SELECT u.id, '11111111-1111-1111-1111-111111111111'
FROM usuario u
WHERE u.correo = 'docente@playmotricity.com'
  AND NOT EXISTS (SELECT 1 FROM usuario_perfil up
                  WHERE up.id_usuario = u.id
                    AND up.id_perfil = '11111111-1111-1111-1111-111111111111');

INSERT INTO actividad (id, nombre, descripcion, tipo_actividad, edad_minima, edad_maxima, instrucciones)
VALUES ('22222222-2222-2222-2222-222222222222', 'Salta la cuerda (prueba)',
        'Minijuego de prueba para validar el registro de resultados', 'MOTRICIDAD_GRUESA', 3, 6,
        'Salta 10 veces siguiendo el ritmo')
ON CONFLICT (id) DO NOTHING;

INSERT INTO minijuego (id_actividad, formato_interaccion, duracion_estimada_seg)
VALUES ('22222222-2222-2222-2222-222222222222', 'TACTIL', 180)
ON CONFLICT (id_actividad) DO NOTHING;

DELETE FROM resultado_actividad WHERE id_asignacion = '33333333-3333-3333-3333-333333333333';

INSERT INTO asignacion_actividad (id, estado, fecha_asignacion, id_actividad, id_perfil, id_usuario_asigna)
SELECT '33333333-3333-3333-3333-333333333333', 'PENDIENTE', now(),
       '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', u.id
FROM usuario u
WHERE u.correo = 'docente@playmotricity.com'
ON CONFLICT (id) DO UPDATE SET estado = 'PENDIENTE';

COMMIT;
