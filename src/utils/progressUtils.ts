import type { Curso } from '../models.js';

/**
 * Calcula el porcentaje de avance general (solo cursos obligatorios)
 */
export function calcularAvanceCursos(cursos: Curso[]): number {
  const obligatorios = cursos.filter(c => c.tipo === 'obligatorio');
  const completados = obligatorios.filter(
    c => c.estado === 'aprobado' || c.estado === 'convalidado'
  );

  if (obligatorios.length === 0) return 0;

  return Math.round((completados.length / obligatorios.length) * 100);
}

/**
 * Calcula el porcentaje de avance por créditos (solo cursos obligatorios)
 */
export function calcularAvanceCreditos(cursos: Curso[]): {
  completados: number;
  total: number;
  porcentaje: number;
} {
  const obligatorios = cursos.filter(c => c.tipo === 'obligatorio');
  const totalCreditos = obligatorios.reduce((sum, c) => sum + c.creditos, 0);
  const creditosCompletados = obligatorios
    .filter(c => c.estado === 'aprobado' || c.estado === 'convalidado')
    .reduce((sum, c) => sum + c.creditos, 0);

  return {
    completados: Math.round(creditosCompletados * 10) / 10,
    total: Math.round(totalCreditos * 10) / 10,
    porcentaje: Math.round((creditosCompletados / totalCreditos) * 100),
  };
}

/**
 * Cuenta cursos por estado
 */
export function contarCursosPorEstado(cursos: Curso[]): {
  aprobados: number;
  convalidados: number;
  enCurso: number;
  pendientes: number;
} {
  return {
    aprobados: cursos.filter(c => c.estado === 'aprobado').length,
    convalidados: cursos.filter(c => c.estado === 'convalidado').length,
    enCurso: cursos.filter(c => c.estado === 'en-curso').length,
    pendientes: cursos.filter(c => c.estado === 'pendiente').length,
  };
}

/**
 * Proyecta ciclos restantes basado en avance actual
 * Asume ~18 créditos por ciclo
 */
export function proyectarCiclosRestantes(cursos: Curso[]): {
  ciclosRestantes: number;
  creditosPendientes: number;
} {
  const { completados, total } = calcularAvanceCreditos(cursos);
  const creditosPendientes = total - completados;
  const ciclosRestantes = Math.ceil(creditosPendientes / 18);

  return {
    ciclosRestantes: Math.max(0, ciclosRestantes),
    creditosPendientes: Math.round(creditosPendientes * 10) / 10,
  };
}

/**
 * Obtiene todos los ciclos únicos presentes en los cursos
 */
export function obtenerCiclosUnicos(cursos: Curso[]): number[] {
  const ciclos = [...new Set(cursos.map(c => c.ciclo))];
  return ciclos.sort((a, b) => a - b);
}

/**
 * Filtra cursos por búsqueda (nombre o código)
 */
export function filtrarCursosPorBusqueda(cursos: Curso[], busqueda: string): Curso[] {
  if (!busqueda.trim()) return cursos;

  const termino = busqueda.toLowerCase().trim();
  return cursos.filter(
    c =>
      c.nombre.toLowerCase().includes(termino) ||
      c.codigo.toLowerCase().includes(termino)
  );
}
