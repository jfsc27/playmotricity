import { Component, OnInit, inject, signal } from '@angular/core';
import { Auth } from '../../services/auth';
import { ResumenDocente, ResumenPadre, RolService } from '../../services/rol';

/** Tarjeta con los datos propios del rol en sesion (docente o padre/acudiente). */
@Component({
  selector: 'app-info-rol',
  templateUrl: './info-rol.html',
  styleUrl: './info-rol.scss',
})
export class InfoRol implements OnInit {
  protected readonly auth = inject(Auth);
  private readonly rolService = inject(RolService);

  protected readonly docente = signal<ResumenDocente | null>(null);
  protected readonly padre = signal<ResumenPadre | null>(null);
  protected readonly error = signal(false);

  ngOnInit(): void {
    if (this.auth.tieneRol('DOCENTE')) {
      this.rolService.resumenDocente().subscribe({
        next: (r) => this.docente.set(r),
        error: () => this.error.set(true),
      });
    } else if (this.auth.tieneRol('PADRE')) {
      this.rolService.resumenPadre().subscribe({
        next: (r) => this.padre.set(r),
        error: () => this.error.set(true),
      });
    }
  }
}
