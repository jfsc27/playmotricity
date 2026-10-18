import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Auth } from '../../services/auth';
import { PerfilInfantil, PerfilService } from '../../services/perfil';
import {
  NivelProgreso,
  ProgresoPerfil,
  ReporteProgreso,
  ResultadoDetalle,
  SeguimientoService,
  TipoActividad,
  formatearTiempo,
} from '../../services/seguimiento';

import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-progreso',
  imports: [RouterLink, DecimalPipe, DatePipe, SidebarComponent],
  templateUrl: './progreso.html',
  // Reutiliza el diseño del panel principal (barra lateral, tarjetas, botones) sin duplicarlo.
  styleUrls: ['../inicio/inicio.scss', './progreso.scss'],
})
export class Progreso implements OnInit {
  protected readonly auth = inject(Auth);
  private readonly perfilService = inject(PerfilService);
  private readonly seguimiento = inject(SeguimientoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly sidebarCollapsed = signal(false);
  protected readonly perfiles = signal<PerfilInfantil[]>([]);
  protected readonly perfilId = signal<string | null>(null);
  protected readonly progreso = signal<ProgresoPerfil | null>(null);
  protected readonly completadas = signal<ResultadoDetalle[]>([]);
  protected readonly resultados = signal<ResultadoDetalle[]>([]);
  protected readonly reportes = signal<ReporteProgreso[]>([]);
  protected readonly pestana = signal<'completadas' | 'resultados'>('completadas');
  protected readonly cargando = signal(true);
  protected readonly generando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly aviso = signal<string | null>(null);

  protected readonly formatearTiempo = formatearTiempo;

  protected readonly esDocente = computed(() => this.auth.tieneRol('DOCENTE'));
  protected readonly rolLabel = computed(() => (this.esDocente() ? 'Docente' : 'Padre / Acudiente'));
  protected readonly iniciales = computed(() =>
    (this.auth.usuario()?.nombre ?? '')
      .split(' ')
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('')
  );
  protected readonly listaVisible = computed(() =>
    this.pestana() === 'completadas' ? this.completadas() : this.resultados()
  );

  ngOnInit(): void {
    this.perfilService.listar().subscribe({
      next: (lista) => {
        this.perfiles.set(lista);
        const pedido = this.route.snapshot.queryParamMap.get('perfil');
        const inicial = lista.find((p) => p.id === pedido) ?? lista[0];
        if (inicial) {
          this.seleccionar(inicial.id);
        } else {
          this.cargando.set(false);
        }
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('No se pudieron cargar los perfiles infantiles.');
      },
    });
  }

  protected seleccionar(perfilId: string): void {
    this.perfilId.set(perfilId);
    this.cargando.set(true);
    this.error.set(null);
    this.aviso.set(null);
    this.router.navigate([], { queryParams: { perfil: perfilId }, replaceUrl: true });

    forkJoin({
      progreso: this.seguimiento.progreso(perfilId),
      completadas: this.seguimiento.actividadesCompletadas(perfilId),
      resultados: this.seguimiento.resultados(perfilId),
      reportes: this.seguimiento.reportes(perfilId),
    }).subscribe({
      next: (r) => {
        this.progreso.set(r.progreso);
        this.completadas.set(r.completadas);
        this.resultados.set(r.resultados);
        this.reportes.set(r.reportes);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set('No se pudo cargar el progreso de este perfil.');
      },
    });
  }

  protected generarReporte(): void {
    const id = this.perfilId();
    if (!id) return;
    this.generando.set(true);
    this.seguimiento.generarReporte(id).subscribe({
      next: (reporte) => {
        this.generando.set(false);
        this.reportes.update((lista) => [reporte, ...lista]);
        this.aviso.set('Reporte generado y guardado correctamente.');
      },
      error: () => {
        this.generando.set(false);
        this.error.set('No se pudo generar el reporte.');
      },
    });
  }

  protected nombreTipo(tipo: TipoActividad): string {
    return { MOTRICIDAD_FINA: 'Motricidad fina', MOTRICIDAD_GRUESA: 'Motricidad gruesa', MIXTA: 'Mixta' }[tipo];
  }

  protected nombreNivel(nivel: NivelProgreso): string {
    return {
      SIN_DATOS: 'Sin datos',
      INICIAL: 'Inicial',
      EN_DESARROLLO: 'En desarrollo',
      AVANZADO: 'Avanzado',
    }[nivel];
  }

  protected nombreEstado(estado: string): string {
    return estado === 'COMPLETADA' ? 'Completada' : estado === 'EN_PROGRESO' ? 'En progreso' : 'Pendiente';
  }

  protected plural(n: number, singular: string, plural: string): string {
    return `${n} ${n === 1 ? singular : plural}`;
  }

  protected salir(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
