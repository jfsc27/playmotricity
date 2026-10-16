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

