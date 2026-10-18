import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ActividadService } from '../../../services/actividad';

interface PasoSecuencia {
  id: number;
  ordenCorrecto: number;
  titulo: string;
  subtitulo: string;
  emoji: string;
  colorGradiente: string;
}

@Component({
  selector: 'app-secuencia-deportiva',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template: `
    <div class="secuencia-container">
      <!-- Encabezado con instrucción de voz y temporizador visual -->
      <div class="secuencia-header">
        <div class="instruccion-pill">
          <span class="instruccion-icon">🥇</span>
          <span class="instruccion-texto">Ordena los 4 pasos del gran salto de izquierda a derecha</span>
          <button type="button" class="btn-audio" (click)="reproducirInstruccion()" title="Escuchar instrucción">
            🔊
          </button>
        </div>

        <div class="header-badges">
          <span class="badge-intentos">Intentos: {{ intentos() }}</span>
          <span class="badge-tiempo">⏱️ {{ tiempoTranscurrido() }}s</span>
        </div>
      </div>

      <!-- Zona de tarjetas arrastrables -->
      <div
        cdkDropList
        cdkDropListOrientation="horizontal"
        class="tarjetas-lista"
        (cdkDropListDropped)="onSoltar($event)"
      >
        @for (paso of pasos(); track paso.id; let idx = $index) {
          <div
            class="tarjeta-paso"
            cdkDrag
            [class.tarjeta-error]="mostrarError() && paso.ordenCorrecto !== (idx + 1)"
            [class.tarjeta-acierto]="verificadoCorrecto()"
            [style.background]="paso.colorGradiente"
          >
            <!-- Indicador visual de posición actual -->
            <div class="indicador-posicion">
              <span>Paso {{ idx + 1 }}</span>
            </div>

            <!-- Manija de arrastre táctil amigable -->
            <div class="cdk-drag-handle drag-handle" title="Arrastra para mover">
              ⋮⋮
            </div>

            <!-- Ilustración central grande (cero texto dependencia) -->
            <div class="paso-visual">
              <span class="paso-emoji">{{ paso.emoji }}</span>
            </div>

            <!-- Nombre del paso -->
            <div class="paso-info">
              <h4 class="paso-titulo">{{ paso.titulo }}</h4>
              <p class="paso-desc">{{ paso.subtitulo }}</p>
            </div>
          </div>
        }
      </div>

      <!-- Barra de retroalimentación y acción principal -->
      <div class="secuencia-actions">
        @if (mostrarError()) {
          <div class="feedback-alerta feedback-error">
            <span>❌ ¡Casi! Revisa el orden de los pasos e inténtalo otra vez.</span>
          </div>
        }
        @if (verificadoCorrecto()) {
          <div class="feedback-alerta feedback-exito">
            <span>🎉 ¡Increíble! ¡Completaste la secuencia del salto a la perfección!</span>
          </div>
        }

        <div class="botones-fila">
          <button
            type="button"
            class="btn-comprobar"
            [disabled]="verificadoCorrecto()"
            (click)="comprobarOrden()"
          >
            <span>{{ verificadoCorrecto() ? '¡Logrado! ✨' : '¡Comprobar Orden! 🚀' }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .secuencia-container {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
      padding: 1.5rem;
      background: radial-gradient(circle at 10% 20%, rgba(255, 122, 69, 0.08) 0%, rgba(37, 99, 235, 0.05) 90%), #ffffff;
      border-radius: 2.5rem;
      border: 3px solid rgba(255, 122, 69, 0.2);
      box-shadow: 0 20px 45px -15px rgba(255, 122, 69, 0.2);
      position: relative;
      overflow: hidden;
    }

    .secuencia-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .instruccion-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      background: #fdf2e9;
      border: 2px solid #ff7a45;
      padding: 0.6rem 1.25rem;
      border-radius: 2rem;
      font-weight: 700;
      color: #9a3412;
      box-shadow: 0 4px 12px rgba(255, 122, 69, 0.15);
    }

    .instruccion-icon {
      font-size: 1.5rem;
    }

    .instruccion-texto {
      font-size: 1.05rem;
    }

    .btn-audio {
      background: #ff7a45;
      color: white;
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: 0 4px 10px rgba(255, 122, 69, 0.35);

      &:hover {
        transform: scale(1.15);
      }
      &:active {
        transform: scale(0.95);
      }
    }

    .header-badges {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .badge-intentos,
    .badge-tiempo {
      background: #f1f5f9;
      padding: 0.5rem 1rem;
      border-radius: 1.5rem;
      font-size: 0.95rem;
      font-weight: 800;
      color: #334155;
      border: 1px solid #cbd5e1;
    }

    /* Lista horizontal de tarjetas drag & drop */
    .tarjetas-lista {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
      min-height: 290px;
      padding: 0.5rem 0;

      @media (max-width: 900px) {
        grid-template-columns: repeat(2, 1fr);
      }
      @media (max-width: 550px) {
        grid-template-columns: 1fr;
      }
    }

    .tarjeta-paso {
      min-height: 270px;
      padding: 1.25rem;
      border-radius: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      text-align: center;
      cursor: grab;
      user-select: none;
      position: relative;
      border: 3px solid rgba(255, 255, 255, 0.85);
      box-shadow: 0 12px 25px -5px rgba(0, 0, 0, 0.12);
      transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s ease;

      &:active {
        cursor: grabbing;
      }
    }

    .indicador-posicion {
      position: absolute;
      top: 0.75rem;
      left: 1rem;
      background: rgba(255, 255, 255, 0.9);
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.8rem;
      font-weight: 900;
      color: #1e293b;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    }

    .drag-handle {
      position: absolute;
      top: 0.75rem;
      right: 1rem;
      font-size: 1.25rem;
      color: rgba(255, 255, 255, 0.9);
      cursor: grab;
    }

    .paso-visual {
      margin-top: 1.5rem;
      width: 100px;
      height: 100px;
      background: rgba(255, 255, 255, 0.85);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 -4px 8px rgba(0, 0, 0, 0.06), 0 8px 16px rgba(0, 0, 0, 0.08);
      border: 2px solid rgba(255, 255, 255, 0.95);
    }

    .paso-emoji {
      font-size: 3.25rem;
      filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15));
      animation: flotar 3s ease-in-out infinite alternate;
    }

    @keyframes flotar {
      0% { transform: translateY(0); }
      100% { transform: translateY(-6px); }
    }

    .paso-info {
      background: rgba(255, 255, 255, 0.92);
      padding: 0.75rem 1rem;
      border-radius: 1.25rem;
      width: 100%;
      margin-top: 0.5rem;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    }

    .paso-titulo {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 900;
      color: #0f172a;
    }

    .paso-desc {
      margin: 0.25rem 0 0;
      font-size: 0.85rem;
      color: #475569;
      font-weight: 600;
    }

    /* Animaciones CDK */
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 2rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      transform: scale(1.08) rotate(3deg);
      opacity: 0.95;
    }

    .cdk-drag-placeholder {
      opacity: 0.3;
      border: 3px dashed #94a3b8;
    }

    .cdk-drag-animating {
      transition: transform 300ms cubic-bezier(0, 0, 0.2, 1);
    }

    .tarjetas-lista.cdk-drop-list-dragging .tarjeta-paso:not(.cdk-drag-placeholder) {
      transition: transform 300ms cubic-bezier(0, 0, 0.2, 1);
    }

    .tarjeta-error {
      animation: sacudida 0.5s ease;
      border-color: #ef4444 !important;
      box-shadow: 0 0 20px rgba(239, 68, 68, 0.4) !important;
    }

    .tarjeta-acierto {
      border-color: #22c55e !important;
      box-shadow: 0 0 25px rgba(34, 197, 94, 0.5) !important;
      transform: scale(1.03);
    }

    @keyframes sacudida {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-8px); }
      40%, 80% { transform: translateX(8px); }
    }

    /* Acciones */
    .secuencia-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .feedback-alerta {
      padding: 0.75rem 1.5rem;
      border-radius: 1.5rem;
      font-weight: 800;
      font-size: 1.05rem;
      text-align: center;
      animation: aparecer 0.3s ease;
    }

    .feedback-error {
      background: #fef2f2;
      color: #991b1b;
      border: 2px solid #f87171;
    }

    .feedback-exito {
      background: #f0fdf4;
      color: #166534;
      border: 2px solid #4ade80;
    }

    @keyframes aparecer {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .botones-fila {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    .btn-comprobar {
      min-width: 280px;
      min-height: 70px;
      font-size: 1.35rem;
      font-weight: 900;
      color: white;
      background: linear-gradient(135deg, #ff7a45 0%, #ea580c 100%);
      border: none;
      border-radius: 2.5rem;
      cursor: pointer;
      box-shadow: 0 12px 28px -5px rgba(234, 88, 12, 0.45);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

      &:hover:not(:disabled) {
        transform: translateY(-3px) scale(1.03);
        box-shadow: 0 16px 32px -5px rgba(234, 88, 12, 0.55);
      }

      &:active:not(:disabled) {
        transform: translateY(1px) scale(0.98);
      }

      &:disabled {
        background: #94a3b8;
        cursor: not-allowed;
        box-shadow: none;
      }
    }
  `],
})
export class SecuenciaDeportiva implements OnInit {
  @Input() asignacionId?: string;
  @Output() completado = new EventEmitter<{ puntaje: number; precision: number; tiempoSeg: number }>();

  private readonly actividadService = inject(ActividadService);

  protected readonly intentos = signal(0);
  protected readonly errores = signal(0);
  protected readonly tiempoTranscurrido = signal(0);
  protected readonly mostrarError = signal(false);
  protected readonly verificadoCorrecto = signal(false);

  private timerInterval?: number;
  private inicioMs = 0;

  // 4 pasos representativos del salto atlético
  protected readonly pasos = signal<PasoSecuencia[]>([
    {
      id: 1,
      ordenCorrecto: 1,
      titulo: '1. Prepararse',
      subtitulo: 'Mirar al frente y concentrarse',
      emoji: '🧍',
      colorGradiente: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
    },
    {
      id: 2,
      ordenCorrecto: 2,
      titulo: '2. Flexionar',
      subtitulo: 'Doblar rodillas e impulsarse',
      emoji: '🧘',
      colorGradiente: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    },
    {
      id: 3,
      ordenCorrecto: 3,
      titulo: '3. Saltar',
      subtitulo: 'Volar por el aire bien alto',
      emoji: '🚀',
      colorGradiente: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    },
    {
      id: 4,
      ordenCorrecto: 4,
      titulo: '4. Aterrizar',
      subtitulo: 'Caer suave sobre ambos pies',
      emoji: '🎯',
      colorGradiente: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
  ]);

  ngOnInit(): void {
    // Mezclar las tarjetas para que el niño deba ordenarlas
    this.desordenarPasos();
    this.iniciarTemporizador();

    // Instrucción de voz inicial
    setTimeout(() => {
      this.reproducirInstruccion();
    }, 400);
  }

  private desordenarPasos(): void {
    const lista = [...this.pasos()];
    // Asegurar que al inicio no esté ya resuelto
    let ordenada = true;
    while (ordenada) {
      lista.sort(() => Math.random() - 0.5);
      ordenada = lista.every((p, idx) => p.ordenCorrecto === idx + 1);
    }
    this.pasos.set(lista);
  }

  private iniciarTemporizador(): void {
    this.inicioMs = Date.now();
    this.timerInterval = window.setInterval(() => {
      if (!this.verificadoCorrecto()) {
        const seg = Math.floor((Date.now() - this.inicioMs) / 1000);
        this.tiempoTranscurrido.set(seg);
      }
    }, 1000);
  }

  protected reproducirInstruccion(): void {
    this.actividadService.reproducirInstruccionVoz(
      'Ordena los cuatro pasos del salto motor desde el inicio hasta el aterrizaje. Arrastra las tarjetas y pulsa comprobar.'
    );
  }

  protected onSoltar(event: CdkDragDrop<PasoSecuencia[]>): void {
    this.mostrarError.set(false);
    const listaActual = [...this.pasos()];
    moveItemInArray(listaActual, event.previousIndex, event.currentIndex);
    this.pasos.set(listaActual);
    this.actividadService.reproducirEfectoSonoro('campana');
  }

  protected comprobarOrden(): void {
    if (this.verificadoCorrecto()) return;

    this.intentos.update((i) => i + 1);
    const actual = this.pasos();
    const esCorrecto = actual.every((paso, idx) => paso.ordenCorrecto === idx + 1);

    if (esCorrecto) {
      this.verificadoCorrecto.set(true);
      this.mostrarError.set(false);
      window.clearInterval(this.timerInterval);

      this.actividadService.reproducirEfectoSonoro('victoria');
      this.actividadService.reproducirInstruccionVoz('¡Excelente trabajo! Has completado la secuencia deportiva correctamente.');

      const errs = this.errores();
      const precision = Math.max(40, Math.round(100 - errs * 15));
      const puntaje = Math.max(50, Math.round(100 - errs * 10));
      const tiempoSeg = Math.max(1, this.tiempoTranscurrido());

      setTimeout(() => {
        this.completado.emit({
          puntaje,
          precision,
          tiempoSeg,
        });
      }, 1500);
    } else {
      this.errores.update((e) => e + 1);
      this.mostrarError.set(true);
      this.actividadService.reproducirEfectoSonoro('error');
      this.actividadService.reproducirInstruccionVoz('Revisa los pasos y prueba de nuevo.');
    }
  }
}
