import type { Curso, Evaluacion } from '../models.js';

const NOTA_MINIMA_APROBAR = 11.5;

/**
 * Calcula el promedio de un curso basado en las evaluaciones ingresadas
 * Solo considera evaluaciones con nota no nula
 */
export function calcularPromedioCurso(curso: Curso): number | null {
  if (curso.estado === 'convalidado' && curso.evaluaciones.length === 0) {
    return null;
  }

  const evaluacionesConNota = curso.evaluaciones.filter(e => e.nota !== null);

  if (evaluacionesConNota.length === 0) {
    return null;
  }

  const pesoTotal = evaluacionesConNota.reduce((sum, e) => sum + e.peso, 0);
  const sumaNotas = evaluacionesConNota.reduce((sum, e) => sum + (e.nota! * e.peso), 0);

  return Number((sumaNotas / pesoTotal).toFixed(1));
}

/**
 * Calcula cuánto aporta una evaluación al promedio final
 */
export function calcularAporteEvaluacion(evaluacion: Evaluacion, curso: Curso): number | null {
  if (evaluacion.nota === null) return null;

  const evaluacionesConNota = curso.evaluaciones.filter(e => e.nota !== null);
  const pesoTotal = evaluacionesConNota.reduce((sum, e) => sum + e.peso, 0);

  return Number(((evaluacion.nota * evaluacion.peso) / pesoTotal).toFixed(2));
}

/**
 * Calcula la nota mínima necesaria en las evaluaciones restantes para aprobar
 * Asume que todas las evaluaciones pendientes sacarán la misma nota X
 */
export function calcularNotaMinimaRequerida(curso: Curso): {
  notaMinima: number;
  mensaje: string;
  tipo: 'imposible' | 'garantizado' | 'necesita';
} {
  const evaluacionesConNota = curso.evaluaciones.filter(e => e.nota !== null);
  const evaluacionesSinNota = curso.evaluaciones.filter(e => e.nota === null);

  // Si no hay evaluaciones pendientes
  if (evaluacionesSinNota.length === 0) {
    const promedio = calcularPromedioCurso(curso);
    if (promedio === null) {
      return {
        notaMinima: 0,
        mensaje: 'No hay evaluaciones registradas',
        tipo: 'garantizado',
      };
    }
    return {
      notaMinima: promedio,
      mensaje: `Promedio final: ${promedio}`,
      tipo: promedio >= NOTA_MINIMA_APROBAR ? 'garantizado' : 'imposible',
    };
  }

  const pesoSinNota = evaluacionesSinNota.reduce((sum, e) => sum + e.peso, 0);
  const sumaNotasIngresadas = evaluacionesConNota.reduce((sum, e) => sum + (e.nota! * e.peso), 0);

  // Nota mínima X = (11.5 * 100 - suma ya ingresada) / peso pendiente
  const notaMinimaX = (NOTA_MINIMA_APROBAR * 100 - sumaNotasIngresadas) / pesoSinNota;

  if (notaMinimaX > 20) {
    return {
      notaMinima: notaMinimaX,
      mensaje: `Imposible aprobar matemáticamente (se necesitaría ${notaMinimaX.toFixed(1)})`,
      tipo: 'imposible',
    };
  }

  if (notaMinimaX <= 0) {
    return {
      notaMinima: 0,
      mensaje: 'Ya tienes el mínimo garantizado',
      tipo: 'garantizado',
    };
  }

  return {
    notaMinima: Number(notaMinimaX.toFixed(1)),
    mensaje: `Necesitas al menos ${notaMinimaX.toFixed(1)} en las ${evaluacionesSinNota.length} evaluación(es) restante(s) para aprobar`,
    tipo: 'necesita',
  };
}

/**
 * Calcula el promedio ponderado general de todos los cursos con nota
 */
export function calcularPromedioPonderado(cursos: Curso[]): number | null {
  const cursosConPromedio = cursos
    .map(c => ({ curso: c, promedio: calcularPromedioCurso(c) }))
    .filter(item => item.promedio !== null);

  if (cursosConPromedio.length === 0) return null;

  const sumaCreditos = cursosConPromedio.reduce((sum, item) => sum + item.curso.creditos, 0);
  const sumaPonderada = cursosConPromedio.reduce(
    (sum, item) => sum + (item.promedio! * item.curso.creditos),
    0
  );

  return Number((sumaPonderada / sumaCreditos).toFixed(1));
}

/**
 * Calcula el promedio de un ciclo específico
 */
export function calcularPromedioCiclo(cursos: Curso[], ciclo: number): number | null {
  const cursosCiclo = cursos.filter(c => c.ciclo === ciclo);
  return calcularPromedioPonderado(cursosCiclo);
}
