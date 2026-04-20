import type { Curso } from '../../models.js';
import { calcularPromedioCurso } from '../../utils/gradeCalculations';
import { evaluarRiesgoCurso } from '../../utils/riskAssessment';
import Badge from '../shared/Badge';

interface CurrentCoursesProps {
  cursos: Curso[];
}

export default function CurrentCourses({ cursos }: CurrentCoursesProps) {
  const cursosEnCurso = cursos.filter(c => c.estado === 'en-curso');

  if (cursosEnCurso.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">No hay cursos en curso actualmente</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Ciclo actual</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cursosEnCurso.map(curso => {
          const promedio = calcularPromedioCurso(curso);
          const riesgo = evaluarRiesgoCurso(curso);

          return (
            <div
              key={curso.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{curso.codigo}</p>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mt-1">
                    {curso.nombre}
                  </h3>
                </div>
                {riesgo !== 'sin-datos' && (
                  <div
                    className={`w-3 h-3 rounded-full ${
                      riesgo === 'critico'
                        ? 'bg-red-500'
                        : riesgo === 'advertencia'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    title={riesgo}
                  />
                )}
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {curso.creditos} créditos
                </span>
                <Badge tipo="estado" valor={curso.estado} />
              </div>

              {promedio !== null ? (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Promedio</span>
                    <span
                      className={`text-lg font-bold ${
                        promedio >= 11.5
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {promedio.toFixed(1)}
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        promedio >= 11.5 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((promedio / 20) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Sin evaluaciones registradas
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
