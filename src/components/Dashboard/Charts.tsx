import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import type { Curso } from '../../models.js';
import { calcularPromedioCiclo } from '../../utils/gradeCalculations';
import { obtenerCiclosUnicos } from '../../utils/progressUtils';

interface ChartsProps {
  cursos: Curso[];
  contadores: {
    aprobados: number;
    convalidados: number;
    enCurso: number;
    pendientes: number;
  };
}

export default function Charts({ cursos, contadores }: ChartsProps) {
  // Datos para gráfico de dona
  const donutData = [
    { name: 'Aprobados', value: contadores.aprobados, color: '#3b6d11' },
    { name: 'Convalidados', value: contadores.convalidados, color: '#185fa5' },
    { name: 'En curso', value: contadores.enCurso, color: '#854f0b' },
    { name: 'Pendientes', value: contadores.pendientes, color: '#5f5e5a' },
  ];

  // Datos para gráfico de barras (promedio por ciclo)
  const ciclos = obtenerCiclosUnicos(cursos);
  const barData = ciclos
    .map(ciclo => {
      const promedio = calcularPromedioCiclo(cursos, ciclo);
      return promedio !== null
        ? {
            ciclo: `Ciclo ${ciclo}`,
            promedio: Number(promedio.toFixed(1)),
          }
        : null;
    })
    .filter(item => item !== null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Gráfico de dona */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Distribución por estado
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={donutData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {donutData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {donutData.map((item, index) => (
            <div key={index} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {item.name}: {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico de barras */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Promedio por ciclo
        </h3>
        {barData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} layout="vertical">
              <XAxis type="number" domain={[0, 20]} />
              <YAxis dataKey="ciclo" type="category" width={70} />
              <Tooltip />
              <Legend />
              <Bar dataKey="promedio" fill="#3b82f6" name="Promedio" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
            No hay datos suficientes para mostrar
          </div>
        )}
      </div>
    </div>
  );
}
