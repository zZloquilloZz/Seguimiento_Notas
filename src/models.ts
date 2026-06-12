export type EstadoCurso = 'aprobado' | 'desaprobado' | 'convalidado' | 'en-curso' | 'pendiente';
export type TipoCurso = 'obligatorio' | 'electivo';
export type NivelRiesgo = 'critico' | 'advertencia' | 'bien' | 'sin-datos';

export interface Evaluacion {
  id: string;
  label: string;
  peso: number;
  nota: number | null;
}

export interface Curso {
  id: string;
  codigo: string;
  nombre: string;
  ciclo: number;
  creditos: number;
  estado: EstadoCurso;
  tipo: TipoCurso;
  evaluaciones: Evaluacion[];
}
