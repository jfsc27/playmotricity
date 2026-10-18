import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActividadService } from '../../../services/actividad';

interface PuntoGuia {
  id: number;
  x: number;
  y: number;
  numero: number;
  conectado: boolean;
  activo: boolean;
}

@Component({
  selector: 'app-conecta-puntos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="conecta-container">
      <!-- Encabezado con audio y métricas -->
      <div class="conecta-header">
        <button class="btn-audio" (click)="reproducirInstruccion()">
          <span class="icon-audio">🔊</span>
          <span class="texto-audio">¡Une los números en orden!</span>
        </button>

        <div class="stats-pills">
          <div class="pill">⏱️ {{ tiempoFormateado() }}</div>
          <div class="pill">⭐ Puntos: {{ conectadosCount() }} / {{ puntos.length }}</div>
        </div>
      </div>

      <!-- Lienzo Canvas interactivo con Puntos Superpuestos -->
      <div class="canvas-wrapper">
        <canvas
          #canvasRef
          width="700"
          height="460"
        ></canvas>

        <!-- Botones táctiles gigantes para cada número -->
        <div class="puntos-overlay">
          @for (p of puntos; track p.id) {
            <button
              class="punto-nodo"
              [class.nodo-conectado]="p.conectado"
              [class.nodo-siguiente]="p.activo && !p.conectado"
              [style.left.px]="p.x"
              [style.top.px]="p.y"
              (pointerdown)="tocarPunto(p, $event)"
              [title]="'Punto ' + p.numero"
            >
              <span class="numero-label">{{ p.numero }}</span>
              @if (p.activo && !p.conectado) {
                <span class="anillo-pulso"></span>
              }
            </button>
          }
        </div>

        @if (figuraRevelada()) {
          <div class="revelacion-banner">
            <span class="emoji-revelacion">⛵</span>
            <p>¡Descubriste el Barquito Velero!</p>
          </div>
        }
      </div>

      <div class="indicador-guia">
        @if (!figuraRevelada()) {
          <span>👉 Toca el número <strong>{{ siguienteEsperado }}</strong> para continuar la línea</span>
        } @else {
          <span>🎉 ¡Completaste todos los puntos fantásticamente!</span>
        }
      </div>
    </div>
  `,
  styles: [`
    .conecta-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      width: 100%;
      max-width: 850px;
      margin: 0 auto;
      user-select: none;
      touch-action: manipulation;
    }

    .conecta-header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .btn-audio {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1.75rem;
      background: var(--pm-blue);
      color: #fff;
      font-size: 1.15rem;
      font-weight: 800;
      border-radius: var(--pm-radius-full);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
      border: none;
      cursor: pointer;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

      &:hover, &:active {
        transform: scale(1.05);
      }
    }

    .stats-pills {
      display: flex;
      gap: 1rem;
    }

    .pill {
      background: #fff;
      border: 2px solid var(--pm-border);
      border-radius: var(--pm-radius-full);
      padding: 0.6rem 1.25rem;
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--pm-text);
      box-shadow: var(--pm-shadow-sm);
    }

    .canvas-wrapper {
      position: relative;
      width: 100%;
      max-width: 700px;
      height: 460px;
      border: 4px solid var(--pm-blue);
      border-radius: 2.8rem;
      box-shadow: 0 16px 40px rgba(59, 130, 246, 0.18);
      background: linear-gradient(180deg, #F0F7FF 0%, #FFFFFF 100%);
      overflow: hidden;
      touch-action: none;

      canvas {
        display: block;
        width: 100%;
        height: 100%;
      }
    }

    .puntos-overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .punto-nodo {
      position: absolute;
      width: 64px;
      height: 64px;
      margin-left: -32px;
      margin-top: -32px;
      border-radius: 50%;
      background: #FFFFFF;
      border: 4px solid var(--pm-blue);
      color: var(--pm-blue);
      font-size: 1.5rem;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      pointer-events: auto;
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      z-index: 10;

      &:active {
        transform: scale(0.9);
      }

      &.nodo-siguiente {
        background: #FEF3C7;
        border-color: #F59E0B;
        color: #B45309;
        transform: scale(1.15);
        box-shadow: 0 10px 25px rgba(245, 158, 11, 0.4);
      }

      &.nodo-conectado {
        background: var(--pm-green);
        border-color: #15803D;
        color: #FFFFFF;
        transform: scale(0.95);
      }
    }

    .anillo-pulso {
      position: absolute;
      inset: -10px;
      border-radius: 50%;
      border: 3px solid #F59E0B;
      animation: pulsoAnim 1.4s infinite ease-out;
      pointer-events: none;
    }

    @keyframes pulsoAnim {
      0% { transform: scale(0.85); opacity: 1; }
      100% { transform: scale(1.4); opacity: 0; }
    }

    .revelacion-banner {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 255, 255, 0.95);
      border: 3px solid var(--pm-green);
      border-radius: 2rem;
      padding: 0.8rem 2rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 12px 30px rgba(0,0,0,0.15);
      animation: bannerSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);

      .emoji-revelacion {
        font-size: 2.5rem;
      }

      p {
        font-size: 1.25rem;
        font-weight: 900;
        color: var(--pm-green-dark);
        margin: 0;
      }
    }

    @keyframes bannerSlideUp {
      from { transform: translate(-50%, 40px); opacity: 0; }
      to { transform: translate(-50%, 0); opacity: 1; }
    }

    .indicador-guia {
      background: #EFF6FF;
      color: #1D4ED8;
      padding: 0.75rem 1.75rem;
      border-radius: var(--pm-radius-full);
      font-size: 1.15rem;
      font-weight: 800;
      border: 2px solid #BFDBFE;
      text-align: center;
    }
  `]
})
export class ConectaPuntos implements AfterViewInit, OnDestroy {
  private readonly actividadService = inject(ActividadService);

  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() asignacionId?: string;
  @Output() completado = new EventEmitter<{ puntaje: number; precision: number; tiempoSeg: number }>();

  protected puntos: PuntoGuia[] = [
    { id: 1, x: 350, y: 70, numero: 1, conectado: false, activo: true },
    { id: 2, x: 490, y: 240, numero: 2, conectado: false, activo: false },
    { id: 3, x: 350, y: 240, numero: 3, conectado: false, activo: false },
    { id: 4, x: 530, y: 280, numero: 4, conectado: false, activo: false },
    { id: 5, x: 450, y: 390, numero: 5, conectado: false, activo: false },
    { id: 6, x: 250, y: 390, numero: 6, conectado: false, activo: false },
    { id: 7, x: 170, y: 280, numero: 7, conectado: false, activo: false },
    { id: 8, x: 350, y: 280, numero: 8, conectado: false, activo: false },
  ];

  protected siguienteEsperado = 1;
  protected conectadosCount = signal(0);
  protected figuraRevelada = signal(false);
  protected segundosTranscurridos = 0;
  protected errores = 0;

  private ctx!: CanvasRenderingContext2D;
  private timerRef: ReturnType<typeof setInterval> | null = null;
  private puntosTrazo: { x: number; y: number }[] = [];

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.iniciarTimer();
    this.reproducirInstruccion();
    this.redibujarLineas();
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
    this.actividadService.reproducirInstruccionVoz(
      '¡Une los puntos en orden numérico tocando el número que sigue!'
    );
  }

  protected tiempoFormateado(): string {
    const min = Math.floor(this.segundosTranscurridos / 60);
    const seg = this.segundosTranscurridos % 60;
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
  }

  protected tocarPunto(punto: PuntoGuia, event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    if (punto.numero === this.siguienteEsperado) {
      // Punto correcto
      punto.conectado = true;
      punto.activo = false;
      this.conectadosCount.set(this.conectadosCount() + 1);
      this.puntosTrazo.push({ x: punto.x, y: punto.y });
      this.redibujarLineas();
      this.actividadService.reproducirEfectoSonoro('exito');

      this.siguienteEsperado++;

      if (this.siguienteEsperado <= this.puntos.length) {
        const prox = this.puntos.find(p => p.numero === this.siguienteEsperado);
        if (prox) prox.activo = true;
      } else {
        // Cerrar la figura conectando con el punto 1
        this.puntosTrazo.push({ x: this.puntos[0].x, y: this.puntos[0].y });
        this.redibujarLineas(true);
        this.completarJuego();
      }
    } else if (!punto.conectado) {
      // Error: toco un número que no era el siguiente
      this.errores++;
      this.actividadService.reproducirEfectoSonoro('error');
    }
  }

  private redibujarLineas(cerrado = false): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (this.puntosTrazo.length < 2) return;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(this.puntosTrazo[0].x, this.puntosTrazo[0].y);

    for (let i = 1; i < this.puntosTrazo.length; i++) {
      this.ctx.lineTo(this.puntosTrazo[i].x, this.puntosTrazo[i].y);
    }

    this.ctx.lineWidth = 10;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = cerrado ? '#22C55E' : '#3B82F6';
    this.ctx.stroke();

    if (cerrado) {
      this.ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  private completarJuego(): void {
    if (this.timerRef) clearInterval(this.timerRef);
    this.figuraRevelada.set(true);
    this.actividadService.reproducirEfectoSonoro('victoria');

    const total = this.puntos.length;
    const precision = Math.max(50, Math.round((total / (total + this.errores)) * 100));
    const puntaje = Math.round(Math.min(100, precision * 0.8 + 20));

    setTimeout(() => {
      this.completado.emit({
        puntaje,
        precision,
        tiempoSeg: this.segundosTranscurridos,
      });
    }, 1500);
  }
}
