import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActividadService } from '../../../services/actividad';

interface Punto {
  x: number;
  y: number;
}

@Component({
  selector: 'app-trazo-magico',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="trazo-container">
      <!-- Encabezado con audio y métricas -->
      <div class="trazo-header">
        <button class="btn-audio" (click)="reproducirInstruccion()">
          <span class="icon-audio">🔊</span>
          <span class="texto-audio">¡Sigue el camino con tu dedo!</span>
        </button>

        <div class="stats-pills">
          <div class="pill">⏱️ {{ tiempoFormateado() }}</div>
          <div class="pill">✨ Progreso: {{ porcentajeCompletado }}%</div>
        </div>
      </div>

      <!-- Lienzo Canvas interactivo -->
      <div class="canvas-wrapper">
        <canvas
          #canvasRef
          width="700"
          height="450"
          (mousedown)="iniciarDibujo($event)"
          (mousemove)="moverDibujo($event)"
          (mouseup)="terminarDibujo()"
          (mouseleave)="terminarDibujo()"
          (touchstart)="iniciarDibujoTouch($event)"
          (touchmove)="moverDibujoTouch($event)"
          (touchend)="terminarDibujo()"
        ></canvas>

        <button class="btn-reiniciar-trazo" (click)="reiniciarLienzo()" title="Limpiar y volver a intentar">
          🔄 Limpiar trazo
        </button>
      </div>

      <div class="indicador-guia">
        <span>⭐ Sigue los puntos brillantes de la estrella sin salirte del camino</span>
      </div>
    </div>
  `,
  styles: [`
    .trazo-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      width: 100%;
      max-width: 850px;
      margin: 0 auto;
      user-select: none;
    }

    .trazo-header {
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
      background: var(--pm-green);
      color: #fff;
      font-size: 1.15rem;
      font-weight: 800;
      border-radius: var(--pm-radius-full);
      box-shadow: 0 6px 20px rgba(76, 175, 125, 0.35);
      border: none;
      cursor: pointer;
      transition: transform 0.2s ease;

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
      border: 4px solid var(--pm-green);
      border-radius: 2.8rem;
      box-shadow: 0 16px 40px rgba(76, 175, 125, 0.18);
      background: #FFFFFF;
      overflow: hidden;
      touch-action: none;

      canvas {
        display: block;
        width: 100%;
        height: auto;
        touch-action: none;
        cursor: crosshair;
      }
    }

    .btn-reiniciar-trazo {
      position: absolute;
      bottom: 1.2rem;
      right: 1.2rem;
      background: rgba(255, 255, 255, 0.95);
      border: 2px solid var(--pm-border);
      color: var(--pm-text);
      font-size: 0.95rem;
      font-weight: 800;
      padding: 0.6rem 1.2rem;
      border-radius: var(--pm-radius-full);
      cursor: pointer;
      box-shadow: var(--pm-shadow-sm);
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.05);
        border-color: var(--pm-orange);
      }
    }

    .indicador-guia {
      background: #E8F5EE;
      color: var(--pm-green-dark);
      padding: 0.6rem 1.5rem;
      border-radius: var(--pm-radius-full);
      font-size: 1.05rem;
      font-weight: 800;
      border: 1px solid var(--pm-green);
    }
  `]
})
export class TrazoMagico implements AfterViewInit, OnDestroy {
  private readonly actividadService = inject(ActividadService);

  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() asignacionId?: string;
  @Output() completado = new EventEmitter<{ puntaje: number; precision: number; tiempoSeg: number }>();

  protected porcentajeCompletado = 0;
  protected segundosTranscurridos = 0;

  private ctx!: CanvasRenderingContext2D;
  private dibujando = false;
  private pathIdeal: Punto[] = [];
  private puntosCubiertos: Set<number> = new Set();
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private toleranciaPixels = 32;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    this.generarPathEstrella();
    this.dibujarEscena();
    this.iniciarTimer();
    this.reproducirInstruccion();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  protected reproducirInstruccion(): void {
    this.actividadService.reproducirInstruccionVoz('¡Sigue el camino de la estrella con tu dedo sin salirte de la línea!');
  }

  private iniciarTimer(): void {
    this.timerInterval = setInterval(() => {
      this.segundosTranscurridos++;
    }, 1000);
  }

  protected tiempoFormateado(): string {
    const min = Math.floor(this.segundosTranscurridos / 60);
    const seg = this.segundosTranscurridos % 60;
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
  }

  /** Genera los vértices y puntos interpolados de una estrella de 5 puntas */
  private generarPathEstrella(): void {
    const cx = 350;
    const cy = 225;
    const rOuter = 160;
    const rInner = 75;
    const vertices: Punto[] = [];

    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? rOuter : rInner;
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      vertices.push({
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      });
    }
    vertices.push(vertices[0]); // Cerrar estrella

    // Interpolar puntos a lo largo de cada segmento para validar el trazo continuo
    this.pathIdeal = [];
    for (let i = 0; i < vertices.length - 1; i++) {
      const p1 = vertices[i];
      const p2 = vertices[i + 1];
      const pasos = 15;
      for (let s = 0; s < pasos; s++) {
        const t = s / pasos;
        this.pathIdeal.push({
          x: p1.x + (p2.x - p1.x) * t,
          y: p1.y + (p2.y - p1.y) * t,
        });
      }
    }
  }

  private dibujarEscena(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Dibujar pista guía punteada
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#D1D5DB';
    this.ctx.lineWidth = 26;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.setLineDash([8, 12]);

    for (let i = 0; i < this.pathIdeal.length; i++) {
      const p = this.pathIdeal[i];
      if (i === 0) this.ctx.moveTo(p.x, p.y);
      else this.ctx.lineTo(p.x, p.y);
    }
    this.ctx.stroke();

    // Línea central de guía
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#9CA3AF';
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([4, 6]);
    for (let i = 0; i < this.pathIdeal.length; i++) {
      const p = this.pathIdeal[i];
      if (i === 0) this.ctx.moveTo(p.x, p.y);
      else this.ctx.lineTo(p.x, p.y);
    }
    this.ctx.stroke();
    this.ctx.restore();
  }

  protected reiniciarLienzo(): void {
    this.puntosCubiertos.clear();
    this.porcentajeCompletado = 0;
    this.dibujarEscena();
  }

  protected iniciarDibujo(e: MouseEvent): void {
    this.dibujando = true;
    const { x, y } = this.obtenerCoordenadas(e.clientX, e.clientY);
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.validarPunto(x, y);
  }

  protected moverDibujo(e: MouseEvent): void {
    if (!this.dibujando) return;
    const { x, y } = this.obtenerCoordenadas(e.clientX, e.clientY);
    this.trazarPunto(x, y);
  }

  protected iniciarDibujoTouch(e: TouchEvent): e is TouchEvent {
    e.preventDefault();
    this.dibujando = true;
    const touch = e.touches[0];
    const { x, y } = this.obtenerCoordenadas(touch.clientX, touch.clientY);
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.validarPunto(x, y);
    return true;
  }

  protected moverDibujoTouch(e: TouchEvent): void {
    e.preventDefault();
    if (!this.dibujando) return;
    const touch = e.touches[0];
    const { x, y } = this.obtenerCoordenadas(touch.clientX, touch.clientY);
    this.trazarPunto(x, y);
  }

  protected terminarDibujo(): void {
    this.dibujando = false;
  }

  private trazarPunto(x: number, y: number): void {
    this.ctx.save();
    this.ctx.lineWidth = 14;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = '#4CAF7D';
    this.ctx.shadowColor = 'rgba(76, 175, 125, 0.4)';
    this.ctx.shadowBlur = 8;
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.ctx.restore();

    this.validarPunto(x, y);
  }

  private validarPunto(x: number, y: number): void {
    for (let i = 0; i < this.pathIdeal.length; i++) {
      if (this.puntosCubiertos.has(i)) continue;
      const ref = this.pathIdeal[i];
      const dist = Math.hypot(x - ref.x, y - ref.y);
      if (dist <= this.toleranciaPixels) {
        this.puntosCubiertos.add(i);
      }
    }

    this.porcentajeCompletado = Math.min(100, Math.round((this.puntosCubiertos.size / this.pathIdeal.length) * 100));

    // Si cubrió al menos el 85% de la trayectoria, se considera completada con éxito
    if (this.porcentajeCompletado >= 85) {
      this.finalizarJuego();
    }
  }

  private finalizarJuego(): void {
    this.dibujando = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.actividadService.reproducirEfectoSonoro('victoria');

    const precision = Math.min(100, this.porcentajeCompletado);
    const puntaje = Math.min(100, Math.round(precision * 0.95) + 5);

    setTimeout(() => {
      this.completado.emit({
        puntaje,
        precision,
        tiempoSeg: this.segundosTranscurridos,
      });
    }, 800);
  }

  private obtenerCoordenadas(clientX: number, clientY: number): Punto {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }
}
