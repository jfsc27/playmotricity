import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActividadService } from '../../../services/actividad';

interface ObjetivoTactil {
  id: number;
  top: number; // Porcentaje 10 - 75
  left: number; // Porcentaje 10 - 80
  emoji: string;
  color: string;
  tamano: number; // 85 - 110 px
}

@Component({
  selector: 'app-carrera-tiempo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="carrera-container">
      <!-- Encabezado con barra de progreso visual continua (sin números) -->
      <div class="carrera-header">
        <button class="btn-audio" (click)="reproducirInstruccion()">
          <span class="icon-audio">🔊</span>
          <span class="texto-audio">¡Toca todos los que puedas!</span>
        </button>

        <div class="barra-tiempo-wrapper" title="Tiempo restante">
          <div class="barra-tiempo-fill" [style.width.%]="porcentajeTiempoRestante"></div>
        </div>

        <div class="score-pildora">
          ⭐ {{ toquesAcertados }}
        </div>
      </div>

      <!-- Zona de juego táctil interactiva -->
      <div class="area-juego-tactil">
        @for (obj of objetivosActivos; track obj.id) {
          <button
            class="objetivo-burbuja"
            [style.top.%]="obj.top"
            [style.left.%]="obj.left"
            [style.width.px]="obj.tamano"
            [style.height.px]="obj.tamano"
            [style.background]="obj.color"
            (pointerdown)="tocarObjetivo(obj.id, $event)"
          >
            <span class="emoji-burbuja">{{ obj.emoji }}</span>
          </button>
        }

        @if (objetivosActivos.length === 0 && juegoIniciado) {
          <div class="espera-centro">
            <span class="emoji-alerta">👀</span>
            <p>¡Prepárate!</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .carrera-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
      user-select: none;
      touch-action: manipulation;
    }

    .carrera-header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .btn-audio {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1.75rem;
      background: var(--pm-orange);
      color: #fff;
      font-size: 1.15rem;
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

    /* Barra de progreso de tiempo puramente visual (sin números para niños de 4-5 años) */
    .barra-tiempo-wrapper {
      flex: 1;
      min-width: 180px;
      height: 28px;
      background: #E8E2DA;
      border-radius: var(--pm-radius-full);
      overflow: hidden;
      padding: 4px;
      box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.12);
    }

    .barra-tiempo-fill {
      height: 100%;
      background: linear-gradient(90deg, #4CAF7D 0%, #F5C842 50%, #E8685A 100%);
      border-radius: var(--pm-radius-full);
      transition: width 0.25s linear;
    }

    .score-pildora {
      background: #fff;
      border: 2px solid var(--pm-border);
      border-radius: var(--pm-radius-full);
      padding: 0.6rem 1.5rem;
      font-size: 1.25rem;
      font-weight: 900;
      color: var(--pm-text);
      box-shadow: var(--pm-shadow-sm);
    }

    .area-juego-tactil {
      position: relative;
      width: 100%;
      height: 480px;
      background: linear-gradient(180deg, #FFFDF9 0%, #FFF3E6 100%);
      border: 4px solid var(--pm-orange);
      border-radius: 3rem;
      box-shadow: 0 16px 40px rgba(242, 139, 48, 0.15);
      overflow: hidden;
      touch-action: none;
    }

    .objetivo-burbuja {
      position: absolute;
      border-radius: 50%;
      border: 4px solid #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
      cursor: pointer;
      animation: aparecerBurbuja 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      transition: transform 0.15s ease;

      &:active {
        transform: scale(0.85);
      }
    }

    .emoji-burbuja {
      font-size: 2.8rem;
      pointer-events: none;
    }

    @keyframes aparecerBurbuja {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .espera-centro {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: var(--pm-text-soft);
      font-size: 1.4rem;
      font-weight: 800;
    }

    .emoji-alerta {
      font-size: 3.5rem;
      animation: bounce 0.8s infinite;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `]
})
export class CarreraTiempo implements OnInit, OnDestroy {
  private readonly actividadService = inject(ActividadService);

  @Input() asignacionId?: string;
  @Output() completado = new EventEmitter<{ puntaje: number; precision: number; tiempoSeg: number }>();

  protected juegoIniciado = false;
  protected duracionTotalSeg = 45;
  protected tiempoRestanteSeg = 45;
  protected porcentajeTiempoRestante = 100;
  protected toquesAcertados = 0;
  protected totalAparecidos = 0;

  protected objetivosActivos: ObjetivoTactil[] = [];

  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private spawnInterval: ReturnType<typeof setInterval> | null = null;
  private idCounter = 0;

  private emojisObjetivo = ['⭐', '🎈', '🍎', '⚽', '🌟', '🧁'];
  private coloresObjetivo = ['#F87171', '#60A5FA', '#34D399', '#FBBF24', '#A78BFA', '#FB923C'];

  ngOnInit(): void {
    this.iniciarJuego();
    this.reproducirInstruccion();
  }

  ngOnDestroy(): void {
    this.detenerTimers();
  }

  protected reproducirInstruccion(): void {
    this.actividadService.reproducirInstruccionVoz('¡Toca rápido todos los objetos que aparezcan en la pantalla!');
  }

  private iniciarJuego(): void {
    this.juegoIniciado = true;
    this.tiempoRestanteSeg = this.duracionTotalSeg;
    this.porcentajeTiempoRestante = 100;

    // Timer de cuenta regresiva
    this.timerInterval = setInterval(() => {
      this.tiempoRestanteSeg--;
      this.porcentajeTiempoRestante = Math.max(0, (this.tiempoRestanteSeg / this.duracionTotalSeg) * 100);

      if (this.tiempoRestanteSeg <= 0) {
        this.finalizarJuego();
      }
    }, 1000);

    // Spawn inicial
    this.generarObjetivo();

    // Spawn periódico (cada 1.2 segundos aparece uno nuevo)
    this.spawnInterval = setInterval(() => {
      if (this.objetivosActivos.length < 4) {
        this.generarObjetivo();
      }
    }, 1200);
  }

  private generarObjetivo(): void {
    this.idCounter++;
    this.totalAparecidos++;
    const idx = Math.floor(Math.random() * this.emojisObjetivo.length);

    const nuevo: ObjetivoTactil = {
      id: this.idCounter,
      top: Math.floor(Math.random() * 65) + 10,
      left: Math.floor(Math.random() * 70) + 10,
      emoji: this.emojisObjetivo[idx],
      color: this.coloresObjetivo[idx],
      tamano: Math.floor(Math.random() * 25) + 85, // Entre 85 y 110px para excelente accesibilidad táctil
    };

    this.objetivosActivos.push(nuevo);

    // Desaparece solo después de 2.2 segundos si no se toca
    setTimeout(() => {
      this.objetivosActivos = this.objetivosActivos.filter(o => o.id !== nuevo.id);
    }, 2200);
  }

  protected tocarObjetivo(id: number, event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    this.toquesAcertados++;
    this.actividadService.reproducirEfectoSonoro('exito');
    this.objetivosActivos = this.objetivosActivos.filter(o => o.id !== id);

    // Inmediatamente generar otro para mantener el ritmo fluido
    if (this.objetivosActivos.length < 2) {
      this.generarObjetivo();
    }
  }

  private finalizarJuego(): void {
    this.detenerTimers();
    this.objetivosActivos = [];
    this.actividadService.reproducirEfectoSonoro('victoria');

    const precision = Math.min(100, Math.round((this.toquesAcertados / Math.max(1, this.totalAparecidos)) * 100));
    const puntaje = Math.min(100, Math.round((this.toquesAcertados * 4.5) + (precision * 0.2)));

    setTimeout(() => {
      this.completado.emit({
        puntaje: Math.max(50, puntaje),
        precision: Math.max(50, precision),
        tiempoSeg: this.duracionTotalSeg,
      });
    }, 800);
  }

  private detenerTimers(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.spawnInterval) clearInterval(this.spawnInterval);
  }
}
