import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Auth, Usuario } from '../../services/auth';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { PerfilService } from '../../services/perfil';

interface DatosDocente {
  nombre: string;
  correo: string;
  institucion: string;
  grupoAsignado: string;
  perfilesACargo: number;
}

interface DatosPadre {
  nombre: string;
  correo: string;
  parentesco: string;
  telefonoContacto: string;
  perfilesACargo: number;
}

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent],
  template: `
    <div class="dashboard">
      <!-- Barra lateral unificada y persistente -->
      <app-sidebar />

      <main class="main-content">
        <!-- Top bar superior -->
        <header class="topbar">
          <div class="topbar-left">
            <div class="breadcrumb">
              <a routerLink="/inicio" class="breadcrumb-link">Panel</a>
              <span class="breadcrumb-sep">/</span>
              <span class="breadcrumb-current">Mi Perfil</span>
            </div>
            <h1 class="page-title">Perfil de Usuario</h1>
            <p class="page-subtitle">Información de la cuenta y rol activo en la plataforma</p>
          </div>

          <div class="topbar-right">
            <div class="user-badge">
              <div class="user-avatar" [class]="'user-avatar--' + (auth.usuario()?.rol?.toLowerCase() ?? 'docente')">
                @if (auth.usuario()?.fotoPerfil) {
                  <img [src]="auth.usuario()?.fotoPerfil" alt="Avatar" class="avatar-foto-img" />
                } @else {
                  {{ iniciales() }}
                }
              </div>
              <div class="user-info">
                <span class="user-name">{{ usuario()?.nombre }}</span>
                <span class="user-role">{{ rolLabel() }}</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Mensajes de feedback -->
        @if (mensajeFoto()) {
          <div class="alert alert--success" style="padding: 1rem 1.5rem; background: #ecfdf5; border: 2px solid #10b981; border-radius: 1.5rem; color: #065f46; font-weight: 700; margin-bottom: 1rem;">
            <span>✨ {{ mensajeFoto() }}</span>
          </div>
        }
        @if (errorFoto()) {
          <div class="alert alert--error" style="padding: 1rem 1.5rem; background: #fef2f2; border: 2px solid #ef4444; border-radius: 1.5rem; color: #991b1b; font-weight: 700; margin-bottom: 1rem;">
            <span>⚠️ {{ errorFoto() }}</span>
          </div>
        }

        <!-- Contenido principal del perfil -->
        <section class="perfil-body">
          <!-- Tarjeta de Identidad Principal -->
          <div class="perfil-hero-card">
            <div class="hero-avatar-area">
              <div class="hero-avatar" [class]="'hero-avatar--' + (auth.usuario()?.rol?.toLowerCase() ?? 'docente')">
                @if (auth.usuario()?.fotoPerfil) {
                  <img [src]="auth.usuario()?.fotoPerfil" alt="Foto de perfil" class="avatar-foto-img" />
                } @else {
                  {{ iniciales() }}
                }
              </div>

              <div class="foto-controles">
                <label class="btn-foto-accion" title="Seleccionar foto de perfil">
                  <span>{{ subiendoFoto() ? 'Subiendo…' : '📷 ' + (auth.usuario()?.fotoPerfil ? 'Cambiar foto' : 'Subir foto') }}</span>
                  <input type="file" accept="image/*" class="input-archivo-oculto" (change)="onSeleccionarFotoUsuario($event)" [disabled]="subiendoFoto()" />
                </label>
                @if (auth.usuario()?.fotoPerfil) {
                  <button type="button" class="btn-foto-quitar" (click)="quitarFotoUsuario()" [disabled]="subiendoFoto()">
                    ✕ Quitar
                  </button>
                }
              </div>

              <div class="hero-badge-rol">
                <span>{{ esDocente() ? '🎓 Docente Educador' : '🏡 Padre / Acudiente' }}</span>
              </div>
            </div>

            <div class="hero-detalles">
              <h2 class="hero-nombre">{{ usuario()?.nombre }}</h2>
              <p class="hero-correo">✉️ {{ usuario()?.correo }}</p>
              <div class="hero-chips">
                <span class="chip-sesion">🟢 Sesión Activa (JWT)</span>
                <span class="chip-rol">{{ rolLabel() }}</span>
              </div>
            </div>
          </div>

          <!-- Cuadrícula de Datos Detallados -->
          <div class="datos-grid">
            <!-- Bloque 1: Datos de Cuenta -->
            <div class="info-card">
              <div class="card-header">
                <span class="card-icon">🔐</span>
                <h3>Información de Cuenta</h3>
              </div>
              <div class="card-list">
                <div class="list-item">
                  <span class="item-label">ID de Usuario:</span>
                  <span class="item-val item-mono">{{ usuario()?.id }}</span>
                </div>
                <div class="list-item">
                  <span class="item-label">Correo Electrónico:</span>
                  <span class="item-val">{{ usuario()?.correo }}</span>
                </div>
                <div class="list-item">
                  <span class="item-label">Rol del Sistema:</span>
                  <span class="item-val tag-rol">{{ usuario()?.rol }}</span>
                </div>
                <div class="list-item">
                  <span class="item-label">Estado de Autenticación:</span>
                  <span class="item-val estado-conectado">Conectado a Neon PostgreSQL</span>
                </div>
              </div>
            </div>

            <!-- Bloque 2: Información Específica según Rol -->
            <div class="info-card info-card--destacada">
              <div class="card-header">
                <span class="card-icon">{{ esDocente() ? '🏫' : '👨‍👩‍👧' }}</span>
                <h3>{{ esDocente() ? 'Datos Institucionales' : 'Datos del Acudiente' }}</h3>
              </div>

              @if (cargando()) {
                <div class="cargando-box">
                  <div class="spinner"></div>
                  <span>Cargando datos del perfil...</span>
                </div>
              } @else {
                <div class="card-list">
                  @if (esDocente()) {
                    <div class="list-item">
                      <span class="item-label">Institución Educativa:</span>
                      <span class="item-val">{{ datosDocente()?.institucion || 'Colegio PlayMotricity' }}</span>
                    </div>
                    <div class="list-item">
                      <span class="item-label">Grupo / Grado Asignado:</span>
                      <span class="item-val">{{ datosDocente()?.grupoAsignado || 'Preescolar / Transición' }}</span>
                    </div>
                    <div class="list-item">
                      <span class="item-label">Estudiantes a Cargo:</span>
                      <span class="item-val badge-conteo">{{ datosDocente()?.perfilesACargo ?? totalPerfiles() }} niños</span>
                    </div>
                  } @else {
                    <div class="list-item">
                      <span class="item-label">Parentesco:</span>
                      <span class="item-val">{{ datosPadre()?.parentesco || 'Padre / Madre de Familia' }}</span>
                    </div>
                    <div class="list-item">
                      <span class="item-label">Teléfono de Contacto:</span>
                      <span class="item-val">{{ datosPadre()?.telefonoContacto || 'No registrado' }}</span>
                    </div>
                    <div class="list-item">
                      <span class="item-label">Hijos a Cargo:</span>
                      <span class="item-val badge-conteo">{{ datosPadre()?.perfilesACargo ?? totalPerfiles() }} niños</span>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Acciones Rápidas -->
          <div class="acciones-perfil">
            <button class="btn btn--secondary" routerLink="/inicio">
              ⬅️ Volver al Panel
            </button>
            <button class="btn btn--primary" routerLink="/perfiles">
              👶 Gestionar Perfiles Infantiles
            </button>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    @use '../inicio/inicio.scss';

    .perfil-body {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      max-width: 1000px;
      margin: 0 auto;
      width: 100%;
    }

    .perfil-hero-card {
      background: linear-gradient(135deg, #FFF8EE 0%, #FFFFFF 100%);
      border: 3px solid var(--pm-orange);
      border-radius: 2.8rem;
      padding: 2.5rem;
      box-shadow: 0 16px 40px rgba(242, 139, 48, 0.12);
      display: flex;
      align-items: center;
      gap: 2.5rem;
      flex-wrap: wrap;
    }

    .hero-avatar-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.8rem;
    }

    .hero-avatar {
      width: 110px;
      height: 110px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.8rem;
      font-weight: 900;
      color: #fff;
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);

      &--docente {
        background: linear-gradient(135deg, var(--pm-orange) 0%, #D97706 100%);
      }

      &--padre {
        background: linear-gradient(135deg, var(--pm-blue) 0%, #2563EB 100%);
      }
    }

    .avatar-foto-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .foto-controles {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      margin: 0.25rem 0;
    }

    .btn-foto-accion {
      background: #fff;
      border: 2px solid var(--pm-orange);
      color: var(--pm-orange);
      padding: 0.35rem 0.9rem;
      border-radius: 1.5rem;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      transition: all 0.2s ease;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

      &:hover {
        background: var(--pm-orange);
        color: #fff;
        transform: translateY(-1px);
      }
    }

    .btn-foto-quitar {
      background: #fef2f2;
      border: 1px solid #f87171;
      color: #b91c1c;
      padding: 0.35rem 0.65rem;
      border-radius: 1.5rem;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: #fee2e2;
      }
    }

    .input-archivo-oculto {
      display: none;
    }

    .hero-badge-rol {
      background: #fff;
      border: 2px solid var(--pm-border);
      border-radius: var(--pm-radius-full);
      padding: 0.4rem 1.2rem;
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--pm-text);
      box-shadow: var(--pm-shadow-sm);
    }

    .hero-detalles {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
    }

    .hero-nombre {
      font-size: 2.2rem;
      font-weight: 900;
      color: var(--pm-text);
      letter-spacing: -0.02em;
      margin: 0;
    }

    .hero-correo {
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--pm-text-soft);
      margin: 0;
    }

    .hero-chips {
      display: flex;
      gap: 0.8rem;
      margin-top: 0.5rem;
      flex-wrap: wrap;
    }

    .chip-sesion {
      background: #E8F5EE;
      color: var(--pm-green-dark);
      padding: 0.4rem 1rem;
      border-radius: var(--pm-radius-full);
      font-size: 0.9rem;
      font-weight: 800;
      border: 1px solid var(--pm-green);
    }

    .chip-rol {
      background: var(--pm-orange-light);
      color: var(--pm-orange-dark);
      padding: 0.4rem 1rem;
      border-radius: var(--pm-radius-full);
      font-size: 0.9rem;
      font-weight: 800;
      border: 1px solid var(--pm-orange);
    }

    .datos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      gap: 1.5rem;
    }

    .info-card {
      background: #FFFFFF;
      border: 2px solid var(--pm-border);
      border-radius: 2.2rem;
      padding: 2rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;

      &--destacada {
        border-color: #BFDBFE;
        background: linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%);
      }
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 0.8rem;

      .card-icon {
        font-size: 1.8rem;
      }

      h3 {
        font-size: 1.35rem;
        font-weight: 900;
        color: var(--pm-text);
        margin: 0;
      }
    }

    .card-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--pm-border);
      gap: 1rem;
    }

    .item-label {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--pm-text-soft);
    }

    .item-val {
      font-size: 1rem;
      font-weight: 800;
      color: var(--pm-text);
      text-align: right;
    }

    .item-mono {
      font-family: monospace;
      font-size: 0.85rem;
      color: var(--pm-text-soft);
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tag-rol {
      background: #EFF6FF;
      color: #1D4ED8;
      padding: 0.25rem 0.75rem;
      border-radius: var(--pm-radius-full);
      font-size: 0.85rem;
    }

    .estado-conectado {
      color: var(--pm-green-dark);
      font-size: 0.9rem;
    }

    .badge-conteo {
      background: var(--pm-green-light);
      color: var(--pm-green-dark);
      padding: 0.35rem 1rem;
      border-radius: var(--pm-radius-full);
      font-size: 0.95rem;
      border: 1px solid var(--pm-green);
    }

    .cargando-box {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      color: var(--pm-text-soft);
      font-weight: 700;
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid var(--pm-border);
      border-top-color: var(--pm-orange);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .acciones-perfil {
      display: flex;
      gap: 1.25rem;
      justify-content: flex-end;
      flex-wrap: wrap;
    }
  `]
})
export class MiPerfil implements OnInit {
  protected readonly auth = inject(Auth);
  private readonly http = inject(HttpClient);
  private readonly perfilService = inject(PerfilService);

  protected readonly usuario = computed(() => this.auth.usuario());
  protected readonly esDocente = computed(() => this.auth.usuario()?.rol === 'DOCENTE');
  protected readonly rolLabel = computed(() => (this.esDocente() ? 'Docente' : 'Padre / Acudiente'));

  protected readonly datosDocente = signal<DatosDocente | null>(null);
  protected readonly datosPadre = signal<DatosPadre | null>(null);
  protected readonly totalPerfiles = signal<number>(0);
  protected readonly cargando = signal(true);
  protected readonly subiendoFoto = signal(false);
  protected readonly mensajeFoto = signal<string | null>(null);
  protected readonly errorFoto = signal<string | null>(null);

  protected readonly iniciales = computed(() => {
    const nombre = this.usuario()?.nombre ?? '';
    return nombre
      .split(' ')
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('');
  });

  protected onSeleccionarFotoUsuario(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const archivo = input.files[0];
    this.procesarYSubirFoto(archivo);
  }

  protected quitarFotoUsuario(): void {
    this.subiendoFoto.set(true);
    this.errorFoto.set(null);
    this.auth.actualizarFotoPerfil('').subscribe({
      next: () => {
        this.subiendoFoto.set(false);
        this.mensajeFoto.set('Foto de perfil eliminada. Ahora se muestran tus iniciales.');
        setTimeout(() => this.mensajeFoto.set(null), 4000);
      },
      error: () => {
        this.subiendoFoto.set(false);
        this.errorFoto.set('No se pudo quitar la foto de perfil.');
      },
    });
  }

  private procesarYSubirFoto(archivo: File): void {
    this.subiendoFoto.set(true);
    this.errorFoto.set(null);

    const lector = new FileReader();
    lector.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 300;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const base64Optimizada = canvas.toDataURL('image/jpeg', 0.85);

          this.auth.actualizarFotoPerfil(base64Optimizada).subscribe({
            next: () => {
              this.subiendoFoto.set(false);
              this.mensajeFoto.set('¡Foto de perfil actualizada exitosamente!');
              setTimeout(() => this.mensajeFoto.set(null), 4000);
            },
            error: () => {
              this.subiendoFoto.set(false);
              this.errorFoto.set('No se pudo guardar la imagen en el servidor.');
            },
          });
        }
      };
      img.src = e.target?.result as string;
    };
    lector.readAsDataURL(archivo);
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  private cargarDatos(): void {
    this.cargando.set(true);

    // Cargar conteo de perfiles infantiles
    this.perfilService.listar().subscribe({
      next: (lista) => this.totalPerfiles.set(lista.length),
      error: () => this.totalPerfiles.set(0),
    });

    // Cargar resumen según el rol
    if (this.esDocente()) {
      this.http.get<DatosDocente>('/api/docente/resumen').subscribe({
        next: (res) => {
          this.datosDocente.set(res);
          this.cargando.set(false);
        },
        error: () => this.cargando.set(false),
      });
    } else {
      this.http.get<DatosPadre>('/api/padre/resumen').subscribe({
        next: (res) => {
          this.datosPadre.set(res);
          this.cargando.set(false);
        },
        error: () => this.cargando.set(false),
      });
    }
  }
}
