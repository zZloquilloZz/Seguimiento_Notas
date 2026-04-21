import { useState, useEffect } from 'react';
import { useCoursesStore } from '../../store/coursesStore';
import { supabase } from '../../lib/supabase';
import type { Perfil } from '../../types/database';

interface SidebarProps {
  vistaActual: string;
  cambiarVista: (vista: string) => void;
}

export default function Sidebar({ vistaActual, cambiarVista }: SidebarProps) {
  const { darkMode, toggleDarkMode } = useCoursesStore();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setPerfil(data);
      }

      // Obtener avatar de Google
      if (user.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url);
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
    }
  };

  const handleCerrarSesion = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', color: 'bg-blue-600' },
    { id: 'cursos', label: 'Mis cursos', color: 'bg-green-600' },
    { id: 'historial', label: 'Historial', color: 'bg-purple-600' },
    { id: 'calculadora', label: 'Calculadora', color: 'bg-orange-600' },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="text-center w-full">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">UTP Tracker</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Seguimiento Académico
            </p>
          </div>
        </div>

        <nav className="mt-8 flex-1 px-2 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => cambiarVista(item.id)}
              className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                vistaActual === item.id
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full mr-3 ${item.color}`}></div>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                {perfil?.nombre?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                {perfil?.nombre || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {perfil?.programa || 'Cargando...'}
              </p>
            </div>
          </div>

          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <div
              className={`w-3 h-3 rounded-full ${darkMode ? 'bg-yellow-400' : 'bg-gray-800'}`}
            ></div>
            {darkMode ? 'Modo claro' : 'Modo oscuro'}
          </button>

          <button
            onClick={handleCerrarSesion}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  );
}
