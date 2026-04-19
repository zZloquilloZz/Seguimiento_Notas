import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Curso } from '../../models.js';
import { calcularPromedioCiclo } from '../../utils/gradeCalculations';
import { obtenerCiclosUnicos } from '../../utils/progressUtils';

interface ProgressChartProps {
  cursos: Curso[];
}

export default function ProgressChart({ cursos }: ProgressChartProps) {
  const cursosCompletados = cursos.filter(
    c => c.estado === 'aprobado' || c.estado === 'convalidado'
  );

  const ciclos = obtenerCiclosUnicos(cursosCompletados);

  const data = ciclos
    .map(ciclo => {
      const promedio = calcularPromedioCiclo(cursos, ciclo);
      return promedio !== null
        ? {
            ciclo: `C${ciclo}`,
            promedio: Number(promedio.toFixed(1)),
          }
        : null;
    })
    .filter(item => item !== null);

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Evolución del promedio
        </h3>
        <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
          No hay datos suficientes para mostrar
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Evolución del promedio por ciclo
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="ciclo" />
          <YAxis domain={[0, 20]} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="promedio"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Promedio"
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
          />
          {/* Línea de referencia en 11.5 */}
          <Line
            type="monotone"
            dataKey={() => 11.5}
            stroke="#ef4444"
            strokeDasharray="5 5"
            name="Mínimo aprobatorio"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>La línea roja punteada indica el promedio mínimo para aprobar (11.5)</p>
      </div>
    </div>
  );
}
