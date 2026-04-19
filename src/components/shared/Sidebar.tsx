import { useCoursesStore } from '../../store/coursesStore';

interface SidebarProps {
  vistaActual: string;
  cambiarVista: (vista: string) => void;
}

export default function Sidebar({ vistaActual, cambiarVista }: SidebarProps) {
  const { darkMode, toggleDarkMode } = useCoursesStore();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', color: 'bg-blue-600' },
    { id: 'cursos', label: 'Mis cursos', color: 'bg-green-600' },
    { id: 'historial', label: 'Historial', color: 'bg-purple-600' },
    { id: 'calculadora', label: 'Calculadora', color: 'bg-orange-600' },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
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

        <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-xs font-medium text-gray-900 dark:text-white">
              Fernandez Hernandez, Ademir Alfredo
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              SIST26P2A
            </p>
          </div>

          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <div className={`w-3 h-3 rounded-full ${darkMode ? 'bg-yellow-400' : 'bg-gray-800'}`}></div>
            {darkMode ? 'Modo claro' : 'Modo oscuro'}
          </button>
        </div>
      </div>
    </aside>
  );
}
