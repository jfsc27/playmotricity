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

### Validar con Postman

En la carpeta `postman/`:
1. Ejecuta `datos-prueba-resultados.sql` en la base de datos (crea un niño, un minijuego y una asignación de prueba para `docente@playmotricity.com`; se puede repetir para reiniciar la prueba).
2. En Postman importa `PlayMotricity-Resultados.postman_collection.json` y `PlayMotricity-Local.postman_environment.json`, selecciona el entorno **PlayMotricity Local**.
3. Con el backend en marcha, ejecuta la colección completa en orden (*Run collection*).
