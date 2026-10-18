import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { ActividadService } from '../../../services/actividad';

interface BotonLuz {
  id: number;
  activo: boolean;
  colorNeon: string;
  tiempoEncendido: number;
}

const PALETA_NEON = [
  { nombre: 'cyan', hex: '#00f5d4', sombra: '0 0 35px #00f5d4, inset 0 0 15px #00f5d4' },
  { nombre: 'magenta', hex: '#ff007f', sombra: '0 0 35px #ff007f, inset 0 0 15px #ff007f' },
  { nombre: 'amarillo', hex: '#ffe600', sombra: '0 0 35px #ffe600, inset 0 0 15px #ffe600' },
  { nombre: 'electrico', hex: '#7000ff', sombra: '0 0 35px #7000ff, inset 0 0 15px #7000ff' },
  { nombre: 'verde', hex: '#39ff14', sombra: '0 0 35px #39ff14, inset 0 0 15px #39ff14' },
  { nombre: 'naranja', hex: '#ff5e00', sombra: '0 0 35px #ff5e00, inset 0 0 15px #ff5e00' },
];

@Component({
  selector: 'app-panel-reaccion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="estadio-reaccion">
      <!-- HUD Superior del juego de reflejos estilo FitLights -->
      <header class="reaccion-hud">
        <div class="hud-item hud-tiempo">
          <span class="hud-icono">⏱️</span>
          <div class="hud-valor-box">
            <span class="hud-label">TIEMPO</span>
            <span class="hud-valor" [class.tiempo-critico]="tiempoRestante() <= 5">{{ tiempoRestante() }}s</span>
          </div>
        </div>

        <div class="hud-item hud-aciertos">
          <span class="hud-icono">⚡</span>
          <div class="hud-valor-box">
            <span class="hud-label">ACIERTOS</span>
            <span class="hud-valor neon-cyan">{{ aciertos() }}</span>
          </div>
        </div>

        <div class="hud-item hud-precision">
          <span class="hud-icono">🎯</span>
          <div class="hud-valor-box">
            <span class="hud-label">PRECISIÓN</span>
            <span class="hud-valor neon-yellow">{{ precisionCalculada() }}%</span>
          </div>
        </div>

        <button type="button" class="btn-audio-hud" (click)="reproducirInstruccion()" title="Repetir instrucción de voz">
          🔊
        </button>
      </header>

      <!-- Grid de 9 pulsadores circulares de reacción -->
      <main class="grid-pulsadores">
        @for (boton of botones(); track boton.id) {
          <button
            type="button"
            class="pulsador-luz"
            [class.pulsador-activo]="boton.activo"
            [style.--color-neon]="boton.colorNeon"
            (pointerdown)="tocarPulsador(boton, $event)"
          >
            <div class="pulsador-anillo"></div>
            <div class="pulsador-nucleo">
              @if (boton.activo) {
                <span class="destello-icono">✨</span>
              }
            </div>
          </button>
        }
      </main>

      <!-- Barra de estado y ambientación -->
      <footer class="reaccion-footer">
        <p class="instruccion-rapida">
          ¡Toca los pulsadores en cuanto se enciendan antes de que se apaguen!
        </p>
      </footer>
    </div>
  `,
  styles: [`
    .estadio-reaccion {
      background: radial-gradient(circle at center, #1e1b4b 0%, #0f172a 60%, #020617 100%);
      border-radius: 2.75rem;
      padding: 1.75rem;
      border: 3px solid rgba(112, 0, 255, 0.4);
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 35px rgba(112, 0, 255, 0.25);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      user-select: none;
      touch-action: manipulation;
    }

    /* HUD Superior de estilo arcade futurista */
    .reaccion-hud {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-around;
      width: 100%;
      gap: 1rem;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 2rem;
      padding: 0.75rem 1.5rem;
      box-shadow: inset 0 2px 6px rgba(255, 255, 255, 0.05);
    }

    .hud-item {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .hud-icono {
      font-size: 1.75rem;
    }

    .hud-valor-box {
      display: flex;
      flex-direction: column;
    }

    .hud-label {
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #94a3b8;
    }

    .hud-valor {
      font-size: 1.5rem;
      font-weight: 900;
      color: #f8fafc;
      font-family: monospace, sans-serif;
    }

    .tiempo-critico {
      color: #ff0055 !important;
      animation: pulsoCritico 0.5s infinite alternate;
    }

    @keyframes pulsoCritico {
      from { transform: scale(1); filter: drop-shadow(0 0 4px #ff0055); }
      to { transform: scale(1.15); filter: drop-shadow(0 0 12px #ff0055); }
    }

    .neon-cyan {
      color: #00f5d4;
      text-shadow: 0 0 8px rgba(0, 245, 212, 0.6);
    }

    .neon-yellow {
      color: #ffe600;
      text-shadow: 0 0 8px rgba(255, 230, 0, 0.6);
    }

    .btn-audio-hud {
      background: #7000ff;
      border: 1px solid #9d4edd;
      color: white;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      font-size: 1.25rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 15px rgba(112, 0, 255, 0.5);
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

      &:hover {
        transform: scale(1.15);
        box-shadow: 0 0 25px rgba(112, 0, 255, 0.8);
      }
      &:active {
        transform: scale(0.95);
      }
    }

    /* Grid 3x3 de pulsadores */
    .grid-pulsadores {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      padding: 1rem;
      max-width: 480px;
      width: 100%;

      @media (max-width: 500px) {
        gap: 1rem;
      }
    }

    .pulsador-luz {
      position: relative;
      aspect-ratio: 1 / 1;
      min-width: 90px;
      min-height: 90px;
      border-radius: 50%;
      background: #090d16;
      border: 3px solid #1e293b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 6px 12px rgba(0, 0, 0, 0.8), 0 4px 10px rgba(0, 0, 0, 0.5);
      transition: transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease, border-color 0.2s ease;
      -webkit-tap-highlight-color: transparent;

      &:active {
        transform: scale(0.92);
      }
    }

    .pulsador-anillo {
      position: absolute;
      inset: 6px;
      border-radius: 50%;
      border: 2px dashed rgba(255, 255, 255, 0.1);
      transition: all 0.2s ease;
    }

    .pulsador-nucleo {
      width: 60%;
      height: 60%;
      border-radius: 50%;
      background: #141c2e;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .destello-icono {
      font-size: 1.5rem;
      filter: drop-shadow(0 0 6px white);
    }

    /* ESTADO ACTIVO ILUMINADO (NEÓN PODEROSO) */
    .pulsador-activo {
      border-color: var(--color-neon);
      background: radial-gradient(circle, var(--color-neon) 0%, #1e1b4b 80%);
      box-shadow: 0 0 40px var(--color-neon), inset 0 0 20px var(--color-neon);
      transform: scale(1.06);
      animation: brilloPulsante 0.8s infinite alternate;

      .pulsador-anillo {
        border-color: rgba(255, 255, 255, 0.8);
        box-shadow: 0 0 15px var(--color-neon);
      }

      .pulsador-nucleo {
        background: #ffffff;
        box-shadow: 0 0 25px white, 0 0 40px var(--color-neon);
      }
    }

    @keyframes brilloPulsante {
      0% { filter: brightness(1); }
      100% { filter: brightness(1.3); }
    }

    .reaccion-footer {
      text-align: center;
      padding: 0.25rem 1rem;
    }

    .instruccion-rapida {
      margin: 0;
      color: #94a3b8;
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
  `],
})
export class PanelReaccion implements OnInit, OnDestroy {
  @Input() asignacionId?: string;
  @Output() completado = new EventEmitter<{ puntaje: number; precision: number; tiempoSeg: number }>();

  private readonly actividadService = inject(ActividadService);

  // Estados reactivos con Signal
  protected readonly tiempoRestante = signal(30);
  protected readonly aciertos = signal(0);
  protected readonly fallos = signal(0);
  protected readonly juegoActivo = signal(false);

  // Grid de 9 pulsadores
  protected readonly botones = signal<BotonLuz[]>(
    Array.from({ length: 9 }, (_, i) => ({
      id: i,
      activo: false,
      colorNeon: PALETA_NEON[i % PALETA_NEON.length].hex,
      tiempoEncendido: 0,
    }))
  );

  // Subscripciones RxJS para el Game Loop
  private loopSub?: Subscription;
  private timerSub?: Subscription;

  get precisionCalculada(): () => number {
    return () => {
      const a = this.aciertos();
      const f = this.fallos();
      const total = a + f;
      if (total === 0) return 100;
      return Math.min(100, Math.max(0, Math.round((a / total) * 100)));
    };
  }

  ngOnInit(): void {
    this.iniciarJuego();
  }

  ngOnDestroy(): void {
    this.detenerGameLoop();
  }

  private iniciarJuego(): void {
    this.juegoActivo.set(true);
    this.tiempoRestante.set(30);
    this.aciertos.set(0);
    this.fallos.set(0);

    // Instrucción de voz
    this.reproducirInstruccion();

    // Cronómetro de cuenta regresiva (1s)
    this.timerSub = interval(1000).subscribe(() => {
      const t = this.tiempoRestante();
      if (t > 1) {
        this.tiempoRestante.set(t - 1);
      } else {
        this.tiempoRestante.set(0);
        this.finalizarJuego();
      }
    });

    // Game Loop RxJS: cada 850ms activa aleatoriamente 1 o 2 pulsadores
    this.loopSub = interval(850).subscribe(() => {
      this.actualizarPulsadoresAleatorios();
    });
  }

  private detenerGameLoop(): void {
    if (this.loopSub) {
      this.loopSub.unsubscribe();
      this.loopSub = undefined;
    }
    if (this.timerSub) {
      this.timerSub.unsubscribe();
      this.timerSub = undefined;
    }
  }

  private actualizarPulsadoresAleatorios(): void {
    if (!this.juegoActivo()) return;

    this.botones.update((lista) => {
      // Contar botones que se apagaron sin ser tocados como fallos
      lista.forEach((b) => {
        if (b.activo) {
          // El botón se apaga sin tocar -> cuenta como fallo
          this.fallos.update((f) => f + 1);
        }
      });

      // Apagar todos primero
      const apagados = lista.map((b) => ({ ...b, activo: false }));

      // Seleccionar 1 o 2 índices distintos al azar
      const cantidad = Math.random() > 0.45 ? 2 : 1;
      const indicesDisponibles = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5);

      for (let i = 0; i < cantidad; i++) {
        const idx = indicesDisponibles[i];
        const paleta = PALETA_NEON[Math.floor(Math.random() * PALETA_NEON.length)];
        apagados[idx] = {
          ...apagados[idx],
          activo: true,
          colorNeon: paleta.hex,
        };
      }

      return apagados;
    });
  }

  protected tocarPulsador(boton: BotonLuz, event: Event): void {
    event.preventDefault();
    if (!this.juegoActivo()) return;

    if (boton.activo) {
      // Acierto: apagar el botón de inmediato y sumar acierto
      this.aciertos.update((a) => a + 1);
      this.actividadService.reproducirEfectoSonoro('exito');

      this.botones.update((lista) =>
        lista.map((b) => (b.id === boton.id ? { ...b, activo: false } : b))
      );
    } else {
      // Tocado a destiempo o apagado
      this.fallos.update((f) => f + 1);
      this.actividadService.reproducirEfectoSonoro('error');
    }
  }

  private finalizarJuego(): void {
    this.juegoActivo.set(false);
    this.detenerGameLoop();

    // Apagar todos los pulsadores
    this.botones.update((lista) => lista.map((b) => ({ ...b, activo: false })));

    const ac = this.aciertos();
    const fa = this.fallos();
    const total = ac + fa;
    const precision = total > 0 ? Math.min(100, Math.max(0, Math.round((ac / total) * 100))) : 70;
    // Puntaje ponderado por reflejos y aciertos
    const puntaje = Math.min(100, Math.max(30, Math.round(ac * 4.5 + precision * 0.3)));

    this.actividadService.reproducirEfectoSonoro('victoria');
    this.actividadService.reproducirInstruccionVoz('¡Tiempo terminado! Gran reflejo y velocidad motriz.');

    setTimeout(() => {
      this.completado.emit({
        puntaje,
        precision,
        tiempoSeg: 30,
      });
    }, 1500);
  }

  protected reproducirInstruccion(): void {
    this.actividadService.reproducirInstruccionVoz(
      '¡Atento al panel! Toca los botones de luz neón lo más rápido que puedas en cuanto se enciendan.'
    );
  }
}
