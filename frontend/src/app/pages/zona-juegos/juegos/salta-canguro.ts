import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActividadService, Asignacion } from '../../../services/actividad';

@Component({
  selector: 'app-salta-canguro',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="salto-container">
      <!-- Encabezado con audio y cronómetro -->
      <div class="salto-header">
        <button class="btn-narracion" (click)="reproducirInstruccion()">
          <span class="btn-narracion-icon">🔊</span>
          <span>Escuchar instrucción</span>
        </button>
        <div class="cronometro-badge">
          ⏱️ {{ tiempoFormateado() }}
        </div>
      </div>

      <!-- Tarjeta lúdica con canguro animado interactivo -->
      <div class="escenario-canguro">
        <div class="canguro-wrapper" [class.canguro-saltando]="animandoSalto">
          <span class="canguro-emoji">🦘</span>
          <div class="sombra-suelo" [class.sombra-salto]="animandoSalto"></div>
        </div>

        <h2 class="titulo-reto">¡Salta como un Cangurito!</h2>
        <p class="instruccion-texto">
          {{ asignacion?.instrucciones || '¡Ponte de pie, flexiona las rodillas y salta en tu lugar con alegría!' }}
        </p>

        <!-- Contador de saltos gigantesco para el niño -->
        <div class="contador-saltos">
          <span class="saltos-numero">{{ saltosRealizados }}</span>
          <span class="saltos-etiqueta">Saltos contabilizados</span>
        </div>
      </div>

      <!-- Controles de supervisión para el adulto -->
      <div class="panel-adulto">
        <div class="adulto-tag">
          <span>👨‍👧 Asistencia de Adulto: Toca por cada salto observado</span>
        </div>

        <div class="acciones-adulto-grid">
          <button class="btn-marcar-salto" (click)="registrarSalto()">
            <span class="icono-btn">🦘</span>
            <span class="texto-btn">+1 ¡Salto!</span>
          </button>

          <button class="btn-finalizar-reto" (click)="abrirEvaluacion()">
            <span class="icono-btn">🏆</span>
            <span class="texto-btn">Evaluar Reto</span>
          </button>
        </div>
      </div>

      <!-- Modal de evaluación de desempeño para el adulto -->
      @if (modalEvaluacionAbierto) {
        <div class="modal-backdrop">
          <div class="modal-evaluacion">
            <div class="modal-header">
              <span class="modal-emoji">🦘</span>
              <h3>Desempeño en el Salto de Canguro</h3>
              <p>Total de saltos registrados: <strong>{{ saltosRealizados }}</strong></p>
            </div>

            <div class="opciones-evaluacion">
              <button class="btn-opcion btn-opcion--excelente" (click)="confirmarEvaluacion(100, 95)">
                <span class="opcion-estrella">🌟🌟🌟</span>
                <span class="opcion-titulo">¡Excelente coordinación!</span>
                <span class="opcion-desc">Despegó ambos pies del suelo con flexión y aterrizó seguro</span>
              </button>

              <button class="btn-opcion btn-opcion--bien" (click)="confirmarEvaluacion(85, 80)">
                <span class="opcion-estrella">🌟🌟</span>
                <span class="opcion-titulo">Buen esfuerzo</span>
                <span class="opcion-desc">Saltó varias veces apoyándose o con pequeños desequilibrios</span>
              </button>

              <button class="btn-opcion btn-opcion--practica" (click)="confirmarEvaluacion(65, 65)">
                <span class="opcion-estrella">🌟</span>
                <span class="opcion-titulo">En desarrollo</span>
                <span class="opcion-desc">Hizo la intención de saltar, requiere practicar el despegue</span>
              </button>
            </div>

            <button class="btn-cancelar" (click)="modalEvaluacionAbierto = false">
              Continuar saltando
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .salto-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.75rem;
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      user-select: none;
    }

    .salto-header {
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
      background: var(--pm-orange);
      color: #fff;
      font-size: 1.1rem;
      font-weight: 800;
      border-radius: var(--pm-radius-full);
      box-shadow: 0 6px 20px rgba(242, 139, 48, 0.35);
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

    .escenario-canguro {
      width: 100%;
      background: linear-gradient(135deg, #FFF8EE 0%, #FFF1D6 100%);
      border: 4px solid var(--pm-orange);
      border-radius: 3rem;
      padding: 2.5rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      box-shadow: 0 16px 40px rgba(242, 139, 48, 0.15);
      gap: 1rem;
    }

    .canguro-wrapper {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .canguro-emoji {
      font-size: 6rem;
      display: block;
      transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .canguro-saltando .canguro-emoji {
      animation: saltoBrinco 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes saltoBrinco {
      0% { transform: translateY(0) scale(1, 1); }
      30% { transform: translateY(-45px) scale(0.9, 1.1); }
      70% { transform: translateY(-10px) scale(1.05, 0.95); }
      100% { transform: translateY(0) scale(1, 1); }
    }

    .sombra-suelo {
      width: 100px;
      height: 14px;
      background: rgba(0, 0, 0, 0.15);
      border-radius: 50%;
      transition: all 0.35s ease;
    }

    .sombra-salto {
      transform: scale(0.5);
      opacity: 0.05;
    }

    .titulo-reto {
      font-size: 2.2rem;
      font-weight: 900;
      color: #92400E;
    }

    .instruccion-texto {
      font-size: 1.25rem;
      font-weight: 700;
      color: #78350F;
      max-width: 600px;
      line-height: 1.5;
    }

    .contador-saltos {
      background: #FFFFFF;
      border: 3px solid #F59E0B;
      border-radius: 2rem;
      padding: 0.8rem 2.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 8px 24px rgba(245, 158, 11, 0.2);
    }

    .saltos-numero {
      font-size: 3rem;
      font-weight: 900;
      color: #D97706;
      line-height: 1;
    }

    .saltos-etiqueta {
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--pm-text-soft);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .panel-adulto {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .adulto-tag {
      background: #FEF3C7;
      color: #92400E;
      padding: 0.5rem 1.5rem;
      border-radius: var(--pm-radius-full);
      font-size: 0.95rem;
      font-weight: 800;
      border: 2px solid #FDE68A;
      text-align: center;
    }

    .acciones-adulto-grid {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      max-width: 550px;
    }

    .btn-marcar-salto {
      background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
      color: #fff;
      border-radius: 2rem;
      min-height: 90px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.8rem;
      font-size: 1.4rem;
      font-weight: 900;
      border: none;
      cursor: pointer;
      box-shadow: 0 10px 25px rgba(217, 119, 6, 0.35);
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

      &:active {
        transform: scale(0.95);
      }
    }

    .btn-finalizar-reto {
      background: linear-gradient(135deg, var(--pm-green) 0%, #15803D 100%);
      color: #fff;
      border-radius: 2rem;
      min-height: 90px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.8rem;
      font-size: 1.4rem;
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

    .modal-emoji {
      font-size: 3.5rem;
    }

    .modal-header h3 {
      font-size: 1.5rem;
      font-weight: 900;
      color: var(--pm-text);
      margin: 0.5rem 0;
    }

    .modal-header p {
      font-size: 1.05rem;
      color: var(--pm-text-soft);
    }

    .opciones-evaluacion {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

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

      &:hover {
        transform: translateY(-2px);
      }

      &--excelente {
        border-color: var(--pm-green);
        background: #F0FDF4;
      }

      &--bien {
        border-color: var(--pm-blue);
        background: #F0F9FF;
      }

      &--practica {
        border-color: var(--pm-orange);
        background: #FFF7ED;
      }
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
export class SaltaCanguro implements OnInit, OnDestroy {
  private readonly actividadService = inject(ActividadService);

  @Input() asignacion?: Asignacion;
  @Output() completado = new EventEmitter<{ puntaje: number; precision: number; tiempoSeg: number }>();

  protected saltosRealizados = 0;
  protected animandoSalto = false;
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
    const texto = this.asignacion?.instrucciones || '¡Imita al canguro y salta en el mismo lugar con energía!';
    this.actividadService.reproducirInstruccionVoz(texto);
  }

  protected tiempoFormateado(): string {
    const min = Math.floor(this.segundosTranscurridos / 60);
    const seg = this.segundosTranscurridos % 60;
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
  }

  protected registrarSalto(): void {
    this.saltosRealizados++;
    this.animandoSalto = true;
    this.actividadService.reproducirEfectoSonoro('exito');
    setTimeout(() => (this.animandoSalto = false), 450);
  }

  protected abrirEvaluacion(): void {
    this.modalEvaluacionAbierto = true;
    this.actividadService.reproducirEfectoSonoro('campana');
  }

  protected confirmarEvaluacion(puntajeBase: number, precisionBase: number): void {
    if (this.timerRef) clearInterval(this.timerRef);
    this.modalEvaluacionAbierto = false;
    this.actividadService.reproducirEfectoSonoro('victoria');

    const bonusSaltos = Math.min(10, this.saltosRealizados * 2);
    const puntaje = Math.min(100, puntajeBase + bonusSaltos);
    const precision = Math.min(100, precisionBase);

    this.completado.emit({
      puntaje,
      precision,
      tiempoSeg: Math.max(10, this.segundosTranscurridos),
    });
  }
}
