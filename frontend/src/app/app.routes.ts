import { Routes } from '@angular/router';
import { authGuard, invitadoGuard, rolGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./pages/registro/registro').then((m) => m.Registro),
  },
  {
    path: 'inicio',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/inicio/inicio').then((m) => m.Inicio),
  },
  {
    path: 'perfiles',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['DOCENTE', 'PADRE'] },
    loadComponent: () => import('./pages/perfiles/perfiles').then((m) => m.Perfiles),
  },
  {
    path: 'progreso',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['DOCENTE', 'PADRE'] },
    loadComponent: () => import('./pages/progreso/progreso').then((m) => m.Progreso),
  },
  {
    path: 'acceso-denegado',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/acceso-denegado/acceso-denegado').then((m) => m.AccesoDenegado),
  },
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  { path: '**', redirectTo: 'inicio' },
];
