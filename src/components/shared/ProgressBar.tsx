interface ProgressBarProps {
  porcentaje: number;
  aprobado?: boolean;
  showLabel?: boolean;
  altura?: 'sm' | 'md' | 'lg';
}

export default function ProgressBar({
  porcentaje,
  aprobado = true,
  showLabel = true,
  altura = 'md',
}: ProgressBarProps) {
  const alturas = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };

  const porcentajeClamped = Math.min(100, Math.max(0, porcentaje));

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${alturas[altura]} overflow-hidden`}>
        <div
          className={`${alturas[altura]} rounded-full transition-all duration-500 ${
            aprobado
              ? 'bg-gradient-to-r from-green-500 to-green-600'
              : 'bg-gradient-to-r from-red-500 to-red-600'
          }`}
          style={{ width: `${porcentajeClamped}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {aprobado ? 'Aprobado' : 'Desaprobado'}
          </span>
          <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
            {porcentajeClamped.toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  );
}
