import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="sidebar" [class.sidebar--collapsed]="collapsed()">
      <div class="sidebar-header">
        <div class="sidebar-brand">
          <div class="brand-icon">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="20" r="8" fill="#F28B30" opacity="0.9"/>
              <circle cx="15" cy="34" r="5" fill="#4CAF7D" opacity="0.8"/>
              <circle cx="33" cy="34" r="5" fill="#4A90D9" opacity="0.8"/>
            </svg>
          </div>
          @if (!collapsed()) {
            <span class="brand-text">PlayMotricity</span>
          }
        </div>
        <button class="sidebar-toggle" (click)="toggleCollapsed()" aria-label="Colapsar menú lateral">
          <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
            @if (collapsed()) {
              <path fill-rule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
              <path fill-rule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
            } @else {
              <path fill-rule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
              <path fill-rule="evenodd" d="M9.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
            }
          </svg>
        </button>
      </div>

      <ul class="sidebar-nav">
        <!-- 1. Panel principal -->
        <li class="nav-item" routerLink="/inicio" routerLinkActive="nav-item--active" [routerLinkActiveOptions]="{ exact: true }">
          <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
          </svg>
          @if (!collapsed()) { <span>Panel principal</span> }
        </li>

        <!-- 2. Perfiles infantiles -->
        <li class="nav-item" routerLink="/perfiles" routerLinkActive="nav-item--active">
          <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
          </svg>
          @if (!collapsed()) { <span>{{ esDocente() ? 'Perfiles infantiles' : 'Mi hijo/a' }}</span> }
        </li>

        <!-- 3. Actividades -->
        <li class="nav-item" routerLink="/actividades" routerLinkActive="nav-item--active">
          <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
          </svg>
          @if (!collapsed()) { <span>{{ esDocente() ? 'Actividades' : 'Actividades asignadas' }}</span> }
        </li>

        <!-- 4. Reportes / Progreso -->
        <li class="nav-item" routerLink="/progreso" routerLinkActive="nav-item--active">
          <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
            <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          @if (!collapsed()) { <span>{{ esDocente() ? 'Reportes' : 'Progreso' }}</span> }
        </li>

        <!-- 5. Mi Perfil (NUEVA PESTAÑA requerida por el usuario) -->
        <li class="nav-item" routerLink="/perfil" routerLinkActive="nav-item--active">
          <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"/>
          </svg>
          @if (!collapsed()) { <span>Mi perfil</span> }
        </li>
      </ul>

      <div class="sidebar-footer">
        <button class="nav-item nav-item--logout" (click)="salir()">
          <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
            <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"/>
          </svg>
          @if (!collapsed()) { <span>Cerrar sesión</span> }
        </button>
      </div>
    </nav>
  `,
  styles: [`
    :host {
      display: contents;
    }

    .sidebar {
      width: 260px;
      background: var(--pm-surface);
      border-right: 1px solid var(--pm-border);
      display: flex;
      flex-direction: column;
      transition: width var(--pm-transition);
      flex-shrink: 0;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
      z-index: 20;

      &--collapsed {
        width: 72px;

        .brand-text,
        .nav-item span {
          display: none;
        }

        .sidebar-header {
          justify-content: center;
          padding: 1.25rem 0.5rem;
        }

        .sidebar-brand {
          display: none;
        }

        .nav-item {
          justify-content: center;
          padding: 0.75rem;
        }
      }
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--pm-border);
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .brand-icon {
      width: 36px;
      height: 36px;
      flex-shrink: 0;

      svg {
        width: 100%;
        height: 100%;
      }
    }

    .brand-text {
      font-family: var(--pm-font-heading);
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--pm-text);
      letter-spacing: -0.02em;
    }

    .sidebar-toggle {
      background: none;
      border: none;
      color: var(--pm-text-muted);
      cursor: pointer;
      padding: 0.35rem;
      border-radius: var(--pm-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color var(--pm-transition), background var(--pm-transition);

      &:hover {
        color: var(--pm-text);
        background: var(--pm-warm-hover);
      }
    }

    .sidebar-nav {
      list-style: none;
      margin: 0;
      padding: 1rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      flex: 1;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.7rem 1rem;
      border-radius: var(--pm-radius-md);
      color: var(--pm-text-soft);
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      transition: color var(--pm-transition), background var(--pm-transition), transform 0.15s ease;

      svg {
        flex-shrink: 0;
      }

      &:hover {
        color: var(--pm-orange);
        background: var(--pm-orange-light);
        transform: translateX(3px);
      }

      &--active {
        color: var(--pm-orange);
        background: var(--pm-orange-light);
        font-weight: 700;
      }

      &--logout {
        width: 100%;
        border: none;
        background: none;
        font-family: inherit;
        color: var(--pm-text-muted);

        &:hover {
          color: var(--pm-coral);
          background: #FDEDED;
          transform: none;
        }
      }
    }

    .sidebar-footer {
      padding: 1rem 0.75rem;
      border-top: 1px solid var(--pm-border);
    }
  `]
})
export class SidebarComponent {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  readonly collapsed = signal(false);
  readonly esDocente = computed(() => this.auth.usuario()?.rol === 'DOCENTE');

  toggleCollapsed(): void {
    this.collapsed.set(!this.collapsed());
  }

  salir(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
