import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  return auth.autenticado() ? true : inject(Router).createUrlTree(['/login']);
};

/** Evita mostrar el login a quien ya tiene sesion. */
export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  return auth.autenticado() ? inject(Router).createUrlTree(['/inicio']) : true;
};
