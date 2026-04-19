interface BottomNavProps {
  vistaActual: string;
  cambiarVista: (vista: string) => void;
}

export default function BottomNav({ vistaActual, cambiarVista }: BottomNavProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Inicio', color: 'bg-blue-600' },
    { id: 'cursos', label: 'Cursos', color: 'bg-green-600' },
    { id: 'historial', label: 'Historial', color: 'bg-purple-600' },
    { id: 'calculadora', label: 'Calc', color: 'bg-orange-600' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="flex justify-around">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => cambiarVista(item.id)}
            className={`flex-1 flex flex-col items-center py-3 text-xs transition-colors ${
              vistaActual === item.id
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <div className={`w-3 h-3 rounded-full mb-1 ${item.color}`}></div>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
