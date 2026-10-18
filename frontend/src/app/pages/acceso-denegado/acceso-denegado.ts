import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-acceso-denegado',
  imports: [RouterLink],
  template: `
    <main class="denegado">
      <div class="denegado__card">
        <span class="denegado__icono" aria-hidden="true">🔒</span>
        <h1>Acceso denegado</h1>
        <p>
          Tu rol ({{ auth.rol() === 'DOCENTE' ? 'Docente' : 'Padre / Acudiente' }})
          no tiene permisos para ver esta sección.
        </p>
        <a routerLink="/inicio" class="denegado__btn">Volver al panel principal</a>
      </div>
    </main>
  `,
  styles: `
    .denegado {
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: var(--pm-surface);
    }
    .denegado__card {
      max-width: 420px;
      text-align: center;
      background: var(--pm-card);
      border: 1px solid var(--pm-border);
      border-radius: 20px;
      padding: 2.5rem 2rem;
      box-shadow: var(--pm-shadow-md);
    }
    .denegado__icono { font-size: 2.5rem; }
    h1 { margin: 0.75rem 0 0.5rem; color: var(--pm-text); }
    p { margin: 0 0 1.5rem; color: var(--pm-text-soft); }
    .denegado__btn {
      display: inline-block;
      padding: 0.7rem 1.4rem;
      border-radius: 12px;
      background: var(--pm-orange);
      color: #fff;
      font-weight: 700;
      text-decoration: none;
    }
  `,
})
export class AccesoDenegado {
  protected readonly auth = inject(Auth);
}
