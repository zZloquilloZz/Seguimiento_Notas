import { useToastStore } from '../../store/toastStore';
import type { TipoToast } from '../../store/toastStore';

// Estilos por tipo de toast
const ESTILOS: Record<TipoToast, string> = {
  error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
  exito: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
  info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
};

export default function Toast() {
  const { toasts, cerrarToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => (
        <div
          key={toast.id}
          role="alert"
          className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg animate-[fadeIn_0.2s_ease-out] ${ESTILOS[toast.tipo]}`}
        >
          <p className="flex-1 text-sm font-medium">{toast.mensaje}</p>
          <button
            onClick={() => cerrarToast(toast.id)}
            className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Cerrar"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
