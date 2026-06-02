import { describe, it, expect } from 'vitest';
import {
  calcularPromedioCurso,
  calcularAporteEvaluacion,
  calcularNotaMinimaRequerida,
  calcularPromedioPonderado,
  calcularPromedioCiclo,
} from './gradeCalculations';
import type { Curso, Evaluacion } from '../models';

// Helper para construir un curso de prueba
function crearCurso(overrides: Partial<Curso> = {}): Curso {
  return {
    id: 'c1',
    codigo: 'TEST101',
    nombre: 'Curso de prueba',
    ciclo: 1,
    creditos: 4,
    estado: 'en-curso',
    tipo: 'obligatorio',
    evaluaciones: [],
    ...overrides,
  };
}

function ev(label: string, peso: number, nota: number | null): Evaluacion {
  return { id: label, label, peso, nota };
}

describe('calcularPromedioCurso', () => {
  it('retorna null si no hay evaluaciones con nota', () => {
    const curso = crearCurso({ evaluaciones: [ev('P1', 50, null), ev('P2', 50, null)] });
    expect(calcularPromedioCurso(curso)).toBeNull();
  });

  it('retorna null para curso convalidado sin evaluaciones', () => {
    const curso = crearCurso({ estado: 'convalidado', evaluaciones: [] });
    expect(calcularPromedioCurso(curso)).toBeNull();
  });

  it('calcula promedio ponderado por peso', () => {
    const curso = crearCurso({ evaluaciones: [ev('P1', 50, 16), ev('P2', 50, 14)] });
    expect(calcularPromedioCurso(curso)).toBe(15);
  });

  it('renormaliza el peso considerando solo evaluaciones con nota', () => {
    // Solo P1 tiene nota → su promedio es su propia nota
    const curso = crearCurso({ evaluaciones: [ev('P1', 30, 18), ev('P2', 70, null)] });
    expect(calcularPromedioCurso(curso)).toBe(18);
  });

  it('redondea a 1 decimal', () => {
    const curso = crearCurso({ evaluaciones: [ev('P1', 50, 13), ev('P2', 50, 14)] });
    expect(calcularPromedioCurso(curso)).toBe(13.5);
  });
});

describe('calcularAporteEvaluacion', () => {
  it('retorna null si la evaluación no tiene nota', () => {
    const curso = crearCurso({ evaluaciones: [ev('P1', 50, null)] });
    expect(calcularAporteEvaluacion(curso.evaluaciones[0], curso)).toBeNull();
  });

  it('calcula el aporte ponderado de una evaluación', () => {
    const curso = crearCurso({ evaluaciones: [ev('P1', 50, 16), ev('P2', 50, 14)] });
    // 16 * 50 / 100 = 8
    expect(calcularAporteEvaluacion(curso.evaluaciones[0], curso)).toBe(8);
  });
});

describe('calcularNotaMinimaRequerida', () => {
  it('garantizado cuando no hay pendientes y ya aprueba', () => {
    const curso = crearCurso({ evaluaciones: [ev('P1', 100, 15)] });
    const r = calcularNotaMinimaRequerida(curso);
    expect(r.tipo).toBe('garantizado');
  });

  it('imposible cuando no hay pendientes y no aprueba', () => {
    const curso = crearCurso({ evaluaciones: [ev('P1', 100, 8)] });
    const r = calcularNotaMinimaRequerida(curso);
    expect(r.tipo).toBe('imposible');
  });

  it('calcula la nota necesaria en evaluaciones pendientes', () => {
    // P1=10 (peso 50). Necesita X en P2 (peso 50): (11.5*100 - 10*50)/50 = 13
    const curso = crearCurso({ evaluaciones: [ev('P1', 50, 10), ev('P2', 50, null)] });
    const r = calcularNotaMinimaRequerida(curso);
    expect(r.tipo).toBe('necesita');
    expect(r.notaMinima).toBe(13);
  });

  it('marca imposible si la nota requerida supera 20', () => {
    const curso = crearCurso({ evaluaciones: [ev('P1', 80, 5), ev('P2', 20, null)] });
    const r = calcularNotaMinimaRequerida(curso);
    expect(r.tipo).toBe('imposible');
  });

  it('garantizado si ya tiene el mínimo asegurado', () => {
    const curso = crearCurso({ evaluaciones: [ev('P1', 80, 18), ev('P2', 20, null)] });
    const r = calcularNotaMinimaRequerida(curso);
    expect(r.tipo).toBe('garantizado');
  });
});

describe('calcularPromedioPonderado', () => {
  it('retorna null si ningún curso tiene promedio', () => {
    const cursos = [crearCurso({ evaluaciones: [ev('P1', 100, null)] })];
    expect(calcularPromedioPonderado(cursos)).toBeNull();
  });

  it('pondera por créditos entre cursos', () => {
    const c1 = crearCurso({ id: 'a', creditos: 2, evaluaciones: [ev('P1', 100, 10)] });
    const c2 = crearCurso({ id: 'b', creditos: 6, evaluaciones: [ev('P1', 100, 18)] });
    // (10*2 + 18*6) / 8 = 16
    expect(calcularPromedioPonderado([c1, c2])).toBe(16);
  });
});

describe('calcularPromedioCiclo', () => {
  it('promedia solo los cursos del ciclo indicado', () => {
    const c1 = crearCurso({ id: 'a', ciclo: 1, creditos: 4, evaluaciones: [ev('P1', 100, 12)] });
    const c2 = crearCurso({ id: 'b', ciclo: 2, creditos: 4, evaluaciones: [ev('P1', 100, 20)] });
    expect(calcularPromedioCiclo([c1, c2], 1)).toBe(12);
  });
});
