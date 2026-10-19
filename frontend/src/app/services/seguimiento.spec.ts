import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SeguimientoService, formatearTiempo } from './seguimiento';

describe('SeguimientoService', () => {
  let service: SeguimientoService;
  let http: HttpTestingController;
  const base = '/api/seguimiento/perfiles/p1';

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(SeguimientoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('consulta progreso, completadas, resultados y reportes del perfil', () => {
    service.progreso('p1').subscribe();
    service.actividadesCompletadas('p1').subscribe();
    service.resultados('p1').subscribe();
    service.reportes('p1').subscribe();
    http.expectOne(`${base}/progreso`).flush({});
    http.expectOne(`${base}/actividades-completadas`).flush([]);
    http.expectOne(`${base}/resultados`).flush([]);
    http.expectOne({ method: 'GET', url: `${base}/reportes` }).flush([]);
  });

  it('genera un reporte con POST', () => {
    service.generarReporte('p1').subscribe();
    expect(http.expectOne(`${base}/reportes`).request.method).toBe('POST');
  });
});

describe('formatearTiempo', () => {
  it('formatea segundos y minutos', () => {
    expect(formatearTiempo(45)).toBe('45 s');
    expect(formatearTiempo(75.4)).toBe('1 min 15 s');
    expect(formatearTiempo(120)).toBe('2 min 0 s');
  });

  it('muestra un guion si no hay dato', () => {
    expect(formatearTiempo(null)).toBe('—');
    expect(formatearTiempo(undefined)).toBe('—');
  });
});
