import type { Curso } from '../../models.js';
import { calcularPromedioCiclo } from '../../utils/gradeCalculations';
import { obtenerCiclosUnicos } from '../../utils/progressUtils';
import Badge from '../shared/Badge';

interface HistoryTimelineProps {
  cursos: Curso[];
}

export default function HistoryTimeline({ cursos }: HistoryTimelineProps) {
  const cursosCompletados = cursos.filter(
    c => c.estado === 'aprobado' || c.estado === 'convalidado'
  );

  const ciclos = obtenerCiclosUnicos(cursosCompletados);

  if (cursosCompletados.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          No hay cursos completados aún
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {ciclos.map((ciclo, index) => {
        const cursosCiclo = cursosCompletados.filter(c => c.ciclo === ciclo);
        const promedioCiclo = calcularPromedioCiclo(cursos, ciclo);
        const creditosCiclo = cursosCiclo.reduce((sum, c) => sum + c.creditos, 0);

        return (
          <div key={ciclo} className="relative">
            {/* Línea vertical del timeline */}
            {index !== ciclos.length - 1 && (
              <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600" />
            )}

            <div className="flex gap-6">
              {/* Círculo del timeline */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold z-10">
                  C{ciclo}
                </div>
              </div>

              {/* Contenido */}
              <div className="flex-1 pb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Ciclo {ciclo}
                    </h3>
                    <div className="text-right">
                      {promedioCiclo !== null && (
                        <p
                          className={`text-2xl font-bold ${
                            promedioCiclo >= 11.5
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {promedioCiclo.toFixed(1)}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {creditosCiclo.toFixed(1)} créditos
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {cursosCiclo.map(curso => (
                      <div
                        key={curso.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                              {curso.codigo}
                            </span>
                            <Badge tipo="estado" valor={curso.estado} />
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {curso.nombre}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {curso.creditos} créditos
                          </p>
                        </div>
                        {curso.estado === 'aprobado' && curso.evaluaciones.length > 0 && (
                          <div className="text-right ml-4">
                            {(() => {
                              const promedio = curso.evaluaciones
                                .filter(e => e.nota !== null)
                                .reduce((sum, e, _, arr) => {
                                  const pesoTotal = arr.reduce((s, ev) => s + ev.peso, 0);
                                  return sum + (e.nota! * e.peso) / pesoTotal;
                                }, 0);

                              return promedio > 0 ? (
                                <span
                                  className={`text-lg font-bold ${
                                    promedio >= 11.5
                                      ? 'text-green-600 dark:text-green-400'
                                      : 'text-red-600 dark:text-red-400'
                                  }`}
                                >
                                  {promedio.toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-lg font-bold text-gray-400">—</span>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
