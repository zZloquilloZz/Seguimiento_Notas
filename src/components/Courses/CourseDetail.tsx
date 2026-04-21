import { useState } from 'react';
import type { Curso, EstadoCurso } from '../../models.js';
import { useCoursesStore } from '../../store/coursesStore';
import { calcularPromedioCurso, calcularAporteEvaluacion } from '../../utils/gradeCalculations';
import { evaluarRiesgoCurso } from '../../utils/riskAssessment';
import GradeInput from './GradeInput';
import MinGradeCalculator from './MinGradeCalculator';
import ProgressBar from '../shared/ProgressBar';
import AlertBanner from '../shared/AlertBanner';

interface NuevaEvaluacion {
  label: string;
  peso: string;
}

interface CourseDetailProps {
  curso: Curso;
}

interface EvaluacionEditando {
  id: string;
  label: string;
  peso: string;
}

export default function CourseDetail({ curso }: CourseDetailProps) {
  const { actualizarNota, actualizarEvaluacion, agregarEvaluacionesMultiples, eliminarEvaluacion, cambiarEstado } = useCoursesStore();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevasEvaluaciones, setNuevasEvaluaciones] = useState<NuevaEvaluacion[]>([
    { label: '', peso: '' },
  ]);
  const [guardando, setGuardando] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState('');
  const [evaluacionEditando, setEvaluacionEditando] = useState<EvaluacionEditando | null>(null);
  const [evaluacionAEliminar, setEvaluacionAEliminar] = useState<string | null>(null);

  const promedio = calcularPromedioCurso(curso);
  const riesgo = evaluarRiesgoCurso(curso);
  const puedeEditar = curso.estado === 'en-curso' || curso.estado === 'aprobado' || curso.estado === 'desaprobado';

  const agregarOtraFila = () => {
    setNuevasEvaluaciones([...nuevasEvaluaciones, { label: '', peso: '' }]);
  };

  const actualizarCampoEdicion = (index: number, campo: 'label' | 'peso', valor: string) => {
    const nuevas = [...nuevasEvaluaciones];
    nuevas[index][campo] = valor;
    setNuevasEvaluaciones(nuevas);
    setErrorValidacion(''); // Limpiar error al editar
  };

  const eliminarFila = (index: number) => {
    if (nuevasEvaluaciones.length === 1) return; // Mantener al menos una fila
    const nuevas = nuevasEvaluaciones.filter((_, i) => i !== index);
    setNuevasEvaluaciones(nuevas);
  };

  const validarYGuardar = async () => {
    setErrorValidacion('');

    // Filtrar filas vacías
    const evaluacionesLlenas = nuevasEvaluaciones.filter(
      ev => ev.label.trim() && ev.peso.trim()
    );

    if (evaluacionesLlenas.length === 0) {
      setErrorValidacion('Debes agregar al menos una evaluación');
      return;
    }

    // Validar que todos los campos estén llenos en las filas no vacías
    const hayFilasIncompletas = nuevasEvaluaciones.some(
      ev => (ev.label.trim() && !ev.peso.trim()) || (!ev.label.trim() && ev.peso.trim())
    );

    if (hayFilasIncompletas) {
      setErrorValidacion('Completa todos los campos de las evaluaciones');
      return;
    }

    // Validar pesos
    const evaluacionesConPeso = evaluacionesLlenas.map(ev => ({
      label: ev.label.trim(),
      peso: parseFloat(ev.peso),
    }));

    const pesoInvalido = evaluacionesConPeso.some(
      ev => isNaN(ev.peso) || ev.peso <= 0 || ev.peso > 100
    );

    if (pesoInvalido) {
      setErrorValidacion('Todos los pesos deben ser números entre 1 y 100');
      return;
    }

    // Validar suma de pesos
    const pesoExistente = curso.evaluaciones.reduce((sum, ev) => sum + ev.peso, 0);
    const pesoNuevo = evaluacionesConPeso.reduce((sum, ev) => sum + ev.peso, 0);
    const pesoTotal = pesoExistente + pesoNuevo;

    if (pesoTotal > 100) {
      setErrorValidacion(
        `Los pesos suman ${pesoTotal}%, deben sumar máximo 100% (actualmente tienes ${pesoExistente}%)`
      );
      return;
    }

    // Guardar
    setGuardando(true);
    try {
      await agregarEvaluacionesMultiples(curso.id, evaluacionesConPeso);
      setNuevasEvaluaciones([{ label: '', peso: '' }]);
      setMostrarFormulario(false);
    } catch (error) {
      setErrorValidacion('Error al guardar las evaluaciones');
    } finally {
      setGuardando(false);
    }
  };

  const cancelarFormulario = () => {
    setNuevasEvaluaciones([{ label: '', peso: '' }]);
    setMostrarFormulario(false);
    setErrorValidacion('');
  };

  const iniciarEdicion = (evaluacion: any) => {
    setEvaluacionEditando({
      id: evaluacion.id,
      label: evaluacion.label,
      peso: evaluacion.peso.toString(),
    });
  };

  const cancelarEdicion = () => {
    setEvaluacionEditando(null);
  };

  const guardarEdicion = async () => {
    if (!evaluacionEditando) return;

    const peso = parseFloat(evaluacionEditando.peso);

    if (!evaluacionEditando.label.trim()) {
      alert('El nombre no puede estar vacío');
      return;
    }

    if (isNaN(peso) || peso <= 0 || peso > 100) {
      alert('El peso debe ser un número entre 1 y 100');
      return;
    }

    // Validar suma de pesos (excluyendo la evaluación actual)
    const pesoOtrasEvaluaciones = curso.evaluaciones
      .filter(ev => ev.id !== evaluacionEditando.id)
      .reduce((sum, ev) => sum + ev.peso, 0);

    const pesoTotal = pesoOtrasEvaluaciones + peso;

    if (pesoTotal > 100) {
      alert(
        `Los pesos sumarían ${pesoTotal}%, deben sumar máximo 100%`
      );
      return;
    }

    try {
      await actualizarEvaluacion(evaluacionEditando.id, evaluacionEditando.label.trim(), peso);
      setEvaluacionEditando(null);
    } catch (error) {
      alert('Error al guardar los cambios');
    }
  };

  const confirmarEliminacion = async (evaluacionId: string) => {
    try {
      await eliminarEvaluacion(evaluacionId);
      setEvaluacionAEliminar(null);
    } catch (error) {
      alert('Error al eliminar la evaluación');
    }
  };

  // Determinar transiciones permitidas según estado actual
  const obtenerTransicionesPermitidas = (): EstadoCurso[] => {
    if (curso.estado === 'convalidado') return [];
    if (curso.estado === 'pendiente') return ['en-curso'];
    if (curso.estado === 'en-curso') return ['aprobado', 'desaprobado'];
    if (curso.estado === 'aprobado') return ['en-curso'];
    if (curso.estado === 'desaprobado') return ['en-curso'];
    return [];
  };

  const transicionesPermitidas = obtenerTransicionesPermitidas();

  const nombreEstado: Record<EstadoCurso, string> = {
    'pendiente': 'Pendiente',
    'en-curso': 'En curso',
    'aprobado': 'Aprobado',
    'desaprobado': 'Desaprobado',
    'convalidado': 'Convalidado',
  };

  if (curso.estado === 'convalidado') {
    return (
      <div className="mt-4 p-4 bg-state-validated-bg rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-state-validated-text text-sm font-medium">
          Curso convalidado - sin calificación numérica
        </p>
      </div>
    );
  }

  if (curso.estado === 'pendiente') {
    return (
      <div className="mt-4 space-y-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
            Este curso aún no está en curso
          </p>
          <button
            onClick={() => cambiarEstado(curso.id, 'en-curso')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            En curso
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Mensaje cuando no hay evaluaciones */}
      {curso.evaluaciones.length === 0 && puedeEditar && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-blue-800 dark:text-blue-300 text-sm">
            Aún no tienes evaluaciones registradas. Puedes agregarlas con el botón <span className="font-medium">+ Agregar evaluación</span> más abajo.
          </p>
        </div>
      )}
      {/* Alerta de riesgo */}
      {curso.evaluaciones.length > 0 && riesgo === 'critico' && (
        <AlertBanner
          nivel="critico"
          mensaje="Situación crítica"
          detalles="Este curso requiere atención inmediata"
        />
      )}
      {curso.evaluaciones.length > 0 && riesgo === 'advertencia' && (
        <AlertBanner
          nivel="advertencia"
          mensaje="Requiere esfuerzo adicional"
          detalles="Este curso necesita más dedicación"
        />
      )}

      {/* Tabla de evaluaciones */}
      {curso.evaluaciones.length > 0 && (
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Evaluación
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Peso %
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nota
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Aporte
              </th>
              {puedeEditar && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {curso.evaluaciones.map(evaluacion => {
              const aporte = calcularAporteEvaluacion(evaluacion, curso);
              const estaEditando = evaluacionEditando?.id === evaluacion.id;
              const mostrarConfirmacion = evaluacionAEliminar === evaluacion.id;

              return (
                <tr key={evaluacion.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {estaEditando ? (
                      <input
                        type="text"
                        value={evaluacionEditando.label}
                        onChange={e => setEvaluacionEditando({ ...evaluacionEditando, label: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                    ) : (
                      evaluacion.label
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {estaEditando ? (
                      <input
                        type="number"
                        value={evaluacionEditando.peso}
                        onChange={e => setEvaluacionEditando({ ...evaluacionEditando, peso: e.target.value })}
                        min="1"
                        max="100"
                        className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                    ) : (
                      `${evaluacion.peso}%`
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {estaEditando ? (
                      <span className="text-xs text-gray-400">—</span>
                    ) : (
                      <GradeInput
                        value={evaluacion.nota}
                        onChange={value => actualizarNota(evaluacion.id, value)}
                        disabled={!puedeEditar}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {aporte !== null ? aporte.toFixed(2) : '—'}
                  </td>
                  {puedeEditar && (
                    <td className="px-4 py-3">
                      {mostrarConfirmacion ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => confirmarEliminacion(evaluacion.id)}
                            className="text-xs text-red-600 dark:text-red-400 hover:underline font-medium"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => setEvaluacionAEliminar(null)}
                            className="text-xs text-gray-600 dark:text-gray-400 hover:underline"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : estaEditando ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={guardarEdicion}
                            className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                            title="Guardar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={cancelarEdicion}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            title="Cancelar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => iniciarEdicion(evaluacion)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setEvaluacionAEliminar(evaluacion.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            title="Eliminar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      )}

      {/* Cambio de estado */}
      {transicionesPermitidas.length > 0 && (
        <div className="flex items-center gap-3 pt-3 pb-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">Cambiar estado:</span>
          {transicionesPermitidas.map(estado => {
            const estilos = {
              'aprobado': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 border-green-300 dark:border-green-700',
              'desaprobado': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 border-red-300 dark:border-red-700',
              'en-curso': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 border-yellow-300 dark:border-yellow-700',
              'pendiente': 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600',
              'convalidado': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 border-blue-300 dark:border-blue-700',
            };

            return (
              <button
                key={estado}
                onClick={() => cambiarEstado(curso.id, estado)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${estilos[estado]}`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                {nombreEstado[estado]}
              </button>
            );
          })}
        </div>
      )}

      {/* Promedio */}
      {curso.evaluaciones.length > 0 && promedio !== null && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Promedio del curso
            </span>
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
          <ProgressBar
            porcentaje={(promedio / 20) * 100}
            aprobado={promedio >= 11.5}
            altura="lg"
          />
        </div>
      )}

      {/* Calculadora de nota mínima */}
      {curso.estado === 'en-curso' && curso.evaluaciones.length > 0 && (
        <MinGradeCalculator curso={curso} />
      )}

      {/* Botón agregar evaluación */}
      {puedeEditar && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          {!mostrarFormulario ? (
            <button
              onClick={() => setMostrarFormulario(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar evaluación
            </button>
          ) : (
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Agregar evaluaciones
              </div>

              {/* Tabla de nuevas evaluaciones */}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Nombre
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase w-24">
                        Peso %
                      </th>
                      <th className="px-3 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {nuevasEvaluaciones.map((ev, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            placeholder="Ej: PC1, EP, EF"
                            value={ev.label}
                            onChange={e =>
                              actualizarCampoEdicion(index, 'label', e.target.value)
                            }
                            className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            placeholder="%"
                            value={ev.peso}
                            onChange={e =>
                              actualizarCampoEdicion(index, 'peso', e.target.value)
                            }
                            min="1"
                            max="100"
                            className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          />
                        </td>
                        <td className="px-3 py-2">
                          {nuevasEvaluaciones.length > 1 && (
                            <button
                              onClick={() => eliminarFila(index)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              title="Eliminar fila"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Botón añadir otra fila */}
              <button
                onClick={agregarOtraFila}
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                + Añadir otra
              </button>

              {/* Mensaje de error */}
              {errorValidacion && (
                <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errorValidacion}
                  </p>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={validarYGuardar}
                  disabled={guardando}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md text-sm font-medium"
                >
                  {guardando ? 'Guardando...' : 'Guardar todas'}
                </button>
                <button
                  onClick={cancelarFormulario}
                  disabled={guardando}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
