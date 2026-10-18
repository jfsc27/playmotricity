import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type TipoActividad = 'MOTRICIDAD_FINA' | 'MOTRICIDAD_GRUESA' | 'MIXTA';
export type EstadoAsignacion = 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA';
export type NivelProgreso = 'SIN_DATOS' | 'INICIAL' | 'EN_DESARROLLO' | 'AVANZADO';

export interface ResultadoDetalle {
  resultadoId: string;
  asignacionId: string;
  actividadId: string;
  actividadNombre: string;
  tipoActividad: TipoActividad;
  estadoAsignacion: EstadoAsignacion;
  completada: boolean;
  puntaje: number;
  precision: number;
  tiempoEjecucionSeg: number;
  fechaAsignacion: string;
  fechaRealizacion: string;
}

export interface ProgresoTipo {
  tipoActividad: TipoActividad;
  completadas: number;
  promedioPuntaje: number | null;
}

export interface ProgresoPerfil {
  perfilId: string;
  perfilNombre: string;
  edad: number;
  totalAsignadas: number;
  completadas: number;
  enProgreso: number;
  pendientes: number;
  porcentajeAvance: number;
  promedioPuntaje: number | null;
  promedioPrecision: number | null;
  tiempoPromedioEjecucionSeg: number | null;
  nivel: NivelProgreso;
  mensaje: string;
  ultimaActividad: string | null;
  progresoPorTipo: ProgresoTipo[];
}

export interface ReporteProgreso {
  id: string;
  perfilId: string;
  perfilNombre: string;
  fechaGeneracion: string;
  totalActividadesCompletadas: number;
  promedioPuntaje: number;
  promedioPrecision: number;
  tiempoPromedioEjecucionSeg: number;
  generadoPor: string;
}

/** Seguimiento y reportes de un perfil infantil (HU Seguimiento y reportes). */
@Injectable({
  providedIn: 'root',
})
export class SeguimientoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/seguimiento/perfiles';

  actividadesCompletadas(perfilId: string): Observable<ResultadoDetalle[]> {
    return this.http.get<ResultadoDetalle[]>(`${this.apiUrl}/${perfilId}/actividades-completadas`);
  }

  resultados(perfilId: string): Observable<ResultadoDetalle[]> {
    return this.http.get<ResultadoDetalle[]>(`${this.apiUrl}/${perfilId}/resultados`);
  }

  progreso(perfilId: string): Observable<ProgresoPerfil> {
    return this.http.get<ProgresoPerfil>(`${this.apiUrl}/${perfilId}/progreso`);
  }

  reportes(perfilId: string): Observable<ReporteProgreso[]> {
    return this.http.get<ReporteProgreso[]>(`${this.apiUrl}/${perfilId}/reportes`);
  }

  generarReporte(perfilId: string): Observable<ReporteProgreso> {
    return this.http.post<ReporteProgreso>(`${this.apiUrl}/${perfilId}/reportes`, {});
  }
}

/** Formatea segundos como "1 min 15 s" o "45 s". */
export function formatearTiempo(seg: number | null | undefined): string {
  if (seg === null || seg === undefined) return '—';
  const total = Math.round(seg);
  const min = Math.floor(total / 60);
  const s = total % 60;
  return min > 0 ? `${min} min ${s} s` : `${s} s`;
}
