import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ResumenDocente {
  nombre: string;
  correo: string;
  institucion: string;
  grupoAsignado?: string;
  perfilesACargo: number;
}

export interface ResumenPadre {
  nombre: string;
  correo: string;
  parentesco: string;
  telefonoContacto?: string;
  perfilesACargo: number;
}

/** Endpoints exclusivos de cada rol (el backend responde 403 si el rol no coincide). */
@Injectable({
  providedIn: 'root',
})
export class RolService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api';

  resumenDocente(): Observable<ResumenDocente> {
    return this.http.get<ResumenDocente>(`${this.apiUrl}/docente/resumen`);
  }

  resumenPadre(): Observable<ResumenPadre> {
    return this.http.get<ResumenPadre>(`${this.apiUrl}/padre/resumen`);
  }
}
