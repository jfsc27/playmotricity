import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragDrop, CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
import { ActividadService } from '../../../services/actividad';

interface ElementoColor {
  id: string;
  nombre: string;
  color: string;
  colorBorde: string;
  icono: string;
  tipo: string;
}

@Component({
  selector: 'app-arrastra-colores',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template: `
    <div class="juego-container">
      <!-- Barra superior lúdica -->
      <div class="juego-header">
        <button class="btn-audio" (click)="reproducirInstruccion()" title="Escuchar instrucción">
          <span class="icon-audio">🔊</span>
          <span class="texto-audio">¡Toca y arrastra los colores!</span>
        </button>

        <div class="stats-pills">
          <div class="pill-tiempo">⏱️ {{ tiempoFormateado() }}</div>
          <div class="pill-aciertos">⭐ {{ aciertos() }} / {{ totalElementos }}</div>
        </div>
      </div>

      <!-- Zona de origen de elementos a arrastrar -->
      <div class="zona-origen" cdkDropList #origenList="cdkDropList" [cdkDropListData]="disponibles" [cdkDropListConnectedTo]="dropListIds" (cdkDropListDropped)="onDropOrigen($event)">
        <p class="zona-instruccion" *ngIf="disponibles.length > 0">Toma una figura con tu dedo:</p>
        <div class="items-grid">
          @for (item of disponibles; track item.id) {
            <div
              class="figura-arrastrable"
              cdkDrag
              [cdkDragData]="item"
              [style.background]="item.color"
              [style.border-color]="item.colorBorde"
              (cdkDragStarted)="onDragStart()"
              (cdkDragEnded)="onDragEnd()"
            >
              <div class="figura-preview" *cdkDragPreview [style.background]="item.color">
                <span class="figura-icono">{{ item.icono }}</span>
              </div>
              <div class="figura-placeholder" *cdkDragPlaceholder></div>
              <span class="figura-icono">{{ item.icono }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Zonas de soltado (contenedores de colores gigantes) -->
      <div class="zonas-destino-grid">
        @for (target of contenedores; track target.id) {
          <div
            class="contenedor-destino"
            [class.contenedor-completado]="estaCompletado(target.tipo)"
            [id]="target.id"
            cdkDropList
            [cdkDropListData]="[]"
            (cdkDropListDropped)="onDropTarget($event, target.tipo)"
            [style.--target-color]="target.color"
            [style.--target-glow]="target.colorBorde"
          >
            <div class="target-circulo" [style.background]="target.colorLight" [style.border-color]="target.colorBorde">
              @if (estaCompletado(target.tipo)) {
                <span class="target-check">✅</span>
              } @else {
                <span class="target-icono-guia">{{ target.icono }}</span>
              }
            </div>
            <span class="target-nombre">{{ target.nombre }}</span>
          </div>
        }
      </div>

      <!-- Indicador visual de error/reintento amigable -->
      <div class="aviso-intento" *ngIf="mensajeError">
        <span class="emoji-aviso">👀</span>
        <span>¡Casi! Intenta en el color que combina</span>
      </div>
    </div>
  `,
  styles: [`
    .juego-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
      width: 100%;
      max-width: 900px;
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
      background: var(--pm-orange);
      color: #fff;
      font-size: 1.15rem;
      font-weight: 800;
      border-radius: var(--pm-radius-full);
      box-shadow: 0 6px 20px rgba(242, 139, 48, 0.35);
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

    .zona-origen {
      width: 100%;
      min-height: 140px;
      background: rgba(255, 255, 255, 0.85);
      border: 3px dashed var(--pm-orange);
      border-radius: 2.5rem;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 30px rgba(242, 139, 48, 0.08);
    }

    .zona-instruccion {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--pm-text-soft);
      margin-bottom: 1rem;
    }

    .items-grid {
      display: flex;
      gap: 1.75rem;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
    }

    .figura-arrastrable {
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

    .figura-icono {
      font-size: 3rem;
      pointer-events: none;
    }

    .figura-preview {
      width: 110px;
      height: 110px;
      border-radius: 2.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.25);
      transform: scale(1.15);
    }

    .figura-placeholder {
      width: 100px;
      height: 100px;
      border-radius: 2rem;
      background: rgba(0, 0, 0, 0.08);
      border: 2px dashed rgba(0, 0, 0, 0.2);
    }

    .zonas-destino-grid {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      gap: 1.5rem;
    }

    .contenedor-destino {
      background: #fff;
      border-radius: 2.8rem;
      padding: 1.5rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.8rem;
      border: 3px solid var(--pm-border);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      min-height: 200px;
      justify-content: center;

      &.cdk-drop-list-dragging {
        border-color: var(--target-glow);
        transform: scale(1.04);
        box-shadow: 0 14px 34px rgba(0, 0, 0, 0.12);
      }

      &.contenedor-completado {
        border-color: var(--pm-green);
        background: var(--pm-green-light);
        transform: scale(1.02);
      }
    }

    .target-circulo {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      border: 3px dashed;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.8rem;
    }

    .target-nombre {
      font-size: 1.15rem;
      font-weight: 900;
      color: var(--pm-text);
    }

    .aviso-intento {
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
      animation: bounce 0.4s ease;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
  `]
})
export class ArrastraColores implements OnInit {
  private readonly actividadService = inject(ActividadService);

  @Input() asignacionId?: string;
  @Output() completado = new EventEmitter<{ puntaje: number; precision: number; tiempoSeg: number }>();

  protected disponibles: ElementoColor[] = [
    { id: '1', nombre: 'Sol Amarillo', color: '#FCD34D', colorBorde: '#F59E0B', icono: '☀️', tipo: 'amarillo' },
    { id: '2', nombre: 'Manzana Roja', color: '#F87171', colorBorde: '#EF4444', icono: '🍎', tipo: 'rojo' },
    { id: '3', nombre: 'Pez Azul', color: '#60A5FA', colorBorde: '#3B82F6', icono: '🐟', tipo: 'azul' },
    { id: '4', nombre: 'Rana Verde', color: '#4ADE80', colorBorde: '#22C55E', icono: '🐸', tipo: 'verde' },
  ];

  protected contenedores = [
    { id: 'target-amarillo', tipo: 'amarillo', nombre: 'Amarillo', color: '#FEF3C7', colorLight: '#FFFBEB', colorBorde: '#F59E0B', icono: '🟡' },
    { id: 'target-rojo', tipo: 'rojo', nombre: 'Rojo', color: '#FEE2E2', colorLight: '#FEF2F2', colorBorde: '#EF4444', icono: '🔴' },
    { id: 'target-azul', tipo: 'azul', nombre: 'Azul', color: '#DBEAFE', colorLight: '#EFF6FF', colorBorde: '#3B82F6', icono: '🔵' },
    { id: 'target-verde', tipo: 'verde', nombre: 'Verde', color: '#DCFCE7', colorLight: '#F0FDF4', colorBorde: '#22C55E', icono: '🟢' },
  ];

  protected dropListIds = ['target-amarillo', 'target-rojo', 'target-azul', 'target-verde'];
  protected totalElementos = 4;
  protected aciertos = signal(0);
  protected intentos = 0;
  protected segundosTranscurridos = 0;
  protected timerRef: ReturnType<typeof setInterval> | null = null;
  protected mensajeError = false;

  private completadosSet = new Set<string>();

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
    this.actividadService.reproducirInstruccionVoz('¡Arrastra cada figura de color hacia su contenedor!');
  }

  protected tiempoFormateado(): string {
    const min = Math.floor(this.segundosTranscurridos / 60);
    const seg = this.segundosTranscurridos % 60;
    return `${min}:${seg < 10 ? '0' : ''}${seg}`;
  }

  protected estaCompletado(tipo: string): boolean {
    return this.completadosSet.has(tipo);
  }

  protected onDragStart(): void {
    this.mensajeError = false;
  }

  protected onDragEnd(): void {}

  protected onDropOrigen(event: CdkDragDrop<any>): void {}

  protected onDropTarget(event: CdkDragDrop<any>, targetTipo: string): void {
    this.intentos++;
    const item = event.item.data as ElementoColor;

    if (item.tipo === targetTipo) {
      // Éxito: Colocación correcta
      this.completadosSet.add(targetTipo);
      this.disponibles = this.disponibles.filter(d => d.id !== item.id);
      this.aciertos.set(this.aciertos() + 1);
      this.actividadService.reproducirEfectoSonoro('exito');
      this.mensajeError = false;

      // Verificar si completó todas las figuras
      if (this.disponibles.length === 0) {
        if (this.timerRef) clearInterval(this.timerRef);
        this.actividadService.reproducirEfectoSonoro('victoria');
        const precision = Math.round((this.totalElementos / Math.max(this.intentos, this.totalElementos)) * 100);
        const puntaje = Math.round(Math.min(100, (precision * 0.7) + 30));

        setTimeout(() => {
          this.completado.emit({
            puntaje,
            precision,
            tiempoSeg: this.segundosTranscurridos,
          });
        }, 800);
      }
    } else {
      // Error: Intento fallido
      this.actividadService.reproducirEfectoSonoro('error');
      this.mensajeError = true;
      setTimeout(() => (this.mensajeError = false), 2500);
    }
  }
}
