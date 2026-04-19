import type { EstadoCurso, TipoCurso } from '../../models.js';

interface BadgeProps {
  tipo: 'estado' | 'tipo';
  valor: EstadoCurso | TipoCurso;
}

export default function Badge({ tipo, valor }: BadgeProps) {
  if (tipo === 'estado') {
    const estado = valor as EstadoCurso;
    const estilos = {
      aprobado: 'bg-state-approved-bg text-state-approved-text',
      convalidado: 'bg-state-validated-bg text-state-validated-text',
      'en-curso': 'bg-state-current-bg text-state-current-text',
      pendiente: 'bg-state-pending-bg text-state-pending-text',
    };

    const textos = {
      aprobado: 'Aprobado',
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
              ? 'bg-state-approved-text'
              : estado === 'convalidado'
              ? 'bg-state-validated-text'
              : estado === 'en-curso'
              ? 'bg-state-current-text'
              : 'bg-state-pending-text'
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
