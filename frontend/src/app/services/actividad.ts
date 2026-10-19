import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type TipoActividad = 'MOTRICIDAD_FINA' | 'MOTRICIDAD_GRUESA' | 'MIXTA';
export type EstadoAsignacion = 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA';

export interface Actividad {
  id: string;
  nombre: string;
  descripcion: string;
  tipoActividad: TipoActividad;
  edadMinima: number;
  edadMaxima: number;
  instrucciones: string;
  subtipo: 'MINIJUEGO' | 'DESAFIO_MOTRIZ';
  formatoInteraccion?: string;
  duracionEstimadaSeg?: number;
  tipoMovimiento?: string;
  requiereAcompanante?: boolean;
}

export interface AsignarActividadDTO {
  perfilId: string;
  actividadId: string;
}

export interface Asignacion {
  id: string;
  estado: EstadoAsignacion;
  fechaAsignacion: string;
  perfilId: string;
  perfilNombre: string;
  actividadId: string;
  actividadNombre: string;
  tipoActividad: TipoActividad;
  subtipo: string;
  formatoInteraccion?: string;
  duracionEstimadaSeg?: number;
  instrucciones: string;
  tipoMovimiento?: string;
  requiereAcompanante?: boolean;
}

export interface RegistrarResultadoDTO {
  puntaje: number;
  precision: number;
  tiempoEjecucionSeg: number;
  completada: boolean;
}

export interface ResultadoActividadResponse {
  id: string;
  asignacionId: string;
  puntaje: number;
  precision: number;
  tiempoEjecucionSeg: number;
  completada: boolean;
  fechaRealizacion: string;
  estadoAsignacion: EstadoAsignacion;
}

@Injectable({
  providedIn: 'root',
})
export class ActividadService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/actividades';
  private readonly asignacionesUrl = '/api/asignaciones';

  /** Lista actividades disponibles, con filtros opcionales de edad y tipo */
  listarActividades(edad?: number, tipo?: TipoActividad): Observable<Actividad[]> {
    let params = new HttpParams();
    if (edad !== undefined && edad !== null) {
      params = params.set('edad', edad.toString());
    }
    if (tipo) {
      params = params.set('tipo', tipo);
    }
    return this.http.get<Actividad[]>(this.apiUrl, { params });
  }

  /** Obtiene detalle de una actividad por su ID */
  obtenerActividad(id: string): Observable<Actividad> {
    return this.http.get<Actividad>(`${this.apiUrl}/${id}`);
  }

  /** Asigna una actividad a un perfil infantil */
  asignarActividad(perfilId: string, actividadId: string): Observable<Asignacion> {
    return this.http.post<Asignacion>(`${this.apiUrl}/asignar`, {
      perfilId,
      actividadId,
    });
  }

  /** Lista las asignaciones de un perfil infantil */
  listarAsignaciones(perfilId: string, estado?: EstadoAsignacion): Observable<Asignacion[]> {
    let params = new HttpParams();
    if (estado) {
      params = params.set('estado', estado);
    }
    return this.http.get<Asignacion[]>(`${this.apiUrl}/asignaciones/${perfilId}`, { params });
  }

  /** Registra el resultado de una asignación completada */
  registrarResultado(asignacionId: string, resultado: RegistrarResultadoDTO): Observable<ResultadoActividadResponse> {
    return this.http.post<ResultadoActividadResponse>(
      `${this.asignacionesUrl}/${asignacionId}/resultados`,
      resultado
    );
  }

  /** Emite sonido de éxito o error lúdico usando Web Audio API */
  reproducirEfectoSonoro(tipo: 'exito' | 'error' | 'campana' | 'victoria' | 'pop'): void {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (tipo === 'exito') {
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (tipo === 'victoria') {
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.12);
        osc.frequency.setValueAtTime(783.99, now + 0.24);
        osc.frequency.setValueAtTime(1046.50, now + 0.36); // C6
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (tipo === 'campana' || tipo === 'pop') {
        osc.frequency.setValueAtTime(tipo === 'pop' ? 600 : 880, now);
        if (tipo === 'pop') {
          osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);
        }
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(140, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch {
      // AudioContext no soportado o bloqueado por navegador
    }
  }

  /** Reproduce narración o instrucción por voz */
  reproducirInstruccionVoz(texto: string): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'es-ES';
      utterance.rate = 0.95;
      utterance.pitch = 1.1; // Tono más cálido y amigable para niños
      window.speechSynthesis.speak(utterance);
    }
  }

  /** Devuelve un emoji representativo del tipo de motricidad */
  iconoTipo(tipo: TipoActividad): string {
    switch (tipo) {
      case 'MOTRICIDAD_FINA':
        return '✂️';
      case 'MOTRICIDAD_GRUESA':
        return '🏃';
      case 'MIXTA':
        return '⭐';
      default:
        return '🎯';
    }
  }

  /** Etiqueta en español legible */
  etiquetaTipo(tipo: TipoActividad): string {
    switch (tipo) {
      case 'MOTRICIDAD_FINA':
        return 'Motricidad fina';
      case 'MOTRICIDAD_GRUESA':
        return 'Motricidad gruesa';
      case 'MIXTA':
        return 'Mixta / Coordinación';
      default:
        return 'General';
    }
  }

  /** Color token CSS representativo */
  colorTipo(tipo: TipoActividad): 'green' | 'orange' | 'purple' {
    switch (tipo) {
      case 'MOTRICIDAD_FINA':
        return 'green';
      case 'MOTRICIDAD_GRUESA':
        return 'orange';
      case 'MIXTA':
        return 'purple';
      default:
        return 'orange';
    }
  }

  /** Emoji visual dinámico para cada actividad según su formato o movimiento */
  iconoActividad(actividad: Actividad): string {
    if (actividad.subtipo === 'DESAFIO_MOTRIZ') {
      const mov = actividad.tipoMovimiento?.toUpperCase() ?? '';
      if (mov.includes('SALTO')) return '🦘';
      if (mov.includes('EQUILIBRIO')) return '🦩';
      if (mov.includes('CARRERA')) return '🏃';
      if (mov.includes('LANZAMIENTO')) return '🎾';
      return '🤸';
    }

    const nom = (actividad.nombre ?? '').toUpperCase();
    if (nom.includes('SECUENCIA')) return '🥇';
    if (nom.includes('REACCION') || nom.includes('PANEL')) return '⚡';
    if (nom.includes('MONSTRUO')) return '👾';
    if (nom.includes('PUNTOS')) return '🔢';

    const formato = actividad.formatoInteraccion?.toUpperCase() ?? '';
    if (formato.includes('DRAG_DROP_MULTIPLE')) return '🧩';
    if (formato.includes('DRAG_DROP')) return '🎨';
    if (formato.includes('TIMED')) return '⏱️';
    if (formato.includes('CANVAS')) return '✨';
    if (formato.includes('REACTION')) return '⚡';
    return '🎮';
  }
}
