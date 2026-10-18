import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { ActividadService } from '../../../services/actividad';

interface Fruta {
  id: string;
  nombre: string;
  emoji: string;
  color: string;
  colorBorde: string;
}

@Component({
  selector: 'app-alimenta-monstruo',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template: `
    <div class="monstruo-container">
      <!-- Barra superior lúdica -->
      <div class="juego-header">
        <button class="btn-audio" (click)="reproducirInstruccion()" title="Escuchar instrucción">
          <span class="icon-audio">🔊</span>
          <span class="texto-audio">¡Dale de comer al monstruo!</span>
        </button>

        <div class="stats-pills">
          <div class="pill-tiempo">⏱️ {{ tiempoFormateado() }}</div>
          <div class="pill-aciertos">🍽️ {{ alimentados() }} / {{ totalFrutas }}</div>
        </div>
      </div>

      <!-- Zona de frutas arrastrables -->
      <div class="zona-frutas"
           cdkDropList
           #frutasList="cdkDropList"
           [cdkDropListData]="frutasDisponibles"
           [cdkDropListConnectedTo]="['boca-monstruo']">
        <div class="frutas-grid">
          @for (fruta of frutasDisponibles; track fruta.id) {
            <div class="fruta-arrastrable"
                 cdkDrag
                 [cdkDragData]="fruta"
                 [style.background]="fruta.color"
                 [style.border-color]="fruta.colorBorde"
                 (cdkDragStarted)="onDragStart()">
              <div class="fruta-preview" *cdkDragPreview [style.background]="fruta.color">
                <span class="fruta-emoji-preview">{{ fruta.emoji }}</span>
              </div>
              <div class="fruta-placeholder" *cdkDragPlaceholder></div>
              <span class="fruta-emoji">{{ fruta.emoji }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Monstruo amigable con boca-zona de drop -->
      <div class="monstruo-area">
        <div class="monstruo-cuerpo" [class.monstruo-masticando]="animMasticando">
          <!-- Ojos del monstruo -->
          <div class="monstruo-ojos">
            <div class="ojo ojo-izq"><div class="pupila"></div></div>
            <div class="ojo ojo-der"><div class="pupila"></div></div>
          </div>

          <!-- Boca = zona de drop -->
          <div class="monstruo-boca-wrapper"
               id="boca-monstruo"
               cdkDropList
               [cdkDropListData]="bocaData"
               (cdkDropListDropped)="onDropBoca($event)">
            <div class="monstruo-boca" [class.boca-abierta]="arrastrando">
              @if (alimentados() === totalFrutas) {
                <span class="boca-feliz">😋</span>
              } @else if (arrastrando) {
                <span class="boca-esperando">😮</span>
              } @else {
                <span class="boca-hambrienta">😛</span>
              }
            </div>
          </div>

          <!-- Brazos decorativos -->
          <div class="brazo brazo-izq">🤲</div>
          <div class="brazo brazo-der">🤲</div>
        </div>

        <!-- Pancita con contador visual -->
        <div class="monstruo-pancita">
          @for (f of frutasComidas; track f.id) {
            <span class="fruta-comida">{{ f.emoji }}</span>
          }
        </div>
      </div>

      <!-- Feedback visual -->
      @if (mensajeFeedback) {
        <div class="feedback-toast">
          <span>{{ mensajeFeedback }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .monstruo-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      user-select: none;
      touch-action: none;
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
      background: var(--pm-green);
      color: #fff;
      font-size: 1.15rem;
      font-weight: 800;
      border-radius: var(--pm-radius-full);
      box-shadow: 0 6px 20px rgba(76, 175, 125, 0.35);
      cursor: pointer;
      border: none;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

      &:hover, &:active {
        transform: scale(1.06);
      }
    }

    .stats-pills {
      display: flex;
      gap: 1rem;
    }

    .pill-tiempo, .pill-aciertos {
      background: #fff;
      border: 2px solid var(--pm-border);
      border-radius: var(--pm-radius-full);
      padding: 0.6rem 1.25rem;
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--pm-text);
      box-shadow: var(--pm-shadow-sm);
    }

    /* ─── Zona de frutas ─── */
    .zona-frutas {
      width: 100%;
      min-height: 120px;
      background: rgba(255, 255, 255, 0.85);
      border: 3px dashed var(--pm-green);
      border-radius: 2.5rem;
      padding: 1.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 10px 30px rgba(76, 175, 125, 0.08);
    }

    .frutas-grid {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
    }

    .fruta-arrastrable {
      width: 100px;
      height: 100px;
      border-radius: 2rem;
      border: 4px solid;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: grab;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      transition: transform 0.2s ease;
      touch-action: none;

      &:active {
        cursor: grabbing;
        transform: scale(1.1);
      }
    }

    .fruta-emoji {
      font-size: 3.2rem;
      pointer-events: none;
    }

    .fruta-preview {
      width: 110px;
      height: 110px;
      border-radius: 2.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.25);
      transform: scale(1.15);
    }

    .fruta-emoji-preview {
      font-size: 3.5rem;
    }

    .fruta-placeholder {
      width: 100px;
      height: 100px;
      border-radius: 2rem;
      background: rgba(0, 0, 0, 0.08);
      border: 2px dashed rgba(0, 0, 0, 0.2);
    }

    /* ─── Monstruo ─── */
    .monstruo-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .monstruo-cuerpo {
      position: relative;
      width: 220px;
      height: 220px;
      background: linear-gradient(145deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%);
      border-radius: 50% 50% 45% 45%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 16px 40px rgba(139, 92, 246, 0.4);
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      animation: monstruoIdle 2s ease-in-out infinite;
    }

    .monstruo-masticando {
      animation: masticar 0.4s ease-in-out 3 !important;
    }

    @keyframes monstruoIdle {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-6px) scale(1.02); }
    }

    @keyframes masticar {
      0%, 100% { transform: scale(1); }
      25% { transform: scale(1.08, 0.94); }
      50% { transform: scale(0.96, 1.06); }
      75% { transform: scale(1.04, 0.98); }
    }

    .monstruo-ojos {
      display: flex;
      gap: 2rem;
      margin-bottom: 0.5rem;
    }

    .ojo {
      width: 40px;
      height: 40px;
      background: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 3px 6px rgba(0, 0, 0, 0.1);
    }

    .pupila {
      width: 18px;
      height: 18px;
      background: #1E1B4B;
      border-radius: 50%;
      animation: mirarAlrededor 3s ease-in-out infinite;
    }

    @keyframes mirarAlrededor {
      0%, 100% { transform: translate(0, 0); }
      25% { transform: translate(4px, -2px); }
      50% { transform: translate(-3px, 3px); }
      75% { transform: translate(2px, -1px); }
    }

    .monstruo-boca-wrapper {
      min-height: 60px;
      min-width: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .monstruo-boca {
      font-size: 3rem;
      transition: transform 0.3s ease;
    }

    .boca-abierta {
      transform: scale(1.3);
    }

    .brazo {
      position: absolute;
      font-size: 1.8rem;
      bottom: 30px;
      animation: agitarBrazos 1.5s ease-in-out infinite;
    }

    .brazo-izq {
      left: -20px;
      transform: scaleX(-1);
    }

    .brazo-der {
      right: -20px;
      animation-delay: 0.5s;
    }

    @keyframes agitarBrazos {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(15deg); }
    }

    /* ─── Pancita ─── */
    .monstruo-pancita {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      justify-content: center;
      background: rgba(139, 92, 246, 0.1);
      border: 2px solid rgba(139, 92, 246, 0.3);
      border-radius: 2rem;
      padding: 0.75rem 1.5rem;
      min-height: 50px;
      min-width: 120px;
    }

    .fruta-comida {
      font-size: 1.5rem;
      animation: aparecerComida 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes aparecerComida {
      from { transform: scale(0) rotate(-90deg); opacity: 0; }
      to { transform: scale(1) rotate(0); opacity: 1; }
    }

    /* ─── Feedback ─── */
    .feedback-toast {
      background: #FFF3E6;
      border: 2px solid var(--pm-orange);
      color: var(--pm-orange-dark);
      padding: 0.75rem 1.5rem;
      border-radius: var(--pm-radius-full);
      font-size: 1.1rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      animation: popIn 0.3s ease;
    }

    @keyframes popIn {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `]
})
export class AlimentaMonstruo implements OnInit, OnDestroy {
  private readonly actividadService = inject(ActividadService);

  @Input() asignacionId?: string;
  @Output() completado = new EventEmitter<{ puntaje: number; precision: number; tiempoSeg: number }>();

  protected frutasDisponibles: Fruta[] = [
    { id: '1', nombre: 'Manzana', emoji: '🍎', color: '#FEE2E2', colorBorde: '#EF4444' },
    { id: '2', nombre: 'Plátano', emoji: '🍌', color: '#FEF3C7', colorBorde: '#F59E0B' },
    { id: '3', nombre: 'Uvas', emoji: '🍇', color: '#EDE9FE', colorBorde: '#8B5CF6' },
    { id: '4', nombre: 'Naranja', emoji: '🍊', color: '#FFEDD5', colorBorde: '#F97316' },
    { id: '5', nombre: 'Sandía', emoji: '🍉', color: '#DCFCE7', colorBorde: '#22C55E' },
  ];

  protected bocaData: unknown[] = [];
  protected frutasComidas: Fruta[] = [];
  protected totalFrutas = 5;
  protected alimentados = signal(0);
  protected arrastrando = false;
  protected animMasticando = false;
  protected mensajeFeedback = '';
  protected segundosTranscurridos = 0;
  protected intentos = 0;

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
    this.actividadService.reproducirInstruccionVoz(
      '¡El monstruo tiene hambre! Arrastra las frutas hacia su boca para alimentarlo.'
    );
  }

  protected tiempoFormateado(): string {
    const min = Math.floor(this.segundosTranscurridos / 60);
    const seg = this.segundosTranscurridos % 60;
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
  }

  protected onDragStart(): void {
    this.arrastrando = true;
    this.mensajeFeedback = '';
  }

  protected onDropBoca(event: CdkDragDrop<unknown[]>): void {
    this.arrastrando = false;
    this.intentos++;
    const fruta = event.item.data as Fruta;

    // Todas las frutas son válidas para el monstruo
    this.frutasDisponibles = this.frutasDisponibles.filter(f => f.id !== fruta.id);
    this.frutasComidas.push(fruta);
    this.alimentados.set(this.alimentados() + 1);

    // Animación de masticar
    this.animMasticando = true;
    setTimeout(() => (this.animMasticando = false), 1200);

    this.actividadService.reproducirEfectoSonoro('exito');
    this.mensajeFeedback = '🎉 ¡Ñam ñam! ¡Qué rico!';
    setTimeout(() => (this.mensajeFeedback = ''), 1800);

    // Verificar completado
    if (this.frutasDisponibles.length === 0) {
      if (this.timerRef) clearInterval(this.timerRef);
      this.actividadService.reproducirEfectoSonoro('victoria');

      const precision = Math.round((this.totalFrutas / Math.max(this.intentos, this.totalFrutas)) * 100);
      const puntaje = Math.round(Math.min(100, (precision * 0.7) + 30));

      setTimeout(() => {
        this.completado.emit({
          puntaje,
          precision,
          tiempoSeg: this.segundosTranscurridos,
        });
      }, 1000);
    }
  }
}
