import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

/** Roles de la plataforma; deben coincidir con el enum Rol del backend. */
export type Rol = 'DOCENTE' | 'PADRE';

export const ROLES: readonly Rol[] = ['DOCENTE', 'PADRE'];

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  fotoPerfil?: string;
}

export interface AuthResponse {
  token: string;
  tipo: string;
  expiraEnMs: number;
  usuario: Usuario;
}

export interface RegistroDocenteDTO {
  nombre: string;
  correo: string;
  password: string;
  institucion: string;
  grupoAsignado?: string;
}

export interface RegistroPadreDTO {
  nombre: string;
  correo: string;
  password: string;
  parentesco: string;
  telefonoContacto?: string;
}

const TOKEN_KEY = 'playmotricity_token';
const USER_KEY = 'playmotricity_usuario';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/auth';

  private readonly _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly _usuario = signal<Usuario | null>(this.leerUsuario());

  readonly usuario = this._usuario.asReadonly();
  readonly autenticado = computed(() => this._token() !== null);
  readonly rol = computed<Rol | null>(() => this._usuario()?.rol ?? null);

  /** true si el usuario en sesion tiene alguno de los roles indicados. */
  tieneRol(...roles: Rol[]): boolean {
    const rol = this.rol();
    return rol !== null && roles.includes(rol);
  }

  get token(): string | null {
    return this._token();
  }

  login(correo: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { correo, password })
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  registrarDocente(datos: RegistroDocenteDTO): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register/docente`, datos)
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  registrarPadre(datos: RegistroPadreDTO): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register/padre`, datos)
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  actualizarFotoPerfil(fotoPerfil: string): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/foto`, { fotoPerfil }).pipe(
      tap((u) => {
        const actual = this._usuario();
        if (actual) {
          const actualizado: Usuario = { ...actual, fotoPerfil: u.fotoPerfil || fotoPerfil };
          localStorage.setItem(USER_KEY, JSON.stringify(actualizado));
          this._usuario.set(actualizado);
        }
      })
    );
  }

  refrescarUsuario(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/me`).pipe(
      tap((u) => {
        localStorage.setItem(USER_KEY, JSON.stringify(u));
        this._usuario.set(u);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._usuario.set(null);
  }

  private guardarSesion(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.usuario));
    this._token.set(res.token);
    this._usuario.set(res.usuario);
  }

  private leerUsuario(): Usuario | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as Usuario) : null;
    } catch {
      return null;
    }
  }
}
