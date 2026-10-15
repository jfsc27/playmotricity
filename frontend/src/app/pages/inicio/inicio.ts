import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-inicio',
  template: `
    <main style="padding: 2rem">
      <h1>Hola, {{ auth.usuario()?.nombre }}</h1>
      <p>Rol: {{ auth.usuario()?.rol }}</p>
      <button type="button" (click)="salir()">Cerrar sesión</button>
    </main>
  `,
})
export class Inicio {
  protected readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected salir(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
