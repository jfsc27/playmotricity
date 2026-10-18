import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, Rol } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  return auth.autenticado() ? true : inject(Router).createUrlTree(['/login']);
};

/** Evita mostrar el login a quien ya tiene sesion. */
export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  return auth.autenticado() ? inject(Router).createUrlTree(['/inicio']) : true;
};

/**
 * Restringe una ruta a los roles indicados en `data: { roles: [...] }`.
 * Usar despues de authGuard: canActivate: [authGuard, rolGuard].
 */
export const rolGuard: CanActivateFn = (route) => {
  const auth = inject(Auth);
  const router = inject(Router);
  if (!auth.autenticado()) {
    return router.createUrlTree(['/login']);
  }
  const roles = (route.data?.['roles'] as Rol[] | undefined) ?? [];
  if (roles.length === 0 || auth.tieneRol(...roles)) {
    return true;
  }
  return router.createUrlTree(['/acceso-denegado']);
};
