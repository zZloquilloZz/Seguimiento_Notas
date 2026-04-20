import type { Curso } from '../../models.js';
import { calcularNotaMinimaRequerida } from '../../utils/gradeCalculations';

interface MinGradeCalculatorProps {
  curso: Curso;
}

export default function MinGradeCalculator({ curso }: MinGradeCalculatorProps) {
  const { mensaje, tipo } = calcularNotaMinimaRequerida(curso);

  const evaluacionesPendientes = curso.evaluaciones.filter(e => e.nota === null);

  if (evaluacionesPendientes.length === 0) {
    return null;
  }

  const colores = {
    imposible: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    garantizado: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
    necesita: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  };

  return (
    <div className={`mt-4 p-4 rounded-lg border ${colores[tipo]}`}>
      <h4 className="font-semibold mb-2">¿Cuánto necesito?</h4>
      <p className="text-sm">{mensaje}</p>
      {tipo === 'necesita' && evaluacionesPendientes.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="text-xs opacity-80">Evaluaciones pendientes:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {evaluacionesPendientes.map(ev => (
              <div key={ev.id} className="text-xs">
                {ev.label} ({ev.peso}%)
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
