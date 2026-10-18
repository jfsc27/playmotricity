import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PerfilInfantil {
  id: string;
  nombre: string;
  fechaNacimiento: string; // ISO YYYY-MM-DD
  edad: number;
  grupoGrado?: string;
  fechaRegistro: string;
  fotoPerfil?: string;
}

export interface CrearPerfilDTO {
  nombre: string;
  fechaNacimiento: string;
  grupoGrado?: string;
  fotoPerfil?: string;
}

export interface ActualizarPerfilDTO {
  nombre: string;
  fechaNacimiento: string;
  grupoGrado?: string;
  fotoPerfil?: string;
}

export interface InfoReglaEdad {
  edad: number;
  valida: boolean;
  etapa: string;
  colorEtapa: 'orange' | 'green' | 'blue' | 'purple' | 'danger';
  mensaje: string;
}

@Injectable({
  providedIn: 'root',
})
export class PerfilService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/perfiles';

  /**
   * Obtiene todos los perfiles infantiles vinculados al usuario autenticado.
   */
  listar(): Observable<PerfilInfantil[]> {
    return this.http.get<PerfilInfantil[]>(this.apiUrl);
  }

  /**
   * Obtiene el detalle de un perfil infantil por su identificador único.
   */
  obtener(id: string): Observable<PerfilInfantil> {
    return this.http.get<PerfilInfantil>(`${this.apiUrl}/${id}`);
  }

  /**
   * Registra un nuevo perfil infantil vinculado al usuario en sesión.
   */
  crear(dto: CrearPerfilDTO): Observable<PerfilInfantil> {
    return this.http.post<PerfilInfantil>(this.apiUrl, dto);
  }

  /**
   * Actualiza los datos de un perfil infantil existente.
   */
  actualizar(id: string, dto: ActualizarPerfilDTO): Observable<PerfilInfantil> {
    return this.http.put<PerfilInfantil>(`${this.apiUrl}/${id}`, dto);
  }

  /**
   * Actualiza exclusivamente la foto de un perfil infantil.
   */
  actualizarFoto(id: string, fotoPerfil: string): Observable<PerfilInfantil> {
    return this.http.put<PerfilInfantil>(`${this.apiUrl}/${id}/foto`, { fotoPerfil });
  }

  /**
   * Elimina o desvincula un perfil infantil del usuario actual.
   */
  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Calcula la edad en años cumplidos a partir de una fecha de nacimiento (YYYY-MM-DD).
   */
  calcularEdad(fechaNacimientoStr: string): number {
    if (!fechaNacimientoStr) return 0;
    const nacimiento = new Date(fechaNacimientoStr + 'T00:00:00');
    if (isNaN(nacimiento.getTime())) return 0;

    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesDif = hoy.getMonth() - nacimiento.getMonth();

    if (mesDif < 0 || (mesDif === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad >= 0 ? edad : 0;
  }

  /**
   * Evalúa la regla de edad de dominio (PlayMotricity: 2 a 6 años)
   * y retorna metadata diagnóstica pedagógica.
   */
  evaluarReglaEdad(fechaNacimientoStr: string): InfoReglaEdad {
    if (!fechaNacimientoStr) {
      return {
        edad: 0,
        valida: false,
        etapa: 'Sin fecha',
        colorEtapa: 'danger',
        mensaje: 'Ingresa la fecha de nacimiento para verificar la edad.',
      };
    }

    const nacimiento = new Date(fechaNacimientoStr + 'T00:00:00');
    const hoy = new Date();
    if (nacimiento > hoy) {
      return {
        edad: 0,
        valida: false,
        etapa: 'Fecha no válida',
        colorEtapa: 'danger',
        mensaje: 'La fecha de nacimiento no puede ser una fecha futura.',
      };
    }

    const edad = this.calcularEdad(fechaNacimientoStr);

    if (edad < 2) {
      return {
        edad,
        valida: false,
        etapa: 'Menor al rango (< 2 años)',
        colorEtapa: 'danger',
        mensaje:
          'PlayMotricity está diseñado a partir de los 2 años. El niño es aún muy pequeño para las actividades de la plataforma.',
      };
    }

    if (edad > 6) {
      return {
        edad,
        valida: false,
        etapa: 'Mayor al rango (> 6 años)',
        colorEtapa: 'danger',
        mensaje:
          'PlayMotricity está enfocado en la primera infancia (hasta los 6 años). Supera el rango etario establecido.',
      };
    }

    // Clasificación pedagógica por etapa psicomotriz dentro de 2-6 años
    let etapa = '';
    let colorEtapa: 'orange' | 'green' | 'blue' | 'purple' = 'green';

    switch (edad) {
      case 2:
        etapa = 'Exploración Inicial (2 años)';
        colorEtapa = 'orange';
        break;
      case 3:
        etapa = 'Consolidación Motriz (3 años)';
        colorEtapa = 'orange';
        break;
      case 4:
        etapa = 'Desarrollo Dinámico (4 años)';
        colorEtapa = 'green';
        break;
      case 5:
        etapa = 'Coordinación y Destreza (5 años)';
        colorEtapa = 'blue';
        break;
      case 6:
        etapa = 'Transición Escolar (6 años)';
        colorEtapa = 'purple';
        break;
    }

    return {
      edad,
      valida: true,
      etapa,
      colorEtapa,
      mensaje: `Edad válida (${edad} años) dentro del rango de PlayMotricity (2 a 6 años).`,
    };
  }
}
