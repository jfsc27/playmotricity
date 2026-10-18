import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { Actividad, ActividadService, TipoActividad } from '../../services/actividad';
import { PerfilInfantil, PerfilService } from '../../services/perfil';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-actividades',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SidebarComponent],
  templateUrl: './actividades.html',
  styleUrl: './actividades.scss',
})
export class Actividades implements OnInit {
  protected readonly auth = inject(Auth);
  protected readonly actividadService = inject(ActividadService);
  private readonly perfilService = inject(PerfilService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // Estados de navegación y carga
  protected readonly sidebarCollapsed = signal(false);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly errorGeneral = signal<string | null>(null);
  protected readonly mensajeExito = signal<string | null>(null);

  // Catálogo y perfiles
  protected readonly actividades = signal<Actividad[]>([]);
  protected readonly perfiles = signal<PerfilInfantil[]>([]);

  // Filtros reactivos
  protected readonly busqueda = signal('');
  protected readonly tipoFiltro = signal<TipoActividad | null>(null);
  protected readonly edadFiltro = signal<number | null>(null); // null = todas

  // Modal de Asignación
  protected readonly modalAsignarAbierto = signal(false);
  protected readonly actividadSeleccionada = signal<Actividad | null>(null);
  protected readonly formAsignar = this.fb.nonNullable.group({
    perfilId: ['', [Validators.required]],
  });

  // Información del usuario en sesión
  protected readonly esDocente = computed(() => this.auth.usuario()?.rol === 'DOCENTE');
  protected readonly rolLabel = computed(() => (this.esDocente() ? 'Docente' : 'Padre / Acudiente'));
  protected readonly iniciales = computed(() => {
    const nombre = this.auth.usuario()?.nombre ?? '';
    return nombre
      .split(' ')
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('');
  });

  // Métricas rápidas
  protected readonly totalActividades = computed(() => this.actividades().length);
  protected readonly totalFina = computed(
    () => this.actividades().filter((a) => a.tipoActividad === 'MOTRICIDAD_FINA').length
  );
  protected readonly totalGruesa = computed(
    () => this.actividades().filter((a) => a.tipoActividad === 'MOTRICIDAD_GRUESA').length
  );
  protected readonly totalMixta = computed(
    () => this.actividades().filter((a) => a.tipoActividad === 'MIXTA').length
  );

  // Lista filtrada
  protected readonly actividadesFiltradas = computed(() => {
    const lista = this.actividades();
    const query = this.busqueda().trim().toLowerCase();
    const tipo = this.tipoFiltro();
    const edad = this.edadFiltro();

    return lista.filter((a) => {
      const coincideTexto =
        !query ||
        a.nombre.toLowerCase().includes(query) ||
        a.descripcion.toLowerCase().includes(query);

      const coincideTipo = !tipo || a.tipoActividad === tipo;

      const coincideEdad =
        edad === null || (edad >= a.edadMinima && edad <= a.edadMaxima);

      return coincideTexto && coincideTipo && coincideEdad;
    });
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  protected cargarDatos(): void {
    this.cargando.set(true);
    this.errorGeneral.set(null);

    this.actividadService.listarActividades().subscribe({
      next: (acts) => {
        this.actividades.set(acts);
        this.perfilService.listar().subscribe({
          next: (perfs) => {
            this.perfiles.set(perfs);
            this.cargando.set(false);
          },
          error: () => this.cargando.set(false),
        });
      },
      error: () => {
        this.errorGeneral.set('No se pudo cargar el catálogo de actividades desde el servidor.');
        this.cargando.set(false);
      },
    });
  }

  protected abrirModalAsignar(actividad: Actividad): void {
    this.actividadSeleccionada.set(actividad);
    this.formAsignar.reset({ perfilId: this.perfiles()[0]?.id || '' });
    this.modalAsignarAbierto.set(true);
  }

  protected cerrarModalAsignar(): void {
    this.modalAsignarAbierto.set(false);
    this.actividadSeleccionada.set(null);
  }

  protected confirmarAsignacion(): void {
    if (this.formAsignar.invalid) return;

    const actividad = this.actividadSeleccionada();
    const { perfilId } = this.formAsignar.getRawValue();
    if (!actividad || !perfilId) return;

    this.guardando.set(true);
    this.errorGeneral.set(null);

    this.actividadService.asignarActividad(perfilId, actividad.id).subscribe({
      next: (asignacion) => {
        this.guardando.set(false);
        this.cerrarModalAsignar();
        this.mensajeExito.set(`¡Actividad "${actividad.nombre}" asignada con éxito!`);
        setTimeout(() => this.mensajeExito.set(null), 4000);
      },
      error: (err) => {
        this.guardando.set(false);
        const mensaje =
          err.status === 409 || err.error?.mensaje?.includes('ya se encuentra asignada')
            ? 'Esta actividad ya está asignada a este infante.'
            : 'No se pudo realizar la asignación. Intenta nuevamente.';
        this.errorGeneral.set(mensaje);
        setTimeout(() => this.errorGeneral.set(null), 4000);
      },
    });
  }

  protected jugarConPerfil(actividad: Actividad): void {
    const listaPerfiles = this.perfiles();
    if (listaPerfiles.length === 0) {
      this.router.navigate(['/perfiles']);
      return;
    }

    // Si solo hay un perfil registrado, asigna (si es necesario) y abre directamente la zona de juegos
    const primerPerfil = listaPerfiles[0];
    this.actividadService.asignarActividad(primerPerfil.id, actividad.id).subscribe({
      next: (asig) => {
        // Abrir exactamente la asignación devuelta por el backend.
        this.router.navigate(['/zona-juegos', primerPerfil.id, asig.id]);
      },
      error: (err) => {
        // Si la actividad ya estaba asignada (por ejemplo, HTTP 409),
        // recuperar su asignación existente en lugar de abrir el selector
        // sin una actividad seleccionada.
        this.actividadService.listarAsignaciones(primerPerfil.id).subscribe({
          next: (asignaciones) => {
            const existente = asignaciones.find(
              (asig) => asig.actividadId === actividad.id
            );

            if (existente) {
              this.router.navigate(['/zona-juegos', primerPerfil.id, existente.id]);
              return;
            }

            // No ocultar un error real enviando al usuario a una actividad
            // diferente. Volver al catálogo y mostrar un mensaje claro.
            this.errorGeneral.set(
              err?.status === 409
                ? 'La actividad ya existe, pero no se encontró su asignación. Actualiza el catálogo e inténtalo de nuevo.'
                : 'No se pudo abrir esta actividad. Intenta nuevamente.'
            );
            setTimeout(() => this.errorGeneral.set(null), 5000);
          },
          error: () => {
            this.errorGeneral.set('No se pudo consultar la asignación de esta actividad.');
            setTimeout(() => this.errorGeneral.set(null), 5000);
          },
        });
      },
    });
  }

  protected salir(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
