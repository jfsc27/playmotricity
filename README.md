# playmotricity
Proyecto PlayMotricity - Ingeniería de Software III

## Variables de entorno del backend

`DB_URL`, `DB_USERNAME`, `DB_PASSWORD` (Postgres/Neon).
Opcionales: `JWT_SECRET` (mínimo 32 caracteres; trae un valor solo para desarrollo, cambiarlo en producción), `JWT_EXPIRATION_MS` (por defecto 3600000) y `CORS_ALLOWED_ORIGINS` (por defecto `http://localhost:4200`).

## Autenticación

- `POST /api/auth/register/docente` · `POST /api/auth/register/padre`
- `POST /api/auth/login` → devuelve un JWT; enviarlo como `Authorization: Bearer <token>`
- `GET /api/auth/me` (protegido). Todo `/api/**` exige token salvo `/api/health` y `/api/auth/login|register`.

## Cuentas de prueba (Datos de demostración en Neon DB)

Para pruebas funcionales y evaluación de la interfaz y autenticación, se encuentran precargadas en la base de datos de Neon las siguientes cuentas:

| Rol | Correo | Contraseña | Nombre / Detalle |
| :--- | :--- | :--- | :--- |
| **Docente** | `docente@playmotricity.com` | `Password123!` | Prof. Laura Gómez (*Jardín Infantil Pequeños Sabios - Transición A*) |
| **Padre / Acudiente** | `padre@playmotricity.com` | `Password123!` | Carlos Mendoza (*Parentesco: PADRE*) |

> **Nota:** La pantalla de inicio de sesión (`/login`) cuenta con botones de **acceso rápido con 1 clic** para autocompletar estas credenciales de forma inmediata, así como un enlace directo hacia la pantalla de registro (`/registro`) para crear nuevas cuentas con cualquiera de los dos roles (`Docente` o `Padre/Acudiente`).

## Gestión de Perfiles Infantiles (`/api/perfiles`)

Permite a los usuarios autenticados (docentes y padres) gestionar los perfiles de los niños a su cargo, vinculando la sesión JWT activa con los registros creados.

### Regla de Dominio: Validación de Edad
- **Rango permitido:** Entre **2 y 6 años cumplidos** al momento del registro o actualización.
- **Cálculo:** Se calcula con base en `fechaNacimiento` respecto a la fecha actual (`Period.between(fechaNacimiento, LocalDate.now()).getYears()`).
- **Excepción de dominio:** `EdadInvalidaException` (HTTP 400 Bad Request) si el infante tiene menos de 2 años (etapa de lactancia/primeros pasos no contemplada por la plataforma) o más de 6 años (etapa escolar primaria superior).
- **Validación en entidad:** `@PrePersist` y `@PreUpdate` en [PerfilInfantil.java](file:///c:/PLAYMOTRICY%20-%20Proyecto%20Final%20Software%203/playmotricity/backend/src/main/java/co/edu/uniquindio/playmotricity/entity/PerfilInfantil.java) para garantizar consistencia incluso ante accesos directos.

### Endpoints Protegidos (`Authorization: Bearer <token>`)

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/perfiles` | Registra un nuevo perfil infantil asociado al usuario en sesión. |
| `GET` | `/api/perfiles` | Lista todos los perfiles asociados al usuario autenticado. |
| `GET` | `/api/perfiles/{id}` | Obtiene los detalles de un perfil por su UUID. |
| `PUT` | `/api/perfiles/{id}` | Actualiza nombre, fecha de nacimiento, diagnóstico o notas. |
| `DELETE` | `/api/perfiles/{id}` | Desvincula o elimina el perfil del usuario. |

### Frontend (`/perfiles` y `/inicio`)
- **Dashboard (`/inicio`):** La tarjeta de KPI de infantes refleja la cantidad en tiempo real desde la BD Neon y cuenta con acceso directo a la gestión.
- **Módulo de Perfiles (`/perfiles`):**
  - Métricas de edad promedio y distribución.
  - Buscador reactivo por nombre y filtro por rangos de edad (2-3 años, 4-5 años, 6 años).
  - Modal de registro y edición con **cálculo reactivo de edad en vivo**, avatar dinámico con iniciales y retroalimentación pedagógica basada en la etapa motriz del niño.
  - Confirmación accesible para eliminación.



## Autorización por rol

Roles: `DOCENTE` y `PADRE` (enum `Rol` en el backend, tipo `Rol` en `services/auth.ts`).

| Ruta del backend | Quién puede acceder |
| :--- | :--- |
| `/api/health`, `/api/auth/login`, `/api/auth/register/**` | Público |
| `/api/docente/**` (ej. `GET /api/docente/resumen`) | Solo `DOCENTE` |
| `/api/padre/**` (ej. `GET /api/padre/resumen`) | Solo `PADRE` |
| `/api/perfiles/**` | `DOCENTE` y `PADRE` |
| Cualquier otra ruta `/api/**` | Cualquier usuario autenticado |

Sin token → `401`. Con token pero sin el rol necesario → `403` con `{"mensaje": "No tienes permisos para acceder a este recurso"}`.

Para un endpoint nuevo exclusivo de un rol, ponlo bajo `/api/docente/...` o `/api/padre/...` (o usa `@PreAuthorize("hasRole('DOCENTE')")`).
En Angular, protege la ruta con `canActivate: [authGuard, rolGuard]` y `data: { roles: ['DOCENTE'] }`; si el rol no coincide se redirige a `/acceso-denegado`.

## Regla de resultados (`/api/asignaciones`)

Accesible para `DOCENTE` y `PADRE`, solo sobre asignaciones de niños a su cargo.

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/asignaciones/{id}` | Consulta la asignación, su estado y su resultado (si existe). |
| `POST` | `/api/asignaciones/{id}/resultados` | Registra el resultado de la actividad y actualiza el estado. |

Cuerpo del `POST`: `{"puntaje": 85.5, "precision": 90, "tiempoEjecucionSeg": 120, "completada": true}`
(`puntaje` y `precision` de 0 a 100, `tiempoEjecucionSeg` de 1 a 7200).

Reglas:
1. La asignación debe existir (`404`) y su perfil infantil debe estar a cargo del usuario (`403`).
2. Si la asignación ya está `COMPLETADA`, se rechaza con `409`.
3. Se guarda un único `ResultadoActividad` por asignación; un intento no completado se reemplaza con el siguiente.
4. El estado pasa a `COMPLETADA` si `completada` es `true`, o a `EN_PROGRESO` si es `false`.
5. Datos inválidos, JSON mal formado o ID inválido → `400` con `{"mensaje": "..."}`.

### Colección Postman Completa (`postman/`)

Se incluye la colección actualizada y exportada con la totalidad de los módulos del backend de PlayMotricity:
1. `PlayMotricity-Local.postman_environment.json`: Entorno con variable `baseUrl` (`http://localhost:8080/api`), tokens dinámicos (`tokenDocente`, `tokenPadre`) y variables de prueba (`perfilId`, `actividadId`, `asignacionId`, `resultadoId`).
2. `PlayMotricity-Resultados.postman_collection.json`: Colección completa organizada en carpetas estructuradas:
   - **0. Autenticación y Seguridad:** Login docente y padre (extracción automática de JWT a variables de entorno) y consulta de perfil/resumen (`/api/docente/resumen`, `/api/padre/resumen`).
   - **1. Módulo Perfiles Infantiles:** Creación de perfiles, listado, consulta por ID y validación de regla de edad (2 a 6 años, pruebas de error 400).
   - **2. Módulo Actividades:** Listado completo, filtrado por edad (`?edad=3`), filtrado por tipo (`?tipo=MOTRICIDAD_FINA`) y detalle por UUID.
   - **3. Módulo Asignaciones:** Asignación de actividad a niño, listado de asignaciones por perfil infantil y consulta de estado de asignación.
   - **4. Módulo Registro de Resultados:** Registro de intento en progreso (`completada: false` → `EN_PROGRESO`), intento completado (`completada: true` → `COMPLETADA`) y persistencia del resultado en Neon DB.
   - **5. Manejo de Errores y Validaciones:** Casos documentados de `409 Conflict` (actividad ya completada), `404 Not Found` (recurso inexistente), `403 Forbidden` (acceso a niño ajeno), `400 Bad Request` (puntaje > 100 o tiempo 0) y `401 Unauthorized` (sin token).

Para ejecutar:
1. Importa en Postman ambos archivos ubicados en `playmotricity/postman/`.
2. Selecciona el entorno **PlayMotricity Local**.
3. Ejecuta la colección completa con el runner de Postman (*Run collection*). Todas las pruebas y aserciones se validarán de forma automatizada.

## Seguimiento y reportes (`/api/seguimiento`)

Accesible para `DOCENTE` y `PADRE`, solo sobre perfiles infantiles a su cargo (si no, `404`).

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/seguimiento/perfiles/{id}/actividades-completadas` | Actividades completadas con su resultado. |
| `GET` | `/api/seguimiento/perfiles/{id}/resultados` | Todos los resultados del perfil (incluye intentos no completados). |
| `GET` | `/api/seguimiento/perfiles/{id}/progreso` | Progreso calculado: conteos por estado, % de avance, promedios de puntaje, precisión y tiempo, nivel y desglose por tipo de actividad. |
| `POST` | `/api/seguimiento/perfiles/{id}/reportes` | Genera y guarda un `ReporteProgreso` con el progreso actual. |
| `GET` | `/api/seguimiento/perfiles/{id}/reportes` | Historial de reportes generados. |

- Los promedios se calculan **solo con actividades completadas**, redondeados a 2 decimales; si no hay ninguna, valen `null`.
- Nivel según el promedio de puntaje: `SIN_DATOS`, `INICIAL` (< 60), `EN_DESARROLLO` (< 80) o `AVANZADO` (≥ 80).
- En el frontend, la pantalla `/progreso` se abre desde **Reportes** (docente) o **Progreso** (padre) en el menú del panel.
