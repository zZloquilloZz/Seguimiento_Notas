import { create } from 'zustand';
import type { Curso, EstadoCurso } from '../models.js';
import { supabase } from '../lib/supabase';
import type { CursoDB, EvaluacionDB } from '../types/database';

interface CoursesState {
  cursos: Curso[];
  darkMode: boolean;
  loading: boolean;
  error: string | null;
  cursosYaCargados: boolean;
  cargarCursos: (forzar?: boolean) => Promise<void>;
  actualizarNota: (evaluacionId: string, nota: number | null) => Promise<void>;
  actualizarEvaluacion: (evaluacionId: string, label: string, peso: number) => Promise<void>;
  agregarEvaluacion: (cursoId: string, label: string, peso: number) => Promise<void>;
  agregarEvaluacionesMultiples: (
    cursoId: string,
    evaluaciones: Array<{ label: string; peso: number }>
  ) => Promise<void>;
  eliminarEvaluacion: (evaluacionId: string) => Promise<void>;
  cambiarEstado: (cursoId: string, nuevoEstado: EstadoCurso) => Promise<void>;
  toggleDarkMode: () => void;
  resetCursosYaCargados: () => void;
}

export const useCoursesStore = create<CoursesState>((set, get) => ({
  cursos: [],
  darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
  loading: false,
  error: null,
  cursosYaCargados: false,

  cargarCursos: async (forzar = false) => {
    // Si ya se cargaron y no se fuerza, no recargar
    if (get().cursosYaCargados && !forzar) {
      console.log('Cursos ya cargados, omitiendo recarga');
      return;
    }

    set({ loading: true, error: null });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('No hay usuario autenticado');

      // Cargar cursos
      const { data: cursosDB, error: cursosError } = await supabase
        .from('cursos')
        .select('*')
        .eq('user_id', user.id)
        .order('ciclo', { ascending: true });

      if (cursosError) throw cursosError;

      // Cargar evaluaciones
      const { data: evaluacionesDB, error: evaluacionesError } = await supabase
        .from('evaluaciones')
        .select('*')
        .eq('user_id', user.id);

      if (evaluacionesError) throw evaluacionesError;

      // Combinar cursos con sus evaluaciones
      const cursos: Curso[] = (cursosDB || []).map((cursoDB: CursoDB) => ({
        id: cursoDB.id,
        codigo: cursoDB.codigo,
        nombre: cursoDB.nombre,
        ciclo: cursoDB.ciclo,
        creditos: cursoDB.creditos,
        estado: cursoDB.estado,
        tipo: cursoDB.tipo,
        evaluaciones: (evaluacionesDB || [])
          .filter((ev: EvaluacionDB) => ev.curso_id === cursoDB.id)
          .map((ev: EvaluacionDB) => ({
            id: ev.id,
            label: ev.label,
            peso: ev.peso,
            nota: ev.nota,
          })),
      }));

      set({ cursos, loading: false, cursosYaCargados: true });
    } catch (error: any) {
      console.error('Error cargando cursos:', error);
      set({ error: error.message, loading: false, cursosYaCargados: false });
    }
  },

  resetCursosYaCargados: () => {
    set({ cursosYaCargados: false });
  },

  actualizarNota: async (evaluacionId, nota) => {
    // Optimistic update
    const cursosAnteriores = get().cursos;
    set({
      cursos: cursosAnteriores.map(curso => ({
        ...curso,
        evaluaciones: curso.evaluaciones.map(ev =>
          ev.id === evaluacionId ? { ...ev, nota } : ev
        ),
      })),
    });

    try {
      const { error } = await supabase
        .from('evaluaciones')
        .update({ nota })
        .eq('id', evaluacionId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error actualizando nota:', error);
      // Revertir cambio optimista
      set({ cursos: cursosAnteriores });
      alert('Error al guardar la nota');
    }
  },

  actualizarEvaluacion: async (evaluacionId, label, peso) => {
    // Optimistic update
    const cursosAnteriores = get().cursos;
    set({
      cursos: cursosAnteriores.map(curso => ({
        ...curso,
        evaluaciones: curso.evaluaciones.map(ev =>
          ev.id === evaluacionId ? { ...ev, label, peso } : ev
        ),
      })),
    });

    try {
      const { error } = await supabase
        .from('evaluaciones')
        .update({ label, peso })
        .eq('id', evaluacionId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error actualizando evaluación:', error);
      // Revertir cambio optimista
      set({ cursos: cursosAnteriores });
      throw error;
    }
  },

  agregarEvaluacion: async (cursoId, label, peso) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('No hay usuario autenticado');

      const { data, error } = await supabase
        .from('evaluaciones')
        .insert({
          curso_id: cursoId,
          user_id: user.id,
          label,
          peso,
          nota: null,
        })
        .select()
        .single();

      if (error) throw error;

      // Actualizar estado local
      set({
        cursos: get().cursos.map(curso =>
          curso.id === cursoId
            ? {
                ...curso,
                evaluaciones: [
                  ...curso.evaluaciones,
                  {
                    id: data.id,
                    label: data.label,
                    peso: data.peso,
                    nota: data.nota,
                  },
                ],
              }
            : curso
        ),
      });
    } catch (error: any) {
      console.error('Error agregando evaluación:', error);
      alert('Error al agregar evaluación');
    }
  },

  agregarEvaluacionesMultiples: async (
    cursoId: string,
    evaluaciones: Array<{ label: string; peso: number }>
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('No hay usuario autenticado');

      // INSERT masivo
      const evaluacionesDB = evaluaciones.map(ev => ({
        curso_id: cursoId,
        user_id: user.id,
        label: ev.label,
        peso: ev.peso,
        nota: null,
      }));

      const { data, error } = await supabase
        .from('evaluaciones')
        .insert(evaluacionesDB)
        .select();

      if (error) throw error;

      // Actualizar estado local con todas las nuevas evaluaciones
      set({
        cursos: get().cursos.map(curso =>
          curso.id === cursoId
            ? {
                ...curso,
                evaluaciones: [
                  ...curso.evaluaciones,
                  ...(data || []).map(ev => ({
                    id: ev.id,
                    label: ev.label,
                    peso: ev.peso,
                    nota: ev.nota,
                  })),
                ],
              }
            : curso
        ),
      });
    } catch (error: any) {
      console.error('Error agregando evaluaciones:', error);
      throw error;
    }
  },

  eliminarEvaluacion: async (evaluacionId) => {
    const cursosAnteriores = get().cursos;

    // Optimistic update
    set({
      cursos: cursosAnteriores.map(curso => ({
        ...curso,
        evaluaciones: curso.evaluaciones.filter(ev => ev.id !== evaluacionId),
      })),
    });

    try {
      const { error } = await supabase
        .from('evaluaciones')
        .delete()
        .eq('id', evaluacionId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error eliminando evaluación:', error);
      set({ cursos: cursosAnteriores });
      alert('Error al eliminar evaluación');
    }
  },

  cambiarEstado: async (cursoId, nuevoEstado) => {
    const cursosAnteriores = get().cursos;

    // Optimistic update
    set({
      cursos: cursosAnteriores.map(curso =>
        curso.id === cursoId ? { ...curso, estado: nuevoEstado } : curso
      ),
    });

    try {
      const { error } = await supabase
        .from('cursos')
        .update({ estado: nuevoEstado })
        .eq('id', cursoId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error cambiando estado:', error);
      set({ cursos: cursosAnteriores });
      alert('Error al cambiar estado del curso');
    }
  },

  toggleDarkMode: () => {
    set(state => {
      const newDarkMode = !state.darkMode;
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { darkMode: newDarkMode };
    });
  },
}));
