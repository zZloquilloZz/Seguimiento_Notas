import { useState } from 'react';
import type { Curso, EstadoCurso } from '../../models.js';
import { useCoursesStore } from '../../store/coursesStore';
import { calcularPromedioCurso, calcularAporteEvaluacion } from '../../utils/gradeCalculations';
import { evaluarRiesgoCurso } from '../../utils/riskAssessment';
import GradeInput from './GradeInput';
import MinGradeCalculator from './MinGradeCalculator';
import ProgressBar from '../shared/ProgressBar';
import AlertBanner from '../shared/AlertBanner';

interface CourseDetailProps {
  curso: Curso;
}

export default function CourseDetail({ curso }: CourseDetailProps) {
  const { actualizarNota, agregarEvaluacion, cambiarEstado } = useCoursesStore();
  const [nuevoLabel, setNuevoLabel] = useState('');
  const [nuevoPeso, setNuevoPeso] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const promedio = calcularPromedioCurso(curso);
  const riesgo = evaluarRiesgoCurso(curso);
  const puedeEditar = curso.estado === 'en-curso' || curso.estado === 'aprobado';

  const handleAgregarEvaluacion = () => {
    if (!nuevoLabel.trim() || !nuevoPeso) return;

    const peso = parseInt(nuevoPeso);
    if (peso <= 0 || peso > 100) return;

    agregarEvaluacion(curso.id, nuevoLabel.trim(), peso);
    setNuevoLabel('');
    setNuevoPeso('');
    setMostrarFormulario(false);
  };

  // Determinar transiciones permitidas según estado actual
  const obtenerTransicionesPermitidas = (): EstadoCurso[] => {
    if (curso.estado === 'convalidado') return [];
    if (curso.estado === 'pendiente') return ['en-curso'];
    if (curso.estado === 'en-curso') return ['aprobado', 'pendiente'];
    if (curso.estado === 'aprobado') return ['en-curso'];
    return [];
  };

  const transicionesPermitidas = obtenerTransicionesPermitidas();

  const nombreEstado: Record<EstadoCurso, string> = {
    'pendiente': 'Pendiente',
    'en-curso': 'En curso',
    'aprobado': 'Aprobado',
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
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Curso pendiente - aún no cursado
        </p>
      </div>
    );
  }

  if (curso.evaluaciones.length === 0) {
    return (
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          No hay evaluaciones registradas para este curso
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Alerta de riesgo */}
      {riesgo === 'critico' && (
        <AlertBanner
          nivel="critico"
          mensaje="Situación crítica"
          detalles="Este curso requiere atención inmediata"
        />
      )}
      {riesgo === 'advertencia' && (
        <AlertBanner
          nivel="advertencia"
          mensaje="Requiere esfuerzo adicional"
          detalles="Este curso necesita más dedicación"
        />
      )}

      {/* Tabla de evaluaciones */}
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
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {curso.evaluaciones.map(evaluacion => {
              const aporte = calcularAporteEvaluacion(evaluacion, curso);
              return (
                <tr key={evaluacion.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {evaluacion.label}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {evaluacion.peso}%
                  </td>
                  <td className="px-4 py-3">
                    <GradeInput
                      value={evaluacion.nota}
                      onChange={value => actualizarNota(curso.id, evaluacion.id, value)}
                      disabled={!puedeEditar}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {aporte !== null ? aporte.toFixed(2) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cambio de estado */}
      {transicionesPermitidas.length > 0 && (
        <div className="flex items-center gap-2 pt-3 pb-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">Cambiar estado:</span>
          {transicionesPermitidas.map(estado => (
            <button
              key={estado}
              onClick={() => cambiarEstado(curso.id, estado)}
              className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {nombreEstado[estado]}
            </button>
          ))}
        </div>
      )}

      {/* Promedio */}
      {promedio !== null && (
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
      {curso.estado === 'en-curso' && <MinGradeCalculator curso={curso} />}

      {/* Botón agregar evaluación */}
      {puedeEditar && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          {!mostrarFormulario ? (
            <button
              onClick={() => setMostrarFormulario(true)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              + Agregar evaluación
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nombre (ej: PC4)"
                  value={nuevoLabel}
                  onChange={e => setNuevoLabel(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <input
                  type="number"
                  placeholder="Peso %"
                  value={nuevoPeso}
                  onChange={e => setNuevoPeso(e.target.value)}
                  min="1"
                  max="100"
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAgregarEvaluacion}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                >
                  Agregar
                </button>
                <button
                  onClick={() => {
                    setMostrarFormulario(false);
                    setNuevoLabel('');
                    setNuevoPeso('');
                  }}
                  className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm"
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
