# playmotricity
Proyecto PlayMotricity - Ingeniería de Software III

## Variables de entorno del backend

`DB_URL`, `DB_USERNAME`, `DB_PASSWORD` (Postgres/Neon).
Opcionales: `JWT_SECRET` (mínimo 32 caracteres; trae un valor solo para desarrollo, cambiarlo en producción), `JWT_EXPIRATION_MS` (por defecto 3600000) y `CORS_ALLOWED_ORIGINS` (por defecto `http://localhost:4200`).

## Autenticación

- `POST /api/auth/register/docente` · `POST /api/auth/register/padre`
- `POST /api/auth/login` → devuelve un JWT; enviarlo como `Authorization: Bearer <token>`
- `GET /api/auth/me` (protegido). Todo `/api/**` exige token salvo `/api/health` y `/api/auth/login|register`.
