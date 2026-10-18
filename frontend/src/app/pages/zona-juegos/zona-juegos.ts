import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ActividadService, Asignacion } from '../../services/actividad';
import { PerfilInfantil, PerfilService } from '../../services/perfil';
import { ArrastraColores } from './juegos/arrastra-colores';
import { RetoMotriz } from './juegos/reto-motriz';
import { ClasificaFormas } from './juegos/clasifica-formas';
import { CarreraTiempo } from './juegos/carrera-tiempo';
import { TrazoMagico } from './juegos/trazo-magico';
import { AlimentaMonstruo } from './juegos/alimenta-monstruo';
import { ConectaPuntos } from './juegos/conecta-puntos';
import { SaltaCanguro } from './juegos/salta-canguro';
import { EquilibrioFlamenco } from './juegos/equilibrio-flamenco';
import { CarreraObstaculos } from './juegos/carrera-obstaculos';
import { LanzaAtrapa } from './juegos/lanza-atrapa';
import { SecuenciaDeportiva } from './juegos/secuencia-deportiva';
import { PanelReaccion } from './juegos/panel-reaccion';

@Component({
  selector: 'app-zona-juegos',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ArrastraColores,
    RetoMotriz,
    ClasificaFormas,
    CarreraTiempo,
    TrazoMagico,
    AlimentaMonstruo,
    ConectaPuntos,
    SaltaCanguro,
    EquilibrioFlamenco,
    CarreraObstaculos,
    LanzaAtrapa,
    SecuenciaDeportiva,
    PanelReaccion,
  ],
  templateUrl: './zona-juegos.html',
  styleUrl: './zona-juegos.scss',
})
export class ZonaJuegos implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly actividadService = inject(ActividadService);
  private readonly perfilService = inject(PerfilService);

  // Estados de carga y perfil
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly perfil = signal<PerfilInfantil | null>(null);
  protected readonly asignaciones = signal<Asignacion[]>([]);
  protected readonly asignacionActual = signal<Asignacion | null>(null);

  // Estado de finalización y celebración
  protected readonly juegoTerminado = signal(false);
  protected readonly guardandoResultado = signal(false);
  protected readonly resultadoGuardado = signal(false);
  protected readonly resultadoFinal = signal<{ puntaje: number; precision: number; tiempoSeg: number } | null>(null);

  ngOnInit(): void {
    const perfilId = this.route.snapshot.paramMap.get('perfilId');
    const asignacionId = this.route.snapshot.paramMap.get('asignacionId');

    if (!perfilId) {
      this.router.navigate(['/actividades']);
      return;
    }

    this.cargarDatos(perfilId, asignacionId);
  }

  private cargarDatos(perfilId: string, asignacionId: string | null): void {
    this.cargando.set(true);
    this.error.set(null);

    this.perfilService.obtener(perfilId).subscribe({
      next: (p) => {
        this.perfil.set(p);

        this.actividadService.listarAsignaciones(perfilId).subscribe({
          next: (lista) => {
            this.asignaciones.set(lista);
            if (asignacionId) {
              const encontrada = lista.find((a) => a.id === asignacionId);
              if (encontrada) {
                this.asignacionActual.set(encontrada);
              }
            }
            this.cargando.set(false);
          },
          error: () => {
            this.error.set('No se pudieron cargar las actividades asignadas.');
            this.cargando.set(false);
          },
        });
      },
      error: () => {
        this.error.set('No se encontró el perfil infantil.');
        this.cargando.set(false);
      },
    });
  }

  /**
   * Resuelve el componente exacto según el nombre de la actividad o sus propiedades.
   * Cada una de las 10 actividades tiene ahora su propio componente especializado.
   */
  protected tipoJuego(asignacion: Asignacion): string {
    const nombre = (asignacion.actividadNombre ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toUpperCase();

    // 1. Minijuegos específicos
    if (nombre.includes('SECUENCIA DEPORTIVA') || nombre.includes('SECUENCIA')) return 'SECUENCIA_DEPORTIVA';
    if (nombre.includes('PANEL DE REACCION') || nombre.includes('REACCION') || nombre.includes('FITLIGHT')) return 'PANEL_REACCION';
    if (nombre.includes('ALIMENTA AL MONSTRUO') || nombre.includes('MONSTRUO')) return 'ALIMENTA_MONSTRUO';
    if (nombre.includes('CONECTA LOS PUNTOS') || nombre.includes('CONECTA')) return 'CONECTA_PUNTOS';
    if (nombre.includes('ARRASTRA LOS COLORES') || (nombre.includes('ARRASTRA') && nombre.includes('COLOR'))) return 'ARRASTRA_COLORES';
    if (nombre.includes('CLASIFICA LAS FORMAS') || nombre.includes('CLASIFICA')) return 'CLASIFICA_FORMAS';
    if (nombre.includes('CARRERA CONTRA EL TIEMPO') || nombre.includes('TIEMPO')) return 'CARRERA_TIEMPO';
    if (nombre.includes('TRAZO MAGICO') || nombre.includes('TRAZO')) return 'TRAZO_MAGICO';

    // 2. Desafíos motrices específicos
    if (nombre.includes('SALTA COMO CANGURO') || nombre.includes('CANGURO')) return 'SALTA_CANGURO';
    if (nombre.includes('EQUILIBRIO DEL FLAMENCO') || nombre.includes('FLAMENCO')) return 'EQUILIBRIO_FLAMENCO';
    if (nombre.includes('CARRERA DE OBSTACULOS') || nombre.includes('OBSTACULOS')) return 'CARRERA_OBSTACULOS';
    if (nombre.includes('LANZA Y ATRAPA') || (nombre.includes('LANZA') && nombre.includes('ATRAPA'))) return 'LANZA_ATRAPA';

    // 3. Fallbacks por tipo de movimiento (si el nombre llegara a variar)
    const mov = (asignacion.tipoMovimiento ?? '').toUpperCase();
    if (mov.includes('SALTO')) return 'SALTA_CANGURO';
    if (mov.includes('EQUILIBRIO')) return 'EQUILIBRIO_FLAMENCO';
    if (mov.includes('CARRERA')) return 'CARRERA_OBSTACULOS';
    if (mov.includes('LANZAMIENTO')) return 'LANZA_ATRAPA';

    // 4. Fallbacks por formato de interacción
    const formato = (asignacion.formatoInteraccion ?? '').toUpperCase();
    if (formato === 'DRAG_DROP_SEQUENCE') return 'SECUENCIA_DEPORTIVA';
    if (formato === 'REACTION_PANEL') return 'PANEL_REACCION';
    if (formato === 'DRAG_DROP_MULTIPLE') return 'CLASIFICA_FORMAS';
    if (formato === 'TIMED_CHALLENGE') return 'CARRERA_TIEMPO';
    if (formato === 'CANVAS_TRACE') return 'TRAZO_MAGICO';
    if (formato === 'DRAG_DROP') return 'ARRASTRA_COLORES';

    if (asignacion.subtipo === 'DESAFIO_MOTRIZ') return 'RETO_MOTRIZ';

    return 'NO_IMPLEMENTADO';
  }

  protected seleccionarJuego(asignacion: Asignacion): void {
    this.asignacionActual.set(asignacion);
    this.juegoTerminado.set(false);
    this.resultadoFinal.set(null);
  }

  protected volverASelector(): void {
    this.asignacionActual.set(null);
    this.juegoTerminado.set(false);
    this.resultadoFinal.set(null);
  }

  protected onJuegoCompletado(resultado: { puntaje: number; precision: number; tiempoSeg: number }): void {
    const asignacion = this.asignacionActual();
    if (!asignacion) return;

    this.resultadoFinal.set(resultado);
    this.juegoTerminado.set(true);
    this.guardandoResultado.set(true);

    // Persistir en Neon DB a través del backend en menos de 2 segundos
    this.actividadService
        .registrarResultado(asignacion.id, {
          puntaje: resultado.puntaje,
          precision: resultado.precision,
          tiempoEjecucionSeg: resultado.tiempoSeg,
          completada: true,
        })
        .subscribe({
          next: () => {
            this.guardandoResultado.set(false);
            this.resultadoGuardado.set(true);
            // Actualizar estado local de la asignación
            this.asignaciones.update((lista) =>
                lista.map((a) => (a.id === asignacion.id ? { ...a, estado: 'COMPLETADA' } : a))
            );
          },
          error: () => {
            this.guardandoResultado.set(false);
            this.resultadoGuardado.set(false);
          },
        });
  }

  protected reintentarGuardado(): void {
    const asignacion = this.asignacionActual();
    const res = this.resultadoFinal();
    if (!asignacion || !res) return;

    this.guardandoResultado.set(true);
    this.actividadService
        .registrarResultado(asignacion.id, {
          puntaje: res.puntaje,
          precision: res.precision,
          tiempoEjecucionSeg: res.tiempoSeg,
          completada: true,
        })
        .subscribe({
          next: () => {
            this.guardandoResultado.set(false);
            this.resultadoGuardado.set(true);
          },
          error: () => {
            this.guardandoResultado.set(false);
            this.resultadoGuardado.set(false);
          },
        });
  }

  protected irAReportes(): void {
    const p = this.perfil();
    if (p) {
      this.router.navigate(['/progreso'], { queryParams: { perfil: p.id } });
    } else {
      this.router.navigate(['/progreso']);
    }
  }
}
