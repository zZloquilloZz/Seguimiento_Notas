import { useState } from 'react';
import type { Curso } from '../../models.js';
import { calcularPromedioCurso } from '../../utils/gradeCalculations';
import { evaluarRiesgoCurso, obtenerColorRiesgo } from '../../utils/riskAssessment';
import Badge from '../shared/Badge';
import CourseDetail from './CourseDetail';

interface CourseCardProps {
  curso: Curso;
}

export default function CourseCard({ curso }: CourseCardProps) {
  const [expandido, setExpandido] = useState(false);
  const promedio = calcularPromedioCurso(curso);
  const riesgo = evaluarRiesgoCurso(curso);
  const colores = obtenerColorRiesgo(riesgo);

  const puedeExpandir =
    curso.estado === 'aprobado' ||
    curso.estado === 'en-curso' ||
    curso.estado === 'convalidado';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => puedeExpandir && setExpandido(!expandido)}
        className={`w-full p-4 text-left ${puedeExpandir ? 'cursor-pointer' : 'cursor-default'}`}
        disabled={!puedeExpandir}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                {curso.codigo}
              </span>
              <Badge tipo="estado" valor={curso.estado} />
              <Badge tipo="tipo" valor={curso.tipo} />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{curso.nombre}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {curso.creditos} créditos
            </p>
          </div>

          <div className="flex items-center gap-3">
            {promedio !== null ? (
              <div className="text-right">
                <span
                  className={`text-2xl font-bold ${
                    promedio >= 11.5
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {promedio.toFixed(1)}
                </span>
              </div>
            ) : curso.estado === 'aprobado' && curso.evaluaciones.length === 0 ? (
              <span className="text-2xl font-bold text-gray-400">—</span>
            ) : null}

            {riesgo !== 'sin-datos' && riesgo !== 'bien' && (
              <div
                className={`w-3 h-3 rounded-full ${
                  riesgo === 'critico' ? 'bg-red-500' : 'bg-yellow-500'
                }`}
                title={riesgo}
              />
            )}

            {puedeExpandir && (
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  expandido ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )}
          </div>
        </div>
      </button>

      {expandido && (
        <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
          <CourseDetail curso={curso} />
        </div>
      )}
    </div>
  );
}
