import { create } from 'zustand';

export type TipoToast = 'error' | 'exito' | 'info';

export interface Toast {
  id: string;
  tipo: TipoToast;
  mensaje: string;
}

interface ToastState {
  toasts: Toast[];
  mostrarToast: (mensaje: string, tipo?: TipoToast) => void;
  cerrarToast: (id: string) => void;
}

export const useToastStore = create<ToastState>(set => ({
  toasts: [],

  mostrarToast: (mensaje, tipo = 'error') => {
    const id = crypto.randomUUID();
    set(state => ({ toasts: [...state.toasts, { id, tipo, mensaje }] }));

    // Auto-cerrar a los 4 segundos
    setTimeout(() => {
      set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, 4000);
  },

  cerrarToast: id => {
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },
}));
