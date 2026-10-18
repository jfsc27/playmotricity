import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActividadService, Asignacion } from '../../../services/actividad';

@Component({
  selector: 'app-reto-motriz',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reto-container">
      <!-- Encabezado de actividad con voz -->
      <div class="reto-header">
        <button class="btn-narracion" (click)="reproducirInstruccion()">
          <span class="btn-narracion-icon">🔊</span>
          <span>Escuchar instrucción por voz</span>
        </button>
        <div class="cronometro-badge">
          ⏱️ {{ tiempoFormateado() }}
        </div>
      </div>

      <!-- Tarjeta principal con animación interactiva en loop -->
      <div class="animacion-card" [class.animacion-activa]="enProgreso">
        <div class="avatar-movimiento">
          <span class="emoji-movimiento">{{ obtenerEmojiMovimiento() }}</span>
        </div>
        <h2 class="titulo-reto">{{ asignacion?.actividadNombre || 'Reto Motriz Asistido' }}</h2>
        <p class="instruccion-texto">{{ asignacion?.instrucciones || '¡Sigue el movimiento con entusiasmo!' }}</p>
      </div>

      <!-- Área de control exclusivo para el adulto acompañante -->
      <div class="panel-adulto">
        <div class="adulto-tag">
          <span>👨‍👧 Supervisión de Adulto Requerida</span>
        </div>

        <button class="btn-reto-completado" (click)="abrirEvaluacion()">
          <span class="icono-completado">🏆</span>
          <span class="texto-completado">¡RETO COMPLETADO!</span>
          <span class="subtexto-completado">(Tocar cuando el niño finalice el ejercicio)</span>
        </button>
      </div>

      <!-- Modal de evaluación para el adulto -->
      @if (modalEvaluacionAbierto) {
        <div class="modal-backdrop">
          <div class="modal-evaluacion">
            <div class="modal-header">
              <span class="modal-emoji">⭐</span>
              <h3>¿Cómo realizó el niño el reto?</h3>
              <p>Evalúa el desempeño motriz observado:</p>
            </div>

            <div class="opciones-evaluacion">
              <button class="btn-opcion btn-opcion--excelente" (click)="confirmarEvaluacion(100, 95)">
                <span class="opcion-estrella">🌟🌟🌟</span>
                <span class="opcion-titulo">¡Excelente!</span>
                <span class="opcion-desc">Realizó el movimiento con equilibrio y coordinación</span>
              </button>

              <button class="btn-opcion btn-opcion--bien" (click)="confirmarEvaluacion(80, 80)">
                <span class="opcion-estrella">🌟🌟</span>
                <span class="opcion-titulo">Muy bien</span>
                <span class="opcion-desc">Lo logró con apoyo o pequeñas pausas</span>
              </button>

              <button class="btn-opcion btn-opcion--practica" (click)="confirmarEvaluacion(60, 65)">
                <span class="opcion-estrella">🌟</span>
                <span class="opcion-titulo">En desarrollo</span>
                <span class="opcion-desc">Hizo el intento y requiere más práctica</span>
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
    .reto-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      user-select: none;
    }

    .reto-header {
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
      box-shadow: 0 6px 20px rgba(74, 144, 217, 0.35);
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

    .animacion-card {
      width: 100%;
      background: linear-gradient(135deg, #FFF6EE 0%, #FFFFFF 100%);
      border: 4px solid var(--pm-orange);
      border-radius: 3rem;
      padding: 3rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      box-shadow: 0 16px 40px rgba(242, 139, 48, 0.15);
      gap: 1.25rem;
    }

    .avatar-movimiento {
      width: 130px;
      height: 130px;
      border-radius: 50%;
      background: var(--pm-orange-light);
      border: 4px solid var(--pm-orange);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 25px rgba(242, 139, 48, 0.25);
      animation: loopBounce 1.5s infinite ease-in-out;
    }

    .emoji-movimiento {
      font-size: 4.5rem;
    }

    @keyframes loopBounce {
      0%, 100% {
        transform: translateY(0) scale(1);
      }
      50% {
        transform: translateY(-20px) scale(1.08);
      }
    }

    .titulo-reto {
      font-size: 2rem;
      font-weight: 900;
      color: var(--pm-text);
      letter-spacing: -0.02em;
    }

    .instruccion-texto {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--pm-text-soft);
      max-width: 600px;
      line-height: 1.5;
    }

    .panel-adulto {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .adulto-tag {
      background: #E8F5EE;
      color: var(--pm-green-dark);
      padding: 0.4rem 1.25rem;
      border-radius: var(--pm-radius-full);
      font-size: 0.95rem;
      font-weight: 800;
      border: 1px solid var(--pm-green);
    }

    .btn-reto-completado {
      width: 100%;
      max-width: 500px;
      min-height: 120px;
      background: linear-gradient(135deg, var(--pm-green) 0%, #389562 100%);
      color: #fff;
      border-radius: 2.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      border: none;
      cursor: pointer;
      box-shadow: 0 12px 32px rgba(76, 175, 125, 0.4);
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

      &:hover, &:active {
        transform: scale(1.05);
        box-shadow: 0 18px 40px rgba(76, 175, 125, 0.5);
      }
    }

    .icono-completado {
      font-size: 2.5rem;
    }

    .texto-completado {
      font-size: 1.6rem;
      font-weight: 900;
      letter-spacing: 0.02em;
    }

    .subtexto-completado {
      font-size: 0.95rem;
      opacity: 0.9;
      font-weight: 600;
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
      gap: 1.75rem;
      text-align: center;
    }

    .modal-emoji {
      font-size: 3rem;
    }

    .modal-header h3 {
      font-size: 1.5rem;
      font-weight: 900;
      color: var(--pm-text);
      margin-top: 0.5rem;
    }

    .modal-header p {
      font-size: 1rem;
      color: var(--pm-text-soft);
      font-weight: 600;
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
        box-shadow: var(--pm-shadow-md);
      }

      &--excelente {
        border-color: var(--pm-green);
        background: #F0FDF4;
        &:hover { background: #DCFCE7; }
      }

      &--bien {
        border-color: var(--pm-blue);
        background: #F0F9FF;
        &:hover { background: #E0F2FE; }
      }

      &--practica {
        border-color: var(--pm-orange);
        background: #FFF7ED;
        &:hover { background: #FFEDD5; }
      }
    }

    .opcion-estrella {
      font-size: 1.2rem;
    }

    .opcion-titulo {
      font-size: 1.2rem;
      font-weight: 900;
      color: var(--pm-text);
    }

    .opcion-desc {
      font-size: 0.88rem;
      color: var(--pm-text-soft);
      font-weight: 600;
    }

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
export class RetoMotriz implements OnInit {
  private readonly actividadService = inject(ActividadService);

  @Input() asignacion?: Asignacion;
  @Output() completado = new EventEmitter<{ puntaje: number; precision: number; tiempoSeg: number }>();

  protected enProgreso = true;
  protected modalEvaluacionAbierto = false;
  protected segundosTranscurridos = 0;
  private timerRef: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.iniciarTimer();
    this.reproducirInstruccion();
  }

  private iniciarTimer(): void {
    this.timerRef = setInterval(() => {
      this.segundosTranscurridos++;
    }, 1000);
  }

  protected reproducirInstruccion(): void {
    const texto = this.asignacion?.instrucciones || '¡Vamos a mover el cuerpo! Sigue las indicaciones del reto.';
    this.actividadService.reproducirInstruccionVoz(texto);
  }

  protected tiempoFormateado(): string {
    const min = Math.floor(this.segundosTranscurridos / 60);
    const seg = this.segundosTranscurridos % 60;
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
  }

  protected obtenerEmojiMovimiento(): string {
    const mov = this.asignacion?.tipoMovimiento?.toUpperCase() ?? '';
    if (mov.includes('SALTO')) return '🦘';
    if (mov.includes('EQUILIBRIO')) return '🦩';
    if (mov.includes('CARRERA')) return '🏃';
    if (mov.includes('LANZAMIENTO')) return '🎾';
    return '🤸';
  }

  protected abrirEvaluacion(): void {
    this.modalEvaluacionAbierto = true;
    this.actividadService.reproducirEfectoSonoro('campana');
  }

  protected confirmarEvaluacion(puntaje: number, precision: number): void {
    if (this.timerRef) clearInterval(this.timerRef);
    this.modalEvaluacionAbierto = false;
    this.actividadService.reproducirEfectoSonoro('victoria');

    this.completado.emit({
      puntaje,
      precision,
      tiempoSeg: Math.max(10, this.segundosTranscurridos),
    });
  }
}
