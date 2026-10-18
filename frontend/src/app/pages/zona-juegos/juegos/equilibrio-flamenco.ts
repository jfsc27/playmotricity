import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActividadService, Asignacion } from '../../../services/actividad';

@Component({
  selector: 'app-equilibrio-flamenco',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flamenco-container">
      <!-- Encabezado con audio y métricas -->
      <div class="flamenco-header">
        <button class="btn-narracion" (click)="reproducirInstruccion()">
          <span class="btn-narracion-icon">🔊</span>
          <span>Escuchar instrucción</span>
        </button>
        <div class="cronometro-badge">
          ⏱️ {{ tiempoFormateado() }}
        </div>
      </div>

      <!-- Tarjeta principal con flamenco y oscilación de equilibrio -->
      <div class="escenario-flamenco">
        <div class="flamenco-avatar" [class.flamenco-balanceo]="enEquilibrio">
          <span class="flamenco-emoji">🦩</span>
          <div class="plataforma-equilibrio"></div>
        </div>

        <h2 class="titulo-reto">¡Equilibrio del Flamenco!</h2>
        <p class="instruccion-texto">
          {{ asignacion?.instrucciones || 'Levanta un pie doblando la rodilla y mantente de pie sobre el otro pie como un flamenco rosado.' }}
        </p>

        <!-- Cronómetro interactivo de aguante continuo -->
        <div class="timer-aguante-card">
          <span class="aguante-segundos">{{ segundosEquilibrio }}s</span>
          <span class="aguante-etiqueta">Tiempo sostenido en un pie</span>
          <div class="barra-equilibrio-bg">
            <div class="barra-equilibrio-fill" [style.width.%]="porcentajeMeta"></div>
          </div>
        </div>
      </div>

      <!-- Panel de control para el adulto -->
      <div class="panel-adulto">
        <div class="adulto-tag">
          <span>👨‍👧 Asistencia de Adulto: Supervisa la postura y registra los segundos</span>
        </div>

        <div class="acciones-adulto-grid">
          <button
            class="btn-toggle-equilibrio"
            [class.btn-pausado]="!enEquilibrio"
            (click)="toggleEquilibrio()"
          >
            <span class="icono-btn">{{ enEquilibrio ? '⏸️' : '▶️' }}</span>
            <span class="texto-btn">{{ enEquilibrio ? 'Pausar Balance' : 'Iniciar Conteo' }}</span>
          </button>

          <button class="btn-evaluar-reto" (click)="abrirEvaluacion()">
            <span class="icono-btn">🏆</span>
            <span class="texto-btn">Evaluar Reto</span>
          </button>
        </div>
      </div>

      <!-- Modal de evaluación de equilibrio -->
      @if (modalEvaluacionAbierto) {
        <div class="modal-backdrop">
          <div class="modal-evaluacion">
            <div class="modal-header">
              <span class="modal-emoji">🦩</span>
              <h3>Desempeño en Equilibrio Estático</h3>
              <p>Tiempo máximo sostenido: <strong>{{ segundosEquilibrio }} segundos</strong></p>
            </div>

            <div class="opciones-evaluacion">
              <button class="btn-opcion btn-opcion--excelente" (click)="confirmarEvaluacion(100, 95)">
                <span class="opcion-estrella">🌟🌟🌟</span>
                <span class="opcion-titulo">¡Excelente estabilidad! (10s+)</span>
                <span class="opcion-desc">Mantuvo el pie elevado sin apoyarse ni tambalearse excesivamente</span>
              </button>

              <button class="btn-opcion btn-opcion--bien" (click)="confirmarEvaluacion(85, 80)">
                <span class="opcion-estrella">🌟🌟</span>
                <span class="opcion-titulo">Buen equilibrio (5 a 9s)</span>
                <span class="opcion-desc">Sostuvo el equilibrio pero tocó el piso un par de veces</span>
              </button>

              <button class="btn-opcion btn-opcion--practica" (click)="confirmarEvaluacion(65, 60)">
                <span class="opcion-estrella">🌟</span>
                <span class="opcion-titulo">En proceso (1 a 4s)</span>
                <span class="opcion-desc">Necesita apoyarse de una pared o de la mano del adulto</span>
              </button>
            </div>

            <button class="btn-cancelar" (click)="modalEvaluacionAbierto = false">
              Continuar practicando
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .flamenco-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.75rem;
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      user-select: none;
    }

    .flamenco-header {
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
      background: #EC4899;
      color: #fff;
      font-size: 1.1rem;
      font-weight: 800;
      border-radius: var(--pm-radius-full);
      box-shadow: 0 6px 20px rgba(236, 72, 153, 0.35);
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

    .escenario-flamenco {
      width: 100%;
      background: linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 100%);
      border: 4px solid #F472B6;
      border-radius: 3rem;
      padding: 2.5rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      box-shadow: 0 16px 40px rgba(244, 114, 182, 0.2);
      gap: 1rem;
    }

    .flamenco-avatar {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .flamenco-emoji {
      font-size: 6.5rem;
      display: block;
      transform-origin: bottom center;
    }

    .flamenco-balanceo .flamenco-emoji {
      animation: balanceoSway 2.5s infinite ease-in-out;
    }

    @keyframes balanceoSway {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(4deg) translateY(-4px); }
      75% { transform: rotate(-4deg) translateY(-2px); }
    }

    .plataforma-equilibrio {
      width: 120px;
      height: 12px;
      background: #F472B6;
      border-radius: 6px;
      box-shadow: 0 4px 10px rgba(244, 114, 182, 0.4);
    }

    .titulo-reto {
      font-size: 2.2rem;
      font-weight: 900;
      color: #9D174D;
    }

    .instruccion-texto {
      font-size: 1.25rem;
      font-weight: 700;
      color: #831843;
      max-width: 600px;
      line-height: 1.5;
    }

    .timer-aguante-card {
      background: #FFFFFF;
      border: 3px solid #F472B6;
      border-radius: 2rem;
      padding: 1rem 2.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      box-shadow: 0 8px 24px rgba(244, 114, 182, 0.2);
      width: 100%;
      max-width: 320px;
    }

    .aguante-segundos {
      font-size: 3.2rem;
      font-weight: 900;
      color: #BE185D;
      line-height: 1;
    }

    .aguante-etiqueta {
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--pm-text-soft);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .barra-equilibrio-bg {
      width: 100%;
      height: 12px;
      background: #FCE7F3;
      border-radius: 6px;
      overflow: hidden;
      margin-top: 0.4rem;
    }

    .barra-equilibrio-fill {
      height: 100%;
      background: linear-gradient(90deg, #F472B6, #DB2777);
      border-radius: 6px;
      transition: width 0.3s ease;
    }

    .panel-adulto {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .adulto-tag {
      background: #FDF2F8;
      color: #9D174D;
      padding: 0.5rem 1.5rem;
      border-radius: var(--pm-radius-full);
      font-size: 0.95rem;
      font-weight: 800;
      border: 2px solid #FBCFE8;
      text-align: center;
    }

    .acciones-adulto-grid {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      max-width: 550px;
    }

    .btn-toggle-equilibrio {
      background: linear-gradient(135deg, #EC4899 0%, #BE185D 100%);
      color: #fff;
      border-radius: 2rem;
      min-height: 90px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.8rem;
      font-size: 1.35rem;
      font-weight: 900;
      border: none;
      cursor: pointer;
      box-shadow: 0 10px 25px rgba(219, 39, 119, 0.35);
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

      &:active {
        transform: scale(0.95);
      }

      &.btn-pausado {
        background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);
      }
    }

    .btn-evaluar-reto {
      background: linear-gradient(135deg, var(--pm-green) 0%, #15803D 100%);
      color: #fff;
      border-radius: 2rem;
      min-height: 90px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.8rem;
      font-size: 1.35rem;
      font-weight: 900;
      border: none;
      cursor: pointer;
      box-shadow: 0 10px 25px rgba(21, 128, 61, 0.35);
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
export class EquilibrioFlamenco implements OnInit, OnDestroy {
  private readonly actividadService = inject(ActividadService);

  @Input() asignacion?: Asignacion;
  @Output() completado = new EventEmitter<{ puntaje: number; precision: number; tiempoSeg: number }>();

  protected segundosEquilibrio = 0;
  protected enEquilibrio = true;
  protected porcentajeMeta = 0;
  protected modalEvaluacionAbierto = false;
  protected segundosTranscurridos = 0;

  private timerGeneral: ReturnType<typeof setInterval> | null = null;
  private timerEquilibrio: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.iniciarTimers();
    this.reproducirInstruccion();
  }

  ngOnDestroy(): void {
    this.detenerTimers();
  }

  private iniciarTimers(): void {
    this.timerGeneral = setInterval(() => {
      this.segundosTranscurridos++;
    }, 1000);

    this.timerEquilibrio = setInterval(() => {
      if (this.enEquilibrio) {
        this.segundosEquilibrio++;
        this.porcentajeMeta = Math.min(100, (this.segundosEquilibrio / 12) * 100);
      }
    }, 1000);
  }

  protected reproducirInstruccion(): void {
    const texto = this.asignacion?.instrucciones || 'Mantén el equilibrio en un pie como un flamenco rosado.';
    this.actividadService.reproducirInstruccionVoz(texto);
  }

  protected tiempoFormateado(): string {
    const min = Math.floor(this.segundosTranscurridos / 60);
    const seg = this.segundosTranscurridos % 60;
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
  }

  protected toggleEquilibrio(): void {
    this.enEquilibrio = !this.enEquilibrio;
    if (this.enEquilibrio) {
      this.actividadService.reproducirEfectoSonoro('exito');
    }
  }

  protected abrirEvaluacion(): void {
    this.modalEvaluacionAbierto = true;
    this.actividadService.reproducirEfectoSonoro('campana');
  }

  protected confirmarEvaluacion(puntajeBase: number, precisionBase: number): void {
    this.detenerTimers();
    this.modalEvaluacionAbierto = false;
    this.actividadService.reproducirEfectoSonoro('victoria');

    const bonus = Math.min(10, Math.floor(this.segundosEquilibrio / 2));
    const puntaje = Math.min(100, puntajeBase + bonus);

    this.completado.emit({
      puntaje,
      precision: precisionBase,
      tiempoSeg: Math.max(10, this.segundosTranscurridos),
    });
  }

  private detenerTimers(): void {
    if (this.timerGeneral) clearInterval(this.timerGeneral);
    if (this.timerEquilibrio) clearInterval(this.timerEquilibrio);
  }
}
