import { create } from 'zustand';
import type { Curso, AppData, NotaGuardada, EstadoCurso, EstadoModificado } from '../models.js';
import { initialCourses } from '../data/initialCourses';

const STORAGE_KEY = 'utp_tracker_data';

interface CoursesState {
  cursos: Curso[];
  darkMode: boolean;
  actualizarNota: (cursoId: string, evaluacionId: string, nota: number | null) => void;
  agregarEvaluacion: (cursoId: string, label: string, peso: number) => void;
  cambiarEstado: (cursoId: string, nuevoEstado: EstadoCurso) => void;
  toggleDarkMode: () => void;
  cargarDatos: () => void;
  guardarDatos: () => void;
  exportarDatos: () => void;
  importarDatos: (data: AppData) => void;
}

// Cargar datos desde localStorage
function cargarDesdeStorage(): Curso[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return initialCourses;

    const appData: AppData = JSON.parse(data);

    // Merge: datos base + notas guardadas + estados modificados
    return initialCourses.map(curso => {
      const notasGuardadas = appData.notas.find(n => n.cursoId === curso.id);
      const estadoModificado = appData.estadosModificados?.find(e => e.cursoId === curso.id);

      let cursoActualizado = { ...curso };

      // Aplicar estado modificado si existe
      if (estadoModificado) {
        cursoActualizado.estado = estadoModificado.estadoActual;
      }

      // Aplicar notas guardadas si existen
      if (notasGuardadas) {
        cursoActualizado.evaluaciones = curso.evaluaciones.map(evaluacion => {
          const notaGuardada = notasGuardadas.evaluaciones[evaluacion.id];
          if (!notaGuardada) return evaluacion;

          return {
            ...evaluacion,
            nota: notaGuardada.nota,
          };
        });
      }

      return cursoActualizado;
    });
  } catch (error) {
    console.error('Error cargando datos:', error);
    return initialCourses;
  }
}

// Guardar datos en localStorage
function guardarEnStorage(cursos: Curso[]): void {
  try {
    const notas: NotaGuardada[] = cursos
      .filter(c => c.evaluaciones.some(e => e.nota !== null))
      .map(curso => ({
        cursoId: curso.id,
        evaluaciones: curso.evaluaciones
          .filter(e => e.nota !== null)
          .reduce(
            (acc, e) => ({
              ...acc,
              [e.id]: {
                nota: e.nota!,
                timestamp: Date.now(),
              },
            }),
            {}
          ),
      }));

    // Recopilar estados modificados comparando con initialCourses
    const estadosModificados: EstadoModificado[] = cursos
      .filter(c => {
        const cursoInicial = initialCourses.find(ic => ic.id === c.id);
        return cursoInicial && cursoInicial.estado !== c.estado;
      })
      .map(curso => {
        const cursoInicial = initialCourses.find(ic => ic.id === curso.id)!;
        return {
          cursoId: curso.id,
          estadoAnterior: cursoInicial.estado,
          estadoActual: curso.estado,
          timestamp: Date.now(),
        };
      });

    const appData: AppData = {
      notas,
      estadosModificados,
      lastUpdated: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  } catch (error) {
    console.error('Error guardando datos:', error);
  }
}

export const useCoursesStore = create<CoursesState>((set, get) => ({
  cursos: cargarDesdeStorage(),
  darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,

  actualizarNota: (cursoId, evaluacionId, nota) => {
    set(state => ({
      cursos: state.cursos.map(curso => {
        if (curso.id !== cursoId) return curso;

        return {
          ...curso,
          evaluaciones: curso.evaluaciones.map(evaluacion => {
            if (evaluacion.id !== evaluacionId) return evaluacion;
            return { ...evaluacion, nota };
          }),
        };
      }),
    }));
    get().guardarDatos();
  },

  agregarEvaluacion: (cursoId, label, peso) => {
    set(state => ({
      cursos: state.cursos.map(curso => {
        if (curso.id !== cursoId) return curso;

        const nuevaEvaluacion = {
          id: `${cursoId}-${label}-${Date.now()}`,
          label,
          peso,
          nota: null,
        };

        return {
          ...curso,
          evaluaciones: [...curso.evaluaciones, nuevaEvaluacion],
        };
      }),
    }));
    get().guardarDatos();
  },

  cambiarEstado: (cursoId, nuevoEstado) => {
    set(state => ({
      cursos: state.cursos.map(curso => {
        if (curso.id !== cursoId) return curso;
        return { ...curso, estado: nuevoEstado };
      }),
    }));
    get().guardarDatos();
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

  cargarDatos: () => {
    set({ cursos: cargarDesdeStorage() });
  },

  guardarDatos: () => {
    guardarEnStorage(get().cursos);
  },

  exportarDatos: () => {
    const cursos = get().cursos;
    const notas: NotaGuardada[] = cursos
      .filter(c => c.evaluaciones.some(e => e.nota !== null))
      .map(curso => ({
        cursoId: curso.id,
        evaluaciones: curso.evaluaciones
          .filter(e => e.nota !== null)
          .reduce(
            (acc, e) => ({
              ...acc,
              [e.id]: {
                nota: e.nota!,
                timestamp: Date.now(),
              },
            }),
            {}
          ),
      }));

    const estadosModificados: EstadoModificado[] = cursos
      .filter(c => {
        const cursoInicial = initialCourses.find(ic => ic.id === c.id);
        return cursoInicial && cursoInicial.estado !== c.estado;
      })
      .map(curso => {
        const cursoInicial = initialCourses.find(ic => ic.id === curso.id)!;
        return {
          cursoId: curso.id,
          estadoAnterior: cursoInicial.estado,
          estadoActual: curso.estado,
          timestamp: Date.now(),
        };
      });

    const appData: AppData = {
      notas,
      estadosModificados,
      lastUpdated: Date.now(),
    };

    const dataStr = JSON.stringify(appData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fecha = new Date().toISOString().split('T')[0];
    link.download = `utp-tracker-backup-${fecha}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  },

  importarDatos: (data: AppData) => {
    try {
      // Merge: datos base + datos importados
      const cursosActualizados = initialCourses.map(curso => {
        const notasGuardadas = data.notas.find(n => n.cursoId === curso.id);
        const estadoModificado = data.estadosModificados?.find(e => e.cursoId === curso.id);

        let cursoActualizado = { ...curso };

        // Aplicar estado modificado si existe
        if (estadoModificado) {
          cursoActualizado.estado = estadoModificado.estadoActual;
        }

        // Aplicar notas guardadas si existen
        if (notasGuardadas) {
          cursoActualizado.evaluaciones = curso.evaluaciones.map(evaluacion => {
            const notaGuardada = notasGuardadas.evaluaciones[evaluacion.id];
            if (!notaGuardada) return evaluacion;

            return {
              ...evaluacion,
              nota: notaGuardada.nota,
            };
          });
        }

        return cursoActualizado;
      });

      set({ cursos: cursosActualizados });
      get().guardarDatos();
    } catch (error) {
      console.error('Error importando datos:', error);
      throw error;
    }
  },
}));
