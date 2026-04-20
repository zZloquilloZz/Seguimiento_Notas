import { useState } from 'react';
import { useCoursesStore } from '../../store/coursesStore';
import type { Curso } from '../../models.js';

export default function GradeSimulator() {
  const { cursos, actualizarNota } = useCoursesStore();
  const cursosEnCurso = cursos.filter(c => c.estado === 'en-curso');

  const [cursoSeleccionado, setCursoSeleccionado] = useState<Curso | null>(
    cursosEnCurso.length > 0 ? cursosEnCurso[0] : null
  );

  const [notasSimuladas, setNotasSimuladas] = useState<{ [key: string]: number }>({});

  if (cursosEnCurso.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calculadora</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No hay cursos en curso para simular
          </p>
        </div>
      </div>
    );
  }

  const handleCursoChange = (cursoId: string) => {
    const curso = cursosEnCurso.find(c => c.id === cursoId);
    if (curso) {
      setCursoSeleccionado(curso);
      setNotasSimuladas({});
    }
  };

  const handleNotaSimuladaChange = (evaluacionId: string, nota: number) => {
    setNotasSimuladas(prev => ({
      ...prev,
      [evaluacionId]: nota,
    }));
  };

  const calcularPromedioSimulado = (): number | null => {
    if (!cursoSeleccionado) return null;

    const evaluacionesConNota = cursoSeleccionado.evaluaciones.filter(
      e => e.nota !== null || notasSimuladas[e.id] !== undefined
    );

    if (evaluacionesConNota.length === 0) return null;

    const pesoTotal = evaluacionesConNota.reduce((sum, e) => sum + e.peso, 0);
    const sumaNotas = evaluacionesConNota.reduce((sum, e) => {
      const nota = notasSimuladas[e.id] !== undefined ? notasSimuladas[e.id] : e.nota!;
      return sum + nota * e.peso;
    }, 0);

    return Number((sumaNotas / pesoTotal).toFixed(1));
  };

  const aplicarNotas = async () => {
    if (!cursoSeleccionado) return;

    for (const [evaluacionId, nota] of Object.entries(notasSimuladas)) {
      await actualizarNota(evaluacionId, nota);
    }

    setNotasSimuladas({});
    alert('Notas aplicadas exitosamente');
  };

  const promedioSimulado = calcularPromedioSimulado();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calculadora</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Simula diferentes escenarios de notas
        </p>
      </div>

      {/* Selector de curso */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Selecciona un curso
        </label>
        <select
          value={cursoSeleccionado?.id || ''}
          onChange={e => handleCursoChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {cursosEnCurso.map(curso => (
            <option key={curso.id} value={curso.id}>
              {curso.codigo} - {curso.nombre}
            </option>
          ))}
        </select>
      </div>

      {cursoSeleccionado && (
        <>
          {/* Tabla de simulación */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Simular notas
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Evaluación
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Peso %
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Nota actual
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Nota simulada
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {cursoSeleccionado.evaluaciones.map(evaluacion => (
                    <tr key={evaluacion.id}>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {evaluacion.label}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {evaluacion.peso}%
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {evaluacion.nota !== null ? evaluacion.nota : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.1"
                          value={notasSimuladas[evaluacion.id] ?? ''}
                          onChange={e =>
                            handleNotaSimuladaChange(
                              evaluacion.id,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder={evaluacion.nota?.toString() || '0'}
                          className="w-20 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resultado de la simulación */}
          <div
            className={`rounded-lg border p-6 ${
              promedioSimulado !== null && promedioSimulado >= 11.5
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Promedio simulado
                </h3>
                {promedioSimulado !== null ? (
                  <p
                    className={`text-4xl font-bold ${
                      promedioSimulado >= 11.5
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {promedioSimulado.toFixed(1)}
                  </p>
                ) : (
                  <p className="text-2xl text-gray-400">—</p>
                )}
              </div>
              <div className="text-right">
                <p
                  className={`text-xl font-bold ${
                    promedioSimulado !== null && promedioSimulado >= 11.5
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {promedioSimulado !== null && promedioSimulado >= 11.5
                    ? 'APROBADO'
                    : 'DESAPROBADO'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Mínimo: 11.5
                </p>
              </div>
            </div>
          </div>

          {/* Botón aplicar */}
          {Object.keys(notasSimuladas).length > 0 && (
            <div className="flex gap-4">
              <button
                onClick={aplicarNotas}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Aplicar estas notas
              </button>
              <button
                onClick={() => setNotasSimuladas({})}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
              >
                Limpiar simulación
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
