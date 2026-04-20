import { useCoursesStore } from '../../store/coursesStore';
import {
  calcularAvanceCursos,
  calcularAvanceCreditos,
  contarCursosPorEstado,
  proyectarCiclosRestantes,
} from '../../utils/progressUtils';
import { calcularPromedioPonderado } from '../../utils/gradeCalculations';
import MetricCards from './MetricCards';
import Charts from './Charts';
import AlertSection from './AlertSection';
import CurrentCourses from './CurrentCourses';
import html2canvas from 'html2canvas';
import { useRef } from 'react';

export default function Dashboard() {
  const { cursos } = useCoursesStore();
  const dashboardRef = useRef<HTMLDivElement>(null);

  const avanceCursos = calcularAvanceCursos(cursos);
  const { completados, total, porcentaje } = calcularAvanceCreditos(cursos);
  const promedioPonderado = calcularPromedioPonderado(cursos);
  const contadores = contarCursosPorEstado(cursos);
  const { ciclosRestantes, creditosPendientes } = proyectarCiclosRestantes(cursos);

  const exportarDashboard = async () => {
    if (!dashboardRef.current) return;

    try {
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: null,
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `utp-tracker-dashboard-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error exportando dashboard:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Fernandez Hernandez, Ademir Alfredo - SIST26P2A
          </p>
        </div>
        <button
          onClick={exportarDashboard}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Exportar PNG
        </button>
      </div>

      <div ref={dashboardRef}>
        <MetricCards
          avanceCursos={avanceCursos}
          creditosCompletados={completados}
          creditosTotales={total}
          promedioPonderado={promedioPonderado}
          cursosAprobados={contadores.aprobados}
          cursosEnCurso={contadores.enCurso}
          cursosPendientes={contadores.pendientes}
        />

        {/* Barra de progreso motivacional */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">Tu progreso general</h3>
              <p className="text-sm opacity-90 mt-1">
                {completados} de {total} créditos completados
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{porcentaje}%</p>
              <p className="text-xs opacity-90">Completado</p>
            </div>
          </div>
          <div className="h-4 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-1000 rounded-full"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
          <div className="mt-4 text-sm opacity-90">
            Proyección: {ciclosRestantes > 0 ? `${ciclosRestantes} ciclo(s) restante(s)` : 'Próximo a egresar'} ({creditosPendientes} créditos pendientes)
          </div>
        </div>

        <Charts cursos={cursos} contadores={contadores} />

        <AlertSection cursos={cursos} />

        <CurrentCourses cursos={cursos} />
      </div>
    </div>
  );
}
