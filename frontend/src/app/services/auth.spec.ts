import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Auth } from './auth';

describe('Auth', () => {
  let auth: Auth;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    auth = TestBed.inject(Auth);
    http = TestBed.inject(HttpTestingController);
  });

  it('guarda la sesion tras un login exitoso', () => {
    auth.login('ana@x.com', 'clave12345').subscribe();
    http.expectOne('http://localhost:8080/api/auth/login').flush({
      token: 'tok', tipo: 'Bearer', expiraEnMs: 1000,
      usuario: { id: '1', nombre: 'Ana', correo: 'ana@x.com', rol: 'DOCENTE' },
    });
    expect(auth.autenticado()).toBe(true);
    expect(auth.token).toBe('tok');
    expect(auth.usuario()?.nombre).toBe('Ana');
  });

  it('limpia la sesion al hacer logout', () => {
    auth.login('ana@x.com', 'x').subscribe();
    http.expectOne('http://localhost:8080/api/auth/login').flush({
      token: 'tok', tipo: 'Bearer', expiraEnMs: 1000,
      usuario: { id: '1', nombre: 'Ana', correo: 'ana@x.com', rol: 'DOCENTE' },
    });
    auth.logout();
    expect(auth.autenticado()).toBe(false);
    expect(localStorage.getItem('playmotricity_token')).toBeNull();
  });
});
