import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragDrop, CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
import { ActividadService } from '../../../services/actividad';

interface FormaElemento {
  id: string;
  forma: 'circulo' | 'cuadrado' | 'triangulo';
  color: string;
  icono: string;
}

@Component({
  selector: 'app-clasifica-formas',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template: `
    <div class="clasifica-container">
      <!-- Encabezado con audio y progreso -->
      <div class="juego-header">
        <button class="btn-audio" (click)="reproducirInstruccion()">
          <span class="icon-audio">🔊</span>
          <span class="texto-audio">¡Clasifica cada figura en su grupo!</span>
        </button>

        <div class="stats-pills">
          <div class="pill">⏱️ {{ tiempoFormateado() }}</div>
          <div class="pill">⭐ {{ colocados() }} / {{ totalObjetos }}</div>
        </div>
      </div>

      <!-- Área de formas disponibles -->
      <div
        class="pool-formas"
        cdkDropList
        #poolList="cdkDropList"
        [cdkDropListData]="disponibles"
        [cdkDropListConnectedTo]="['drop-circulos', 'drop-cuadrados', 'drop-triangulos']"
      >
        <span class="pool-indicador" *ngIf="disponibles.length > 0">
          Arrastra hacia el grupo correcto:
        </span>
        <div class="pool-grid">
          @for (item of disponibles; track item.id) {
            <div
              class="forma-card"
              cdkDrag
              [cdkDragData]="item"
              [style.background]="item.color"
              [class.forma-circulo]="item.forma === 'circulo'"
              [class.forma-cuadrado]="item.forma === 'cuadrado'"
              [class.forma-triangulo]="item.forma === 'triangulo'"
            >
              <div class="forma-preview" *cdkDragPreview [style.background]="item.color">
                <span>{{ item.icono }}</span>
              </div>
              <div class="forma-placeholder" *cdkDragPlaceholder></div>
              <span class="forma-icono">{{ item.icono }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Zonas de clasificación por categoría -->
      <div class="categorias-grid">
        <!-- Contenedor Círculos -->
        <div
          class="categoria-caja categoria-caja--circulo"
          id="drop-circulos"
          cdkDropList
          [cdkDropListData]="[]"
          (cdkDropListDropped)="onDropForma($event, 'circulo')"
        >
          <div class="caja-encabezado">
            <span class="caja-icono">🔴</span>
            <h4>Círculos</h4>
          </div>
          <div class="caja-contador">{{ conteoPorForma('circulo') }} recolectados</div>
        </div>

        <!-- Contenedor Cuadrados -->
        <div
          class="categoria-caja categoria-caja--cuadrado"
          id="drop-cuadrados"
          cdkDropList
          [cdkDropListData]="[]"
          (cdkDropListDropped)="onDropForma($event, 'cuadrado')"
        >
          <div class="caja-encabezado">
            <span class="caja-icono">🟦</span>
            <h4>Cuadrados</h4>
          </div>
          <div class="caja-contador">{{ conteoPorForma('cuadrado') }} recolectados</div>
        </div>

        <!-- Contenedor Triángulos -->
        <div
          class="categoria-caja categoria-caja--triangulo"
          id="drop-triangulos"
          cdkDropList
          [cdkDropListData]="[]"
          (cdkDropListDropped)="onDropForma($event, 'triangulo')"
        >
          <div class="caja-encabezado">
            <span class="caja-icono">🔺</span>
            <h4>Triángulos</h4>
          </div>
          <div class="caja-contador">{{ conteoPorForma('triangulo') }} recolectados</div>
        </div>
      </div>

      @if (mensajeFeedback) {
        <div class="feedback-toast">
          <span>👀 ¡Intenta en otra forma geométrica!</span>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .clasifica-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;
        width: 100%;
        max-width: 950px;
        margin: 0 auto;
        user-select: none;
      }

      .juego-header {
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
        background: var(--pm-purple);
        color: #fff;
        font-size: 1.15rem;
        font-weight: 800;
        border-radius: var(--pm-radius-full);
        box-shadow: 0 6px 20px rgba(139, 111, 192, 0.35);
        border: none;
        cursor: pointer;
        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

        &:hover,
        &:active {
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

      .pool-formas {
        width: 100%;
        min-height: 150px;
        background: rgba(255, 255, 255, 0.9);
        border: 3px dashed var(--pm-purple);
        border-radius: 2.5rem;
        padding: 1.75rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        box-shadow: 0 12px 32px rgba(139, 111, 192, 0.1);
      }

      .pool-indicador {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--pm-text-soft);
        margin-bottom: 1rem;
      }

      .pool-grid {
        display: flex;
        gap: 1.5rem;
        flex-wrap: wrap;
        justify-content: center;
      }

      .forma-card {
        width: 90px;
        height: 90px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: grab;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        transition: transform 0.2s ease;
        touch-action: none;

        &.forma-circulo {
          border-radius: 50%;
        }
        &.forma-cuadrado {
          border-radius: 1.25rem;
        }
        &.forma-triangulo {
          border-radius: 1.75rem 1.75rem 0.5rem 0.5rem;
        }

        &:active {
          cursor: grabbing;
          transform: scale(1.12);
        }
      }

      .forma-icono {
        font-size: 2.8rem;
        pointer-events: none;
      }

      .forma-preview {
        width: 100px;
        height: 100px;
        border-radius: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3rem;
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.25);
      }

      .forma-placeholder {
        width: 90px;
        height: 90px;
        border-radius: 1.5rem;
        background: rgba(0, 0, 0, 0.08);
        border: 2px dashed rgba(0, 0, 0, 0.2);
      }

      .categorias-grid {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1.5rem;
      }

      .categoria-caja {
        background: #fff;
        border-radius: 2.5rem;
        padding: 1.75rem 1.25rem;
        border: 3px solid var(--pm-border);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        min-height: 190px;
        transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

        &.cdk-drop-list-dragging {
          transform: scale(1.04);
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.12);
        }

        &--circulo {
          border-color: #fca5a5;
          background: #fef2f2;
        }
        &--cuadrado {
          border-color: #93c5fd;
          background: #eff6ff;
        }
        &--triangulo {
          border-color: #fcd34d;
          background: #fffbeb;
        }
      }

      .caja-encabezado {
        display: flex;
        align-items: center;
        gap: 0.6rem;

        h4 {
          font-size: 1.35rem;
          font-weight: 900;
          color: var(--pm-text);
        }
      }

      .caja-icono {
        font-size: 2rem;
      }

      .caja-contador {
        font-size: 1rem;
        font-weight: 800;
        color: var(--pm-text-soft);
        background: #fff;
        padding: 0.4rem 1rem;
        border-radius: var(--pm-radius-full);
        box-shadow: var(--pm-shadow-sm);
      }

      .feedback-toast {
        background: #fff3e6;
        border: 2px solid var(--pm-orange);
        color: var(--pm-orange-dark);
        padding: 0.75rem 1.5rem;
        border-radius: var(--pm-radius-full);
        font-size: 1.1rem;
        font-weight: 800;
        animation: popToast 0.3s ease;
      }

      @keyframes popToast {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class ClasificaFormas implements OnInit {
  private readonly actividadService = inject(ActividadService);

  @Input() asignacionId?: string;
  @Output() completado = new EventEmitter<{
    puntaje: number;
    precision: number;
    tiempoSeg: number;
  }>();

  protected disponibles: FormaElemento[] = [
    { id: '1', forma: 'circulo', color: '#F87171', icono: '⚽' },
    { id: '2', forma: 'cuadrado', color: '#60A5FA', icono: '🎁' },
    { id: '3', forma: 'triangulo', color: '#FBBF24', icono: '🍕' },
    { id: '4', forma: 'circulo', color: '#34D399', icono: '🍪' },
    { id: '5', forma: 'cuadrado', color: '#A78BFA', icono: '📦' },
    { id: '6', forma: 'triangulo', color: '#FB923C', icono: '⛺' },
  ];

  protected totalObjetos = 6;
  protected colocados = signal(0);
  protected intentos = 0;
  protected segundosTranscurridos = 0;
  protected timerRef: ReturnType<typeof setInterval> | null = null;
  protected mensajeFeedback = false;

  private clasificadosPorForma: Record<'circulo' | 'cuadrado' | 'triangulo', number> = {
    circulo: 0,
    cuadrado: 0,
    triangulo: 0,
  };

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
    this.actividadService.reproducirInstruccionVoz(
      '¡Arrastra cada figura hacia su grupo geométrico!',
    );
  }

  protected tiempoFormateado(): string {
    const min = Math.floor(this.segundosTranscurridos / 60);
    const seg = this.segundosTranscurridos % 60;
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
  }

  protected conteoPorForma(forma: 'circulo' | 'cuadrado' | 'triangulo'): number {
    return this.clasificadosPorForma[forma];
  }

  protected onDropForma(
    event: CdkDragDrop<any>,
    formaEsperada: 'circulo' | 'cuadrado' | 'triangulo',
  ): void {
    this.intentos++;
    const item = event.item.data as FormaElemento;

    if (item.forma === formaEsperada) {
      this.clasificadosPorForma[formaEsperada]++;
      this.disponibles = this.disponibles.filter((d) => d.id !== item.id);
      this.colocados.set(this.colocados() + 1);
      this.actividadService.reproducirEfectoSonoro('exito');
      this.mensajeFeedback = false;

      if (this.disponibles.length === 0) {
        if (this.timerRef) clearInterval(this.timerRef);
        this.actividadService.reproducirEfectoSonoro('victoria');
        const precision = Math.round(
          (this.totalObjetos / Math.max(this.intentos, this.totalObjetos)) * 100,
        );
        const puntaje = Math.round(Math.min(100, precision * 0.8 + 20));

        setTimeout(() => {
          this.completado.emit({
            puntaje,
            precision,
            tiempoSeg: this.segundosTranscurridos,
          });
        }, 800);
      }
    } else {
      this.actividadService.reproducirEfectoSonoro('error');
      this.mensajeFeedback = true;
      setTimeout(() => (this.mensajeFeedback = false), 2200);
    }
  }
}
