import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { PerfilService } from '../../services/perfil';
import { ActividadService } from '../../services/actividad';
import { InfoRol } from '../../components/info-rol/info-rol';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink, InfoRol, SidebarComponent],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio implements OnInit {
  protected readonly auth = inject(Auth);
  private readonly perfilService = inject(PerfilService);
  private readonly actividadService = inject(ActividadService);
  private readonly router = inject(Router);

  protected readonly sidebarCollapsed = signal(false);
  protected readonly conteoPerfiles = signal<number>(0);
  protected readonly conteoActividades = signal<number>(0);

  protected readonly esDocente = computed(
    () => this.auth.usuario()?.rol === 'DOCENTE'
  );

  protected readonly rolLabel = computed(() => {
    const rol = this.auth.usuario()?.rol;
    return rol === 'DOCENTE' ? 'Docente' : 'Padre / Acudiente';
  });

  protected readonly iniciales = computed(() => {
    const nombre = this.auth.usuario()?.nombre ?? '';
    return nombre
      .split(' ')
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('');
  });

  protected readonly saludo = computed(() => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 18) return 'Buenas tardes';
    return 'Buenas noches';
  });

  ngOnInit(): void {
    this.perfilService.listar().subscribe({
      next: (perfiles) => this.conteoPerfiles.set(perfiles.length),
      error: () => this.conteoPerfiles.set(0),
    });

    this.actividadService.listarActividades().subscribe({
      next: (acts) => this.conteoActividades.set(acts.length),
      error: () => this.conteoActividades.set(0),
    });
  }

  protected irAPerfiles(): void {
    this.router.navigate(['/perfiles']);
  }

  protected salir(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
