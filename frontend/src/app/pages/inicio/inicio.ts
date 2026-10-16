import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio {
  protected readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected readonly sidebarCollapsed = signal(false);

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

  protected salir(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
