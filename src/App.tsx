import { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { useCoursesStore } from './store/coursesStore';
import type { User } from '@supabase/supabase-js';

// Componentes de autenticación
import Login from './components/Auth/Login';
import ProfileForm from './components/Auth/ProfileForm';
import CourseImport from './components/Auth/CourseImport';

// Componentes de la app
import Sidebar from './components/shared/Sidebar';
import BottomNav from './components/shared/BottomNav';
import Dashboard from './components/Dashboard/Dashboard';
import CourseList from './components/Courses/CourseList';
import GradeSimulator from './components/Calculator/GradeSimulator';
import HistoryTimeline from './components/History/HistoryTimeline';
import ProgressChart from './components/History/ProgressChart';

function App() {
  const [vistaActual, setVistaActual] = useState('dashboard');
  const { darkMode, cursos, cargarCursos, loading, resetCursosYaCargados } = useCoursesStore();

  const [user, setUser] = useState<User | null>(null);
  const [tienePerfil, setTienePerfil] = useState(false);
  const [tieneCursos, setTieneCursos] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Ref para guardar el userId actual y evitar recargas innecesarias
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Configurar dark mode inicial
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }

    // Verificar sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      const userId = session?.user?.id ?? null;
      setUser(session?.user ?? null);

      if (userId) {
        currentUserIdRef.current = userId;
        verificarEstadoUsuario(userId);
      } else {
        currentUserIdRef.current = null;
        setCheckingAuth(false);
      }
    });

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user?.id ?? null;
      const userIdCambio = userId !== currentUserIdRef.current;

      setUser(session?.user ?? null);

      if (userId && userIdCambio) {
        // Solo verificar si el usuario cambió
        console.log('Usuario cambió, verificando estado...');
        currentUserIdRef.current = userId;
        resetCursosYaCargados(); // Reset para que cargue los datos del nuevo usuario
        verificarEstadoUsuario(userId);
      } else if (!userId) {
        // Usuario se deslogueó
        currentUserIdRef.current = null;
        resetCursosYaCargados();
        setCheckingAuth(false);
      } else {
        // Mismo usuario, no hacer nada
        console.log('Mismo usuario, omitiendo verificación');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const verificarEstadoUsuario = async (userId: string) => {
    try {
      // Verificar perfil
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', userId)
        .single();

      setTienePerfil(!!perfil);

      if (perfil) {
        // Verificar cursos
        const { data: cursos } = await supabase
          .from('cursos')
          .select('id')
          .eq('user_id', userId)
          .limit(1);

        setTieneCursos((cursos?.length ?? 0) > 0);

        // Si tiene cursos, cargarlos
        if ((cursos?.length ?? 0) > 0) {
          await cargarCursos();
        }
      }

      setCheckingAuth(false);
    } catch (error) {
      console.error('Error verificando estado:', error);
      setCheckingAuth(false);
    }
  };

  const handlePerfilCompletado = () => {
    setTienePerfil(true);
  };

  const handleCursosImportados = async () => {
    setTieneCursos(true);
    await cargarCursos(true); // Forzar carga después de importar
  };

  const renderVista = () => {
    switch (vistaActual) {
      case 'dashboard':
        return <Dashboard />;
      case 'cursos':
        return <CourseList />;
      case 'historial':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Historial y análisis
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Revisa tu evolución académica
              </p>
            </div>
            <ProgressChart cursos={cursos} />
            <HistoryTimeline cursos={cursos} />
          </div>
        );
      case 'calculadora':
        return <GradeSimulator />;
      default:
        return <Dashboard />;
    }
  };

  // Loading state mientras verifica autenticación
  if (checkingAuth || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // Estado 1: Usuario no autenticado
  if (!user) {
    return <Login />;
  }

  // Estado 2a: Usuario autenticado sin perfil
  if (!tienePerfil) {
    return <ProfileForm user={user} onComplete={handlePerfilCompletado} />;
  }

  // Estado 2b: Usuario con perfil pero sin cursos
  if (!tieneCursos) {
    return <CourseImport userId={user.id} onComplete={handleCursosImportados} />;
  }

  // Estado 3: Usuario con cursos → app normal
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar vistaActual={vistaActual} cambiarVista={setVistaActual} />

      <div className="lg:pl-60">
        <main className="py-8 px-6 sm:px-8 lg:px-10 pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto">{renderVista()}</div>
        </main>
      </div>

      <BottomNav vistaActual={vistaActual} cambiarVista={setVistaActual} />
    </div>
  );
}

export default App;
