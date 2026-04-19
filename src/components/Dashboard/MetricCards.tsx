interface MetricCardProps {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  icono: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

function MetricCard({ titulo, valor, subtitulo, icono, color = 'blue' }: MetricCardProps) {
  const colores = {
    blue: 'bg-blue-600 dark:bg-blue-500',
    green: 'bg-green-600 dark:bg-green-500',
    purple: 'bg-purple-600 dark:bg-purple-500',
    orange: 'bg-orange-600 dark:bg-orange-500',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${colores[color]}`}></div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{titulo}</p>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{valor}</p>
          {subtitulo && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{subtitulo}</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface MetricCardsProps {
  avanceCursos: number;
  creditosCompletados: number;
  creditosTotales: number;
  promedioPonderado: number | null;
  cursosAprobados: number;
  cursosEnCurso: number;
  cursosPendientes: number;
}

export default function MetricCards({
  avanceCursos,
  creditosCompletados,
  creditosTotales,
  promedioPonderado,
  cursosAprobados,
  cursosEnCurso,
  cursosPendientes,
}: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <MetricCard
        titulo="Avance de cursos"
        valor={`${avanceCursos}%`}
        subtitulo="Solo obligatorios"
        icono=""
        color="blue"
      />
      <MetricCard
        titulo="Créditos completados"
        valor={`${creditosCompletados}/${creditosTotales}`}
        subtitulo={`${Math.round((creditosCompletados / creditosTotales) * 100)}% del total`}
        icono=""
        color="green"
      />
      <MetricCard
        titulo="Promedio ponderado"
        valor={promedioPonderado !== null ? promedioPonderado.toFixed(1) : '—'}
        subtitulo="General"
        icono=""
        color="purple"
      />
      <MetricCard
        titulo="Cursos aprobados"
        valor={cursosAprobados}
        icono=""
        color="green"
      />
      <MetricCard
        titulo="Cursos en curso"
        valor={cursosEnCurso}
        icono=""
        color="orange"
      />
      <MetricCard
        titulo="Cursos pendientes"
        valor={cursosPendientes}
        icono=""
        color="blue"
      />
    </div>
  );
}
