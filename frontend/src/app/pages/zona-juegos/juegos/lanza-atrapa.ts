import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActividadService, Asignacion } from '../../../services/actividad';

@Component({
  selector: 'app-lanza-atrapa',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lanzamiento-container">
      <!-- Encabezado con audio y cronómetro -->
      <div class="lanzamiento-header">
        <button class="btn-narracion" (click)="reproducirInstruccion()">
          <span class="btn-narracion-icon">🔊</span>
          <span>Escuchar instrucción</span>
        </button>
        <div class="cronometro-badge">
          ⏱️ {{ tiempoFormateado() }}
        </div>
      </div>

      <!-- Tarjeta del juego interactivo de pelota -->
      <div class="escenario-pelota">
        <div class="campo-lanzamiento">
          <div class="pelota-animada" [class.pelota-volando]="animandoPelota">
            <span class="pelota-emoji">🎾</span>
          </div>
          <div class="guante-receptor">
            <span class="guante-emoji">🧤</span>
          </div>
        </div>

        <h2 class="titulo-reto">¡Lanza y Atrapa la Pelota!</h2>
        <p class="instruccion-texto">
          {{ asignacion?.instrucciones || 'Con una pelota suave, practica lanzarla hacia arriba o hacia tu acudiente e intenta atraparla con ambas manos.' }}
        </p>

        <!-- Marcadores de conteo -->
        <div class="marcadores-grid">
          <div class="marcador-card">
            <span class="marcador-num">{{ lanzamientos }}</span>
            <span class="marcador-lbl">Lanzamientos</span>
          </div>
          <div class="marcador-card marcador-atrapadas">
            <span class="marcador-num">{{ atrapadas }}</span>
            <span class="marcador-lbl">Atrapadas con éxito</span>
          </div>
        </div>
      </div>

      <!-- Panel de botones para el adulto -->
      <div class="panel-adulto">
        <div class="adulto-tag">
          <span>👨‍👧 Asistencia de Adulto: Registra cada lanzamiento y atrapada</span>
        </div>

        <div class="acciones-adulto-grid">
          <button class="btn-marcar-intento" (click)="registrarLanzamiento()">
            <span class="icono-btn">🎾</span>
            <span class="texto-btn">+1 Lanzó</span>
          </button>

          <button class="btn-marcar-atrapada" (click)="registrarAtrapada()">
            <span class="icono-btn">🧤</span>
            <span class="texto-btn">+1 ¡Atrapó!</span>
          </button>

          <button class="btn-evaluar-reto" (click)="abrirEvaluacion()">
            <span class="icono-btn">🏆</span>
            <span class="texto-btn">Evaluar</span>
          </button>
        </div>
      </div>

      <!-- Modal de evaluación para el adulto -->
      @if (modalEvaluacionAbierto) {
        <div class="modal-backdrop">
          <div class="modal-evaluacion">
            <div class="modal-header">
              <span class="modal-emoji">🎾🧤</span>
              <h3>Desempeño en Lanzamiento y Recepción</h3>
              <p>Lanzamientos: <strong>{{ lanzamientos }}</strong> • Atrapadas: <strong>{{ atrapadas }}</strong></p>
            </div>

            <div class="opciones-evaluacion">
              <button class="btn-opcion btn-opcion--excelente" (click)="confirmarEvaluacion(100, 95)">
                <span class="opcion-estrella">🌟🌟🌟</span>
                <span class="opcion-titulo">¡Excelente coordinación óculo-manual!</span>
                <span class="opcion-desc">Sigue la trayectoria con la vista y atrapa asegurando la pelota</span>
              </button>

              <button class="btn-opcion btn-opcion--bien" (click)="confirmarEvaluacion(85, 80)">
                <span class="opcion-estrella">🌟🌟</span>
                <span class="opcion-titulo">Buen control</span>
                <span class="opcion-desc">Atrapó la mayoría con apoyo del pecho o tras un rebote</span>
              </button>

              <button class="btn-opcion btn-opcion--practica" (click)="confirmarEvaluacion(65, 60)">
                <span class="opcion-estrella">🌟</span>
                <span class="opcion-titulo">En desarrollo</span>
                <span class="opcion-desc">Lanza con entusiasmo pero requiere práctica al calcular la caída</span>
              </button>
            </div>

            <button class="btn-cancelar" (click)="modalEvaluacionAbierto = false">
              Continuar jugando
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .lanzamiento-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.75rem;
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      user-select: none;
    }

    .lanzamiento-header {
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
      background: var(--pm-purple);
      color: #fff;
      font-size: 1.1rem;
      font-weight: 800;
      border-radius: var(--pm-radius-full);
      box-shadow: 0 6px 20px rgba(139, 111, 192, 0.35);
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

    .escenario-pelota {
      width: 100%;
      background: linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%);
      border: 4px solid var(--pm-purple);
      border-radius: 3rem;
      padding: 2.5rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      box-shadow: 0 16px 40px rgba(139, 111, 192, 0.2);
      gap: 1.25rem;
    }

    .campo-lanzamiento {
      position: relative;
      width: 100%;
      max-width: 380px;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
    }

    .pelota-animada {
      position: relative;
      font-size: 3.5rem;
      transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .pelota-volando {
      animation: vueloPelota 0.6s cubic-bezier(0.25, 1, 0.5, 1);
    }

    @keyframes vueloPelota {
      0% { transform: translate(0, 0) scale(1) rotate(0deg); }
      50% { transform: translate(120px, -45px) scale(1.25) rotate(180deg); }
      100% { transform: translate(220px, 0) scale(1) rotate(360deg); }
    }

    .guante-receptor {
      font-size: 4rem;
    }

    .titulo-reto {
      font-size: 2.2rem;
      font-weight: 900;
      color: #581C87;
    }

    .instruccion-texto {
      font-size: 1.25rem;
      font-weight: 700;
      color: #6B21A8;
      max-width: 600px;
      line-height: 1.5;
    }

    .marcadores-grid {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .marcador-card {
      background: #FFFFFF;
      border: 3px solid var(--pm-border);
      border-radius: 2rem;
      padding: 0.8rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);

      &.marcador-atrapadas {
        border-color: #10B981;
        background: #F0FDF4;

        .marcador-num {
          color: #059669;
        }
      }
    }

    .marcador-num {
      font-size: 2.8rem;
      font-weight: 900;
      color: var(--pm-purple);
      line-height: 1;
    }

    .marcador-lbl {
      font-size: 0.9rem;
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
      background: #FAF5FF;
      color: #6B21A8;
      padding: 0.5rem 1.5rem;
      border-radius: var(--pm-radius-full);
      font-size: 0.95rem;
      font-weight: 800;
      border: 2px solid #E9D5FF;
      text-align: center;
    }

    .acciones-adulto-grid {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr 1.2fr;
      gap: 1rem;
      max-width: 650px;
    }

    .btn-marcar-intento {
      background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
      color: #fff;
      border-radius: 2rem;
      min-height: 85px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 1.2rem;
      font-weight: 900;
      border: none;
      cursor: pointer;
      box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

      &:active { transform: scale(0.95); }
    }

    .btn-marcar-atrapada {
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: #fff;
      border-radius: 2rem;
      min-height: 85px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 1.2rem;
      font-weight: 900;
      border: none;
      cursor: pointer;
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

      &:active { transform: scale(0.95); }
    }

    .btn-evaluar-reto {
      background: linear-gradient(135deg, var(--pm-orange) 0%, #D97706 100%);
      color: #fff;
      border-radius: 2rem;
      min-height: 85px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 1.25rem;
      font-weight: 900;
      border: none;
      cursor: pointer;
      box-shadow: 0 8px 20px rgba(217, 119, 6, 0.3);
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

      &:active { transform: scale(0.95); }
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
export class LanzaAtrapa implements OnInit, OnDestroy {
  private readonly actividadService = inject(ActividadService);

  @Input() asignacion?: Asignacion;
  @Output() completado = new EventEmitter<{ puntaje: number; precision: number; tiempoSeg: number }>();

  protected lanzamientos = 0;
  protected atrapadas = 0;
  protected animandoPelota = false;
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
    const texto = this.asignacion?.instrucciones || 'Lanza la pelota suave hacia el objetivo y luego intenta atraparla.';
    this.actividadService.reproducirInstruccionVoz(texto);
  }

  protected tiempoFormateado(): string {
    const min = Math.floor(this.segundosTranscurridos / 60);
    const seg = this.segundosTranscurridos % 60;
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
  }

  protected registrarLanzamiento(): void {
    this.lanzamientos++;
    this.animandoPelota = true;
    this.actividadService.reproducirEfectoSonoro('exito');
    setTimeout(() => (this.animandoPelota = false), 600);
  }

  protected registrarAtrapada(): void {
    if (this.atrapadas < this.lanzamientos) {
      this.atrapadas++;
    } else {
      this.lanzamientos++;
      this.atrapadas++;
    }
    this.actividadService.reproducirEfectoSonoro('victoria');
  }

  protected abrirEvaluacion(): void {
    this.modalEvaluacionAbierto = true;
    this.actividadService.reproducirEfectoSonoro('campana');
  }

  protected confirmarEvaluacion(puntajeBase: number, precisionBase: number): void {
    if (this.timerRef) clearInterval(this.timerRef);
    this.modalEvaluacionAbierto = false;
    this.actividadService.reproducirEfectoSonoro('victoria');

    const bonus = Math.min(10, this.atrapadas * 2);
    const puntaje = Math.min(100, puntajeBase + bonus);

    this.completado.emit({
      puntaje,
      precision: precisionBase,
      tiempoSeg: Math.max(10, this.segundosTranscurridos),
    });
  }
}
