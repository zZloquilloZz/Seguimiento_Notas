export interface Perfil {
  id: string;
  nombre: string;
  programa: string;
  universidad: string;
  created_at: string;
}

export interface CursoDB {
  id: string;
  user_id: string;
  codigo: string;
  nombre: string;
  ciclo: number;
  creditos: number;
  estado: 'aprobado' | 'convalidado' | 'en-curso' | 'pendiente';
  tipo: 'obligatorio' | 'electivo';
  created_at: string;
}

export interface EvaluacionDB {
  id: string;
  curso_id: string;
  user_id: string;
  label: string;
  peso: number;
  nota: number | null;
  created_at: string;
}
