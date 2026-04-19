import type { Curso } from '../../models.js';
import { evaluarRiesgoCurso, obtenerColorRiesgo } from '../../utils/riskAssessment';
import { calcularPromedioCurso, calcularNotaMinimaRequerida } from '../../utils/gradeCalculations';

interface AlertSectionProps {
  cursos: Curso[];
}

export default function AlertSection({ cursos }: AlertSectionProps) {
  const cursosEnRiesgo = cursos
    .filter(c => c.estado === 'en-curso')
    .map(c => ({
      curso: c,
      riesgo: evaluarRiesgoCurso(c),
      promedio: calcularPromedioCurso(c),
      notaMinima: calcularNotaMinimaRequerida(c),
    }))
    .filter(item => item.riesgo === 'critico' || item.riesgo === 'advertencia')
    .sort((a, b) => {
      // Ordenar: crítico primero, luego advertencia
      if (a.riesgo === 'critico' && b.riesgo !== 'critico') return -1;
      if (a.riesgo !== 'critico' && b.riesgo === 'critico') return 1;
      return 0;
    });

  if (cursosEnRiesgo.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Atención requerida
      </h2>
      <div className="space-y-3">
        {cursosEnRiesgo.map(({ curso, riesgo, promedio, notaMinima }) => {
          const colores = obtenerColorRiesgo(riesgo);
          return (
            <div
              key={curso.id}
              className={`p-4 rounded-lg border ${colores.bg} ${colores.border}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className={`font-semibold ${colores.text}`}>
                    {curso.codigo} - {curso.nombre}
                  </h3>
                  <p className={`text-sm mt-1 ${colores.text} opacity-90`}>
                    {promedio !== null ? `Promedio actual: ${promedio}` : 'Sin notas registradas'}
                  </p>
                  <p className={`text-sm mt-1 ${colores.text} opacity-90`}>
                    {notaMinima.mensaje}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${colores.text} ${colores.bg}`}
                >
                  {riesgo === 'critico' ? 'CRÍTICO' : 'ADVERTENCIA'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
