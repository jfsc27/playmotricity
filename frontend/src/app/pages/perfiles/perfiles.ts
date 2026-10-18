import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Auth } from '../../services/auth';
import { InfoReglaEdad, PerfilInfantil, PerfilService } from '../../services/perfil';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-perfiles',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SidebarComponent],
  templateUrl: './perfiles.html',
  styleUrl: './perfiles.scss',
})
export class Perfiles implements OnInit {
  protected readonly auth = inject(Auth);
  private readonly perfilService = inject(PerfilService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // Estados de navegación y carga
  protected readonly sidebarCollapsed = signal(false);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly eliminando = signal(false);
  protected readonly errorGeneral = signal<string | null>(null);
  protected readonly errorFormulario = signal<string | null>(null);
  protected readonly mensajeExito = signal<string | null>(null);

  // Lista de perfiles y filtros
  protected readonly perfiles = signal<PerfilInfantil[]>([]);
  protected readonly busqueda = signal('');
  protected readonly edadFiltro = signal<number | null>(null); // null = todas

  // Modales
  protected readonly modalFormAbierto = signal(false);
  protected readonly modoEdicion = signal(false);
  protected readonly idPerfilEdicion = signal<string | null>(null);
  protected readonly modalEliminarAbierto = signal(false);
  protected readonly perfilAEliminar = signal<PerfilInfantil | null>(null);

  // Formulario reactivo
  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    fechaNacimiento: ['', [Validators.required]],
    grupoGrado: [''],
  });

  // Información calculada de la regla de edad en tiempo real
  protected readonly evaluacionEdad = signal<InfoReglaEdad>({
    edad: 0,
    valida: false,
    etapa: 'Sin fecha',
    colorEtapa: 'danger',
    mensaje: 'Ingresa la fecha de nacimiento para verificar la edad.',
  });

  // Role info
  protected readonly esDocente = computed(
    () => this.auth.usuario()?.rol === 'DOCENTE'
  );

  protected readonly rolLabel = computed(() => {
    const rol = this.auth.usuario()?.rol;
    return rol === 'DOCENTE' ? 'Docente' : 'Padre / Acudiente';
  });

  protected readonly inicialesUsuario = computed(() => {
    const nombre = this.auth.usuario()?.nombre ?? '';
    return nombre
      .split(' ')
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('');
  });

  // Lista filtrada
  protected readonly perfilesFiltrados = computed(() => {
    const lista = this.perfiles();
    const query = this.busqueda().trim().toLowerCase();
    const filtroEdad = this.edadFiltro();

    return lista.filter((p) => {
      const coincideTexto =
        !query ||
        p.nombre.toLowerCase().includes(query) ||
        (p.grupoGrado && p.grupoGrado.toLowerCase().includes(query));

      const coincideEdad = filtroEdad === null || p.edad === filtroEdad;

      return coincideTexto && coincideEdad;
    });
  });

  // Métricas rápidas
  protected readonly totalPerfiles = computed(() => this.perfiles().length);

  protected readonly promedioEdad = computed(() => {
    const lista = this.perfiles();
    if (lista.length === 0) return 0;
    const suma = lista.reduce((acc, p) => acc + p.edad, 0);
    return Math.round((suma / lista.length) * 10) / 10;
  });

  ngOnInit(): void {
    this.cargarPerfiles();

    // Escuchar cambios en fechaNacimiento para evaluación inmediata de la regla de edad
    this.form.controls.fechaNacimiento.valueChanges.subscribe((fecha) => {
      this.evaluacionEdad.set(this.perfilService.evaluarReglaEdad(fecha));
    });
  }

  protected cargarPerfiles(): void {
    this.cargando.set(true);
    this.errorGeneral.set(null);

    this.perfilService.listar().subscribe({
      next: (lista) => {
        this.perfiles.set(lista);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.errorGeneral.set(
          err.status === 401
            ? 'Tu sesión ha expirado. Por favor ingresa nuevamente.'
            : 'No se pudieron cargar los perfiles infantiles desde el servidor.'
        );
      },
    });
  }

  // Apertura de modales
  protected abrirModalCrear(): void {
    this.modoEdicion.set(false);
    this.idPerfilEdicion.set(null);
    this.errorFormulario.set(null);
    this.form.reset({
      nombre: '',
      fechaNacimiento: '',
      grupoGrado: '',
    });
    this.evaluacionEdad.set({
      edad: 0,
      valida: false,
      etapa: 'Sin fecha',
      colorEtapa: 'danger',
      mensaje: 'Ingresa la fecha de nacimiento para verificar la edad.',
    });
    this.modalFormAbierto.set(true);
  }

  protected abrirModalEditar(perfil: PerfilInfantil): void {
    this.modoEdicion.set(true);
    this.idPerfilEdicion.set(perfil.id);
    this.errorFormulario.set(null);
    this.form.setValue({
      nombre: perfil.nombre,
      fechaNacimiento: perfil.fechaNacimiento,
      grupoGrado: perfil.grupoGrado || '',
    });
    this.evaluacionEdad.set(this.perfilService.evaluarReglaEdad(perfil.fechaNacimiento));
    this.modalFormAbierto.set(true);
  }

  protected cerrarModalForm(): void {
    this.modalFormAbierto.set(false);
    this.errorFormulario.set(null);
  }

  // Guardar (Crear o Actualizar)
  protected guardarPerfil(): void {
    this.errorFormulario.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { nombre, fechaNacimiento, grupoGrado } = this.form.getRawValue();

    // Verificación de la Regla de Edad en el cliente antes de llamar al backend
    const evalEdad = this.perfilService.evaluarReglaEdad(fechaNacimiento);
    if (!evalEdad.valida) {
      this.errorFormulario.set(evalEdad.mensaje);
      return;
    }

    this.guardando.set(true);

    if (this.modoEdicion()) {
      const id = this.idPerfilEdicion()!;
      this.perfilService.actualizar(id, { nombre, fechaNacimiento, grupoGrado }).subscribe({
        next: (actualizado) => {
          this.guardando.set(false);
          this.perfiles.update((lista) =>
            lista.map((p) => (p.id === id ? actualizado : p))
          );
          this.cerrarModalForm();
          this.mostrarNotificacion(`Perfil de "${actualizado.nombre}" actualizado correctamente.`);
        },
        error: (err: HttpErrorResponse) => {
          this.guardando.set(false);
          this.manejarErrorServidor(err);
        },
      });
    } else {
      this.perfilService.crear({ nombre, fechaNacimiento, grupoGrado }).subscribe({
        next: (creado) => {
          this.guardando.set(false);
          this.perfiles.update((lista) => [creado, ...lista]);
          this.cerrarModalForm();
          this.mostrarNotificacion(`¡Perfil de "${creado.nombre}" registrado exitosamente!`);
        },
        error: (err: HttpErrorResponse) => {
          this.guardando.set(false);
          this.manejarErrorServidor(err);
        },
      });
    }
  }

  // Eliminación
  protected abrirModalEliminar(perfil: PerfilInfantil): void {
    this.perfilAEliminar.set(perfil);
    this.modalEliminarAbierto.set(true);
  }

  protected cerrarModalEliminar(): void {
    this.modalEliminarAbierto.set(false);
    this.perfilAEliminar.set(null);
  }

  protected ejecutarEliminar(): void {
    const perfil = this.perfilAEliminar();
    if (!perfil) return;

    this.eliminando.set(true);
    this.perfilService.eliminar(perfil.id).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.perfiles.update((lista) => lista.filter((p) => p.id !== perfil.id));
        this.cerrarModalEliminar();
        this.mostrarNotificacion(`Perfil de "${perfil.nombre}" eliminado correctamente.`);
      },
      error: () => {
        this.eliminando.set(false);
        this.errorGeneral.set('No se pudo eliminar el perfil. Intenta nuevamente.');
        this.cerrarModalEliminar();
      },
    });
  }

  private manejarErrorServidor(err: HttpErrorResponse): void {
    if (err.status === 400 && err.error?.mensaje) {
      this.errorFormulario.set(err.error.mensaje);
    } else {
      this.errorFormulario.set(
        'Ocurrió un error al procesar el perfil en el servidor. Verifica los datos e intenta nuevamente.'
      );
    }
  }

  private mostrarNotificacion(msg: string): void {
    this.mensajeExito.set(msg);
    setTimeout(() => {
      this.mensajeExito.set(null);
    }, 4000);
  }

  // Helpers de presentación visual
  protected obtenerAvatarGradiente(nombre: string): string {
    const paletas = [
      'linear-gradient(135deg, #F28B30 0%, #E8685A 100%)',
      'linear-gradient(135deg, #4CAF7D 0%, #2E7D52 100%)',
      'linear-gradient(135deg, #4A90D9 0%, #8B6FC0 100%)',
      'linear-gradient(135deg, #E8685A 0%, #F5C842 100%)',
      'linear-gradient(135deg, #8B6FC0 0%, #4CAF7D 100%)',
    ];
    let hash = 0;
    for (let i = 0; i < nombre.length; i++) {
      hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % paletas.length;
    return paletas[index];
  }

  protected obtenerIniciales(nombre: string): string {
    return nombre
      .split(' ')
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('');
  }

  protected obtenerEtapaMotriz(edad: number): string {
    switch (edad) {
      case 2:
        return 'Exploración Inicial';
      case 3:
        return 'Consolidación Motriz';
      case 4:
        return 'Desarrollo Dinámico';
      case 5:
        return 'Coordinación y Destreza';
      case 6:
        return 'Transición Escolar';
      default:
        return 'Desarrollo Infantil';
    }
  }

  protected formatearFecha(fechaIso: string): string {
    if (!fechaIso) return '';
    try {
      const [year, month, day] = fechaIso.split('-');
      const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];
      return `${parseInt(day, 10)} de ${meses[parseInt(month, 10) - 1]}, ${year}`;
    } catch {
      return fechaIso;
    }
  }

  protected salir(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
