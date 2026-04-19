import type { Curso, NivelRiesgo } from '../models.js';
import { calcularPromedioCurso, calcularNotaMinimaRequerida } from './gradeCalculations';

/**
 * Evalúa el nivel de riesgo de un curso en-curso
 */
export function evaluarRiesgoCurso(curso: Curso): NivelRiesgo {
  if (curso.estado !== 'en-curso') {
    return 'sin-datos';
  }

  const promedio = calcularPromedioCurso(curso);

  // Si no hay ninguna nota ingresada
  if (promedio === null) {
    return 'sin-datos';
  }

  const { notaMinima, tipo } = calcularNotaMinimaRequerida(curso);

  // CRÍTICO: promedio < 8 O nota mínima necesaria > 18
  if (promedio < 8 || (tipo === 'necesita' && notaMinima > 18)) {
    return 'critico';
  }

  // ADVERTENCIA: promedio entre 8 y 11.4 O nota mínima necesaria entre 14 y 18
  if (
    (promedio >= 8 && promedio < 11.5) ||
    (tipo === 'necesita' && notaMinima >= 14 && notaMinima <= 18)
  ) {
    return 'advertencia';
  }

  // BIEN: promedio >= 11.5
  if (promedio >= 11.5) {
    return 'bien';
  }

  return 'sin-datos';
}

/**
 * Retorna el color asociado al nivel de riesgo
 */
export function obtenerColorRiesgo(nivel: NivelRiesgo): {
  text: string;
  bg: string;
  border: string;
} {
  switch (nivel) {
    case 'critico':
      return {
        text: 'text-red-700 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
      };
    case 'advertencia':
      return {
        text: 'text-yellow-700 dark:text-yellow-400',
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800',
      };
    case 'bien':
      return {
        text: 'text-green-700 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
      };
    default:
      return {
        text: 'text-gray-700 dark:text-gray-400',
        bg: 'bg-gray-50 dark:bg-gray-900/20',
        border: 'border-gray-200 dark:border-gray-800',
      };
  }
}

/**
 * Retorna un mensaje descriptivo del nivel de riesgo
 */
export function obtenerMensajeRiesgo(nivel: NivelRiesgo): string {
  switch (nivel) {
    case 'critico':
      return 'Situación crítica - requiere atención inmediata';
    case 'advertencia':
      return 'Requiere esfuerzo adicional';
    case 'bien':
      return 'En buen camino';
    default:
      return 'Sin evaluaciones registradas';
  }
}
