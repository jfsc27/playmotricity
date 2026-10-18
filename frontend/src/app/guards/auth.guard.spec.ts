import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { Rol } from '../services/auth';
import { rolGuard } from './auth.guard';

function sesion(rol: Rol | null): void {
  localStorage.clear();
  if (rol) {
    localStorage.setItem('playmotricity_token', 'tok');
    localStorage.setItem(
      'playmotricity_usuario',
      JSON.stringify({ id: '1', nombre: 'Test', correo: 't@x.com', rol })
    );
  }
}

function ejecutar(roles: Rol[]): boolean | UrlTree {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideRouter([])] });
  const route = { data: { roles } } as unknown as ActivatedRouteSnapshot;
  return TestBed.runInInjectionContext(() =>
    rolGuard(route, {} as RouterStateSnapshot)
  ) as boolean | UrlTree;
}

function url(resultado: boolean | UrlTree): string {
  return TestBed.inject(Router).serializeUrl(resultado as UrlTree);
}

describe('rolGuard', () => {
  afterEach(() => localStorage.clear());

  it('permite el acceso cuando el rol esta en la lista', () => {
    sesion('DOCENTE');
    expect(ejecutar(['DOCENTE'])).toBe(true);
  });

  it('permite rutas compartidas por ambos roles', () => {
    sesion('PADRE');
    expect(ejecutar(['DOCENTE', 'PADRE'])).toBe(true);
  });

  it('rechaza a un padre en una ruta de docente y lo envia a /acceso-denegado', () => {
    sesion('PADRE');
    expect(url(ejecutar(['DOCENTE']))).toBe('/acceso-denegado');
  });

  it('rechaza a un docente en una ruta de padre', () => {
    sesion('DOCENTE');
    expect(url(ejecutar(['PADRE']))).toBe('/acceso-denegado');
  });

  it('sin sesion envia a /login', () => {
    sesion(null);
    expect(url(ejecutar(['DOCENTE']))).toBe('/login');
  });
});
