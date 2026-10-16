import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Auth, RegistroDocenteDTO, RegistroPadreDTO } from '../../services/auth';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected readonly rolSeleccionado = signal<'DOCENTE' | 'PADRE'>('DOCENTE');
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly exito = signal(false);
  protected readonly mostrarPassword = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    institucion: [''],
    grupoAsignado: [''],
    parentesco: ['PADRE'],
    telefonoContacto: [''],
  });

  protected seleccionarRol(rol: 'DOCENTE' | 'PADRE'): void {
    this.rolSeleccionado.set(rol);
    this.error.set(null);
  }

  protected enviar(): void {
    this.error.set(null);

    const nombreControl = this.form.controls.nombre;
    const correoControl = this.form.controls.correo;
    const passwordControl = this.form.controls.password;

    nombreControl.markAsTouched();
    correoControl.markAsTouched();
    passwordControl.markAsTouched();

    if (nombreControl.invalid || correoControl.invalid || passwordControl.invalid) {
      return;
    }

    const rol = this.rolSeleccionado();

    if (rol === 'DOCENTE') {
      const instControl = this.form.controls.institucion;
      instControl.markAsTouched();
      if (!instControl.value || instControl.value.trim().length === 0) {
        this.error.set('La institución educativa es obligatoria para docentes');
        return;
      }

      this.cargando.set(true);
      const dto: RegistroDocenteDTO = {
        nombre: this.form.controls.nombre.value.trim(),
        correo: this.form.controls.correo.value.trim().toLowerCase(),
        password: this.form.controls.password.value,
        institucion: this.form.controls.institucion.value.trim(),
        grupoAsignado: this.form.controls.grupoAsignado.value.trim() || undefined,
      };

      this.auth.registrarDocente(dto).subscribe({
        next: () => {
          this.cargando.set(false);
          this.exito.set(true);
        },
        error: (err: HttpErrorResponse) => {
          this.cargando.set(false);
          this.manejarError(err);
        },
      });
    } else {
      const parentescoControl = this.form.controls.parentesco;
      parentescoControl.markAsTouched();
      if (!parentescoControl.value || parentescoControl.value.trim().length === 0) {
        this.error.set('El parentesco o relación es obligatorio');
        return;
      }

      this.cargando.set(true);
      const dto: RegistroPadreDTO = {
        nombre: this.form.controls.nombre.value.trim(),
        correo: this.form.controls.correo.value.trim().toLowerCase(),
        password: this.form.controls.password.value,
        parentesco: this.form.controls.parentesco.value.trim(),
        telefonoContacto: this.form.controls.telefonoContacto.value.trim() || undefined,
      };

      this.auth.registrarPadre(dto).subscribe({
        next: () => {
          this.cargando.set(false);
          this.exito.set(true);
        },
        error: (err: HttpErrorResponse) => {
          this.cargando.set(false);
          this.manejarError(err);
        },
      });
    }
  }

  private manejarError(err: HttpErrorResponse): void {
    if (err.status === 409) {
      this.error.set('Este correo electrónico ya está registrado. Puedes iniciar sesión con él.');
    } else if (err.status === 400 && err.error?.mensaje) {
      this.error.set(err.error.mensaje);
    } else if (err.status === 0) {
      this.error.set('No se pudo conectar con el servidor. Verifica tu conexión.');
    } else {
      this.error.set(err.error?.mensaje || 'No se pudo completar el registro. Intenta de nuevo.');
    }
  }

  protected irAlPanel(): void {
    this.router.navigate(['/inicio']);
  }

  protected irAlLogin(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
