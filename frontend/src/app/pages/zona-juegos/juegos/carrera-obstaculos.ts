import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActividadService, Asignacion } from '../../../services/actividad';

interface ObstaculoPaso {
  id: number;
  titulo: string;
  emoji: string;
  accion: string;
  completado: boolean;
}

@Component({
  selector: 'app-carrera-obstaculos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="circuito-container">
      <!-- Encabezado con audio y cronómetro -->
      <div class="circuito-header">
        <button class="btn-narracion" (click)="reproducirInstruccion()">
          <span class="btn-narracion-icon">🔊</span>
          <span>Escuchar circuito</span>
        </button>
        <div class="cronometro-badge">
          ⏱️ {{ tiempoFormateado() }}
        </div>
      </div>

      <!-- Tarjeta del circuito de obstáculos con pasos secuenciales -->
      <div class="escenario-circuito">
        <div class="circuito-pista-decoracion">
          <span class="bandera-meta">🏁</span>
          <span class="corredor-emoji" [style.left.%]="porcentajeAvance">🏃</span>
        </div>

        <h2 class="titulo-circuito">¡Circuito de Obstáculos!</h2>
        <p class="instruccion-texto">
          {{ asignacion?.instrucciones || '¡Completa cada estación del circuito con tu energía y agilidad!' }}
        </p>

        <!-- Lista de estaciones del circuito -->
        <div class="estaciones-grid">
          @for (paso of estaciones; track paso.id) {
            <div
              class="estacion-card"
              [class.estacion-activa]="pasoActual === paso.id"
              [class.estacion-completada]="paso.completado"
            >
              <div class="estacion-numero">Paso {{ paso.id }}</div>
              <div class="estacion-emoji">{{ paso.emoji }}</div>
              <div class="estacion-titulo">{{ paso.titulo }}</div>
              <div class="estacion-accion">{{ paso.accion }}</div>
              @if (paso.completado) {
                <span class="check-completado">✅ ¡Logrado!</span>
              }
            </div>
          }
        </div>
      </div>

      <!-- Panel del adulto supervisor -->
      <div class="panel-adulto">
        <div class="adulto-tag">
          <span>👨‍👧 Asistencia de Adulto: Marca cada obstáculo a medida que el niño lo supere</span>
        </div>

        <div class="acciones-adulto-grid">
          <button
            class="btn-avanzar-obstaculo"
            [disabled]="pasoActual > estaciones.length"
            (click)="completarPasoActual()"
          >
            <span class="icono-btn">⚡</span>
            <span class="texto-btn">
              {{ pasoActual <= estaciones.length ? '¡Obstáculo Superado! (' + pasoActual + '/' + estaciones.length + ')' : '¡Circuito Listo!' }}
            </span>
          </button>

          <button class="btn-evaluar-circuito" (click)="abrirEvaluacion()">
            <span class="icono-btn">🏆</span>
            <span class="texto-btn">Evaluar Circuito</span>
          </button>
        </div>
      </div>

      <!-- Modal de evaluación para el adulto -->
      @if (modalEvaluacionAbierto) {
        <div class="modal-backdrop">
          <div class="modal-evaluacion">
            <div class="modal-header">
              <span class="modal-emoji">🏃💨</span>
              <h3>Evaluación del Circuito Motor</h3>
              <p>Obstáculos completados: <strong>{{ obstaculosSuperados }} de {{ estaciones.length }}</strong></p>
            </div>

            <div class="opciones-evaluacion">
              <button class="btn-opcion btn-opcion--excelente" (click)="confirmarEvaluacion(100, 95)">
                <span class="opcion-estrella">🌟🌟🌟</span>
                <span class="opcion-titulo">¡Circuito Impecable!</span>
                <span class="opcion-desc">Superó saltos, agachadas y giros con agilidad y velocidad</span>
              </button>

              <button class="btn-opcion btn-opcion--bien" (click)="confirmarEvaluacion(85, 80)">
                <span class="opcion-estrella">🌟🌟</span>
                <span class="opcion-titulo">Buen recorrido</span>
                <span class="opcion-desc">Completó el recorrido con guía en los cambios de movimiento</span>
              </button>

              <button class="btn-opcion btn-opcion--practica" (click)="confirmarEvaluacion(65, 60)">
                <span class="opcion-estrella">🌟</span>
                <span class="opcion-titulo">En desarrollo</span>
                <span class="opcion-desc">Mostró entusiasmo pero requirió asistencia física en los pasos</span>
              </button>
            </div>

            <button class="btn-cancelar" (click)="modalEvaluacionAbierto = false">
              Continuar en el circuito
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .circuito-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.75rem;
      width: 100%;
      max-width: 850px;
      margin: 0 auto;
      user-select: none;
    }

    .circuito-header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .btn-narracion {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1.6rem;
      background: var(--pm-blue);
      color: #fff;
      font-size: 1.1rem;
      font-weight: 800;
      border-radius: var(--pm-radius-full);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
      border: none;
      cursor: pointer;
      transition: transform 0.2s ease;

      &:hover, &:active {
        transform: scale(1.05);
      }
    }

    .cronometro-badge {
      background: #fff;
      border: 2px solid var(--pm-border);
      border-radius: var(--pm-radius-full);
      padding: 0.6rem 1.25rem;
      font-size: 1.15rem;
      font-weight: 900;
      color: var(--pm-text);
      box-shadow: var(--pm-shadow-sm);
    }

    .escenario-circuito {
      width: 100%;
      background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
      border: 4px solid var(--pm-green);
      border-radius: 3rem;
      padding: 2.5rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      box-shadow: 0 16px 40px rgba(34, 197, 94, 0.18);
      gap: 1.25rem;
    }

    .circuito-pista-decoracion {
      position: relative;
      width: 100%;
      max-width: 500px;
      height: 40px;
      background: #BBF7D0;
      border-radius: 20px;
      display: flex;
      align-items: center;
      padding: 0 1rem;
      border: 2px dashed #16A34A;
      margin-bottom: 0.5rem;
    }

    .corredor-emoji {
      position: absolute;
      font-size: 2.2rem;
      margin-left: -20px;
      transition: left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .bandera-meta {
      position: absolute;
      right: 10px;
      font-size: 1.8rem;
    }

    .titulo-circuito {
      font-size: 2.2rem;
      font-weight: 900;
      color: #14532D;
    }

    .instruccion-texto {
      font-size: 1.25rem;
      font-weight: 700;
      color: #166534;
      max-width: 600px;
      line-height: 1.5;
    }

    .estaciones-grid {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1.25rem;
    }

    .estacion-card {
      background: #FFFFFF;
      border: 3px solid var(--pm-border);
      border-radius: 2rem;
      padding: 1.25rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

      &.estacion-activa {
        border-color: #F59E0B;
        background: #FFFBEB;
        transform: scale(1.05);
        box-shadow: 0 10px 25px rgba(245, 158, 11, 0.25);
      }

      &.estacion-completada {
        border-color: var(--pm-green);
        background: #F0FDF4;
      }
    }

    .estacion-numero {
      font-size: 0.85rem;
      font-weight: 900;
      color: var(--pm-text-soft);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .estacion-emoji {
      font-size: 3rem;
    }

    .estacion-titulo {
      font-size: 1.15rem;
      font-weight: 900;
      color: var(--pm-text);
    }

    .estacion-accion {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--pm-text-soft);
    }

    .check-completado {
      font-size: 0.9rem;
      font-weight: 800;
      color: #15803D;
      margin-top: 0.2rem;
    }

    .panel-adulto {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .adulto-tag {
      background: #DCFCE7;
      color: #166534;
      padding: 0.5rem 1.5rem;
      border-radius: var(--pm-radius-full);
      font-size: 0.95rem;
      font-weight: 800;
      border: 2px solid #86EFAC;
      text-align: center;
    }

    .acciones-adulto-grid {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      max-width: 580px;
    }

    .btn-avanzar-obstaculo {
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: #fff;
      border-radius: 2rem;
      min-height: 90px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      font-size: 1.25rem;
      font-weight: 900;
      border: none;
      cursor: pointer;
      box-shadow: 0 10px 25px rgba(16, 185, 129, 0.35);
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

      &:active {
        transform: scale(0.95);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .btn-evaluar-circuito {
      background: linear-gradient(135deg, var(--pm-orange) 0%, #D97706 100%);
      color: #fff;
      border-radius: 2rem;
      min-height: 90px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      font-size: 1.25rem;
      font-weight: 900;
      border: none;
      cursor: pointer;
      box-shadow: 0 10px 25px rgba(217, 119, 6, 0.35);
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

      &:active {
        transform: scale(0.95);
      }
    }

    /* Modal Backdrop & Dialog */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(45, 42, 38, 0.6);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1.5rem;
    }

    .modal-evaluacion {
      background: #fff;
      border-radius: 2.5rem;
      width: 100%;
      max-width: 520px;
      padding: 2.5rem;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.25);
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      text-align: center;
    }

    .modal-emoji { font-size: 3.5rem; }
    .modal-header h3 { font-size: 1.5rem; font-weight: 900; color: var(--pm-text); margin: 0.5rem 0; }
    .modal-header p { font-size: 1.05rem; color: var(--pm-text-soft); }

    .opciones-evaluacion { display: flex; flex-direction: column; gap: 1rem; }

    .btn-opcion {
      background: var(--pm-surface);
      border: 2px solid var(--pm-border);
      border-radius: 1.5rem;
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover { transform: translateY(-2px); }
      &--excelente { border-color: var(--pm-green); background: #F0FDF4; }
      &--bien { border-color: var(--pm-blue); background: #F0F9FF; }
      &--practica { border-color: var(--pm-orange); background: #FFF7ED; }
    }

    .opcion-estrella { font-size: 1.2rem; }
    .opcion-titulo { font-size: 1.15rem; font-weight: 900; color: var(--pm-text); }
    .opcion-desc { font-size: 0.88rem; color: var(--pm-text-soft); font-weight: 600; }

    .btn-cancelar {
      background: none;
      border: none;
      color: var(--pm-text-soft);
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      text-decoration: underline;
    }
  `]
})
export class CarreraObstaculos implements OnInit, OnDestroy {
  private readonly actividadService = inject(ActividadService);

  @Input() asignacion?: Asignacion;
  @Output() completado = new EventEmitter<{ puntaje: number; precision: number; tiempoSeg: number }>();

  protected estaciones: ObstaculoPaso[] = [
    { id: 1, titulo: 'Saltar el Cojín', emoji: '🛋️', accion: 'Salto bipedal sobre un objeto suave', completado: false },
    { id: 2, titulo: 'Pasar bajo la Mesa', emoji: '🪑', accion: 'Gateo o desplazamiento agachado', completado: false },
    { id: 3, titulo: 'Zig-zag en Conos', emoji: '🔶', accion: 'Esquivar obstáculos en curva', completado: false },
    { id: 4, titulo: 'Toque de Meta', emoji: '🏁', accion: 'Carrera final rápida de 3 metros', completado: false },
  ];

  protected pasoActual = 1;
  protected obstaculosSuperados = 0;
  protected porcentajeAvance = 10;
  protected modalEvaluacionAbierto = false;
  protected segundosTranscurridos = 0;

  private timerRef: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.iniciarTimer();
    this.reproducirInstruccion();
  }

  ngOnDestroy(): void {
    if (this.timerRef) clearInterval(this.timerRef);
  }

  private iniciarTimer(): void {
    this.timerRef = setInterval(() => {
      this.segundosTranscurridos++;
    }, 1000);
  }

  protected reproducirInstruccion(): void {
    const texto = this.asignacion?.instrucciones || 'Sigue las instrucciones del circuito: salta, agáchate y corre con energía.';
    this.actividadService.reproducirInstruccionVoz(texto);
  }

  protected tiempoFormateado(): string {
    const min = Math.floor(this.segundosTranscurridos / 60);
    const seg = this.segundosTranscurridos % 60;
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
  }

  protected completarPasoActual(): void {
    if (this.pasoActual <= this.estaciones.length) {
      const actual = this.estaciones.find(e => e.id === this.pasoActual);
      if (actual) actual.completado = true;
      this.obstaculosSuperados++;
      this.pasoActual++;
      this.porcentajeAvance = Math.min(85, (this.obstaculosSuperados / this.estaciones.length) * 85 + 10);
      this.actividadService.reproducirEfectoSonoro('exito');

      if (this.pasoActual > this.estaciones.length) {
        this.porcentajeAvance = 88;
        this.actividadService.reproducirEfectoSonoro('victoria');
      }
    }
  }

  protected abrirEvaluacion(): void {
    this.modalEvaluacionAbierto = true;
    this.actividadService.reproducirEfectoSonoro('campana');
  }

  protected confirmarEvaluacion(puntajeBase: number, precisionBase: number): void {
    if (this.timerRef) clearInterval(this.timerRef);
    this.modalEvaluacionAbierto = false;
    this.actividadService.reproducirEfectoSonoro('victoria');

    const bonus = this.obstaculosSuperados * 3;
    const puntaje = Math.min(100, puntajeBase + bonus);

    this.completado.emit({
      puntaje,
      precision: precisionBase,
      tiempoSeg: Math.max(15, this.segundosTranscurridos),
    });
  }
}
