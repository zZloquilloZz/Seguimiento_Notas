import type { EstadoCurso, TipoCurso } from '../../models.js';

interface BadgeProps {
  tipo: 'estado' | 'tipo';
  valor: EstadoCurso | TipoCurso;
}

export default function Badge({ tipo, valor }: BadgeProps) {
  if (tipo === 'estado') {
    const estado = valor as EstadoCurso;
    const estilos = {
      aprobado: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      desaprobado: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      convalidado: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      'en-curso': 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',
      pendiente: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    };

    const textos = {
      aprobado: 'Aprobado',
      desaprobado: 'Desaprobado',
      convalidado: 'Convalidado',
      'en-curso': 'En curso',
      pendiente: 'Pendiente',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estilos[estado]}`}
      >
        <span
          className={`w-2 h-2 mr-1.5 rounded-full ${
            estado === 'aprobado'
              ? 'bg-green-800 dark:bg-green-300'
              : estado === 'desaprobado'
              ? 'bg-red-800 dark:bg-red-300'
              : estado === 'convalidado'
              ? 'bg-blue-800 dark:bg-blue-300'
              : estado === 'en-curso'
              ? 'bg-amber-800 dark:bg-amber-300'
              : 'bg-gray-700 dark:bg-gray-300'
          }`}
        />
        {textos[estado]}
      </span>
    );
  }

  // tipo === 'tipo'
  const tipoCurso = valor as TipoCurso;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        tipoCurso === 'obligatorio'
          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      }`}
    >
      {tipoCurso === 'obligatorio' ? 'Obligatorio' : 'Electivo'}
    </span>
  );
}
