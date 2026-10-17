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


