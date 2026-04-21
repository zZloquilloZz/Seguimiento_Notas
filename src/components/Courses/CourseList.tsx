import { useState } from 'react';
import { useCoursesStore } from '../../store/coursesStore';
import { obtenerCiclosUnicos, filtrarCursosPorBusqueda } from '../../utils/progressUtils';
import { calcularPromedioCiclo } from '../../utils/gradeCalculations';
import type { EstadoCurso } from '../../models.js';
import CourseCard from './CourseCard';

export default function CourseList() {
  const { cursos } = useCoursesStore();
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoCurso | 'todos' | 'electivos'>('todos');
  const [ciclosExpandidos, setCiclosExpandidos] = useState<Set<number>>(new Set()); // Todos los ciclos colapsados por defecto

  const cursosFiltrados = filtrarCursosPorBusqueda(cursos, busqueda).filter(curso => {
    if (filtroEstado === 'todos') return true;
    if (filtroEstado === 'electivos') return curso.tipo === 'electivo';
    return curso.estado === filtroEstado;
  });

  const ciclos = obtenerCiclosUnicos(cursosFiltrados);

  const toggleCiclo = (ciclo: number) => {
    const nuevoSet = new Set(ciclosExpandidos);
    if (nuevoSet.has(ciclo)) {
      nuevoSet.delete(ciclo);
    } else {
      nuevoSet.add(ciclo);
    }
    setCiclosExpandidos(nuevoSet);
  };

  const filtros: { id: EstadoCurso | 'todos' | 'electivos'; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'aprobado', label: 'Aprobados' },
    { id: 'desaprobado', label: 'Desaprobados' },
    { id: 'convalidado', label: 'Convalidados' },
    { id: 'en-curso', label: 'En curso' },
    { id: 'pendiente', label: 'Pendientes' },
    { id: 'electivos', label: 'Electivos' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mis cursos</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gestiona tus evaluaciones y consulta tus promedios
        </p>
      </div>

      {/* Barra de búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {filtros.map(filtro => (
          <button
            key={filtro.id}
            onClick={() => setFiltroEstado(filtro.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtroEstado === filtro.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {filtro.label}
          </button>
        ))}
      </div>

      {/* Lista de cursos por ciclo */}
      <div className="space-y-4">
        {ciclos.map(ciclo => {
          const cursosCiclo = cursosFiltrados.filter(c => c.ciclo === ciclo);
          const cursosEnCurso = cursosCiclo.filter(c => c.estado === 'en-curso').length;
          const promedioCiclo = calcularPromedioCiclo(cursos, ciclo);
          const expandido = ciclosExpandidos.has(ciclo);

          return (
            <div
              key={ciclo}
              className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => toggleCiclo(ciclo)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Ciclo {ciclo}
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {cursosCiclo.length} curso{cursosCiclo.length !== 1 ? 's' : ''}
                  </span>
                  {cursosEnCurso > 0 && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                      {cursosEnCurso} en curso
                    </span>
                  )}
                  {promedioCiclo !== null && (
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                        promedioCiclo >= 11.5
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}
                    >
                      Promedio: {promedioCiclo.toFixed(1)}
                    </span>
                  )}
                </div>
                <svg
                  className={`w-6 h-6 text-gray-400 transition-transform ${
                    expandido ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {expandido && (
                <div className="px-6 pb-6 space-y-5">
                  {cursosCiclo.map(curso => (
                    <CourseCard key={curso.id} curso={curso} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {cursosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No se encontraron cursos con los filtros aplicados
          </p>
        </div>
      )}
    </div>
  );
}
