import { describe, it, expect } from 'vitest';
import { evaluarRiesgoCurso, obtenerColorRiesgo, obtenerMensajeRiesgo } from './riskAssessment';
import type { Curso, Evaluacion } from '../models';

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

describe('evaluarRiesgoCurso', () => {
  it('sin-datos si el curso no está en-curso', () => {
    const curso = crearCurso({ estado: 'aprobado', evaluaciones: [ev('P1', 100, 18)] });
    expect(evaluarRiesgoCurso(curso)).toBe('sin-datos');
  });

  it('sin-datos si no hay ninguna nota', () => {
    const curso = crearCurso({ evaluaciones: [ev('P1', 100, null)] });
    expect(evaluarRiesgoCurso(curso)).toBe('sin-datos');
  });

  it('critico si el promedio es menor a 8', () => {
    const curso = crearCurso({ evaluaciones: [ev('P1', 100, 6)] });
    expect(evaluarRiesgoCurso(curso)).toBe('critico');
  });

  it('critico si necesita más de 18 en lo pendiente', () => {
    // P1=5 (50), pendiente P2 (50): necesita (11.5*100-250)/50 = 18 → >18 falso en 18.
    // Bajamos: P1=4 → necesita (1150-200)/50 = 19 > 18 → critico
    const curso = crearCurso({ evaluaciones: [ev('P1', 50, 4), ev('P2', 50, null)] });
    expect(evaluarRiesgoCurso(curso)).toBe('critico');
  });

  it('advertencia si el promedio está entre 8 y 11.4', () => {
    const curso = crearCurso({ evaluaciones: [ev('P1', 100, 10)] });
    expect(evaluarRiesgoCurso(curso)).toBe('advertencia');
  });

  it('bien si el promedio es mayor o igual a 11.5', () => {
    const curso = crearCurso({ evaluaciones: [ev('P1', 100, 15)] });
    expect(evaluarRiesgoCurso(curso)).toBe('bien');
  });
});

describe('obtenerColorRiesgo', () => {
  it('retorna clases de color para cada nivel', () => {
    expect(obtenerColorRiesgo('critico').text).toContain('red');
    expect(obtenerColorRiesgo('advertencia').text).toContain('yellow');
    expect(obtenerColorRiesgo('bien').text).toContain('green');
    expect(obtenerColorRiesgo('sin-datos').text).toContain('gray');
  });
});

describe('obtenerMensajeRiesgo', () => {
  it('retorna un mensaje no vacío por nivel', () => {
    expect(obtenerMensajeRiesgo('critico').length).toBeGreaterThan(0);
    expect(obtenerMensajeRiesgo('bien').length).toBeGreaterThan(0);
  });
});
