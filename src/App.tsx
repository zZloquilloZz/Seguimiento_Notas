import { useState, useEffect } from 'react';
import { useCoursesStore } from './store/coursesStore';
import Sidebar from './components/shared/Sidebar';
import BottomNav from './components/shared/BottomNav';
import Dashboard from './components/Dashboard/Dashboard';
import CourseList from './components/Courses/CourseList';
import GradeSimulator from './components/Calculator/GradeSimulator';
import HistoryTimeline from './components/History/HistoryTimeline';
import ProgressChart from './components/History/ProgressChart';

function App() {
  const [vistaActual, setVistaActual] = useState('dashboard');
  const { darkMode, cargarDatos } = useCoursesStore();
  const { cursos } = useCoursesStore();

  useEffect(() => {
    cargarDatos();
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar vistaActual={vistaActual} cambiarVista={setVistaActual} />

      <div className="lg:pl-64">
        <main className="py-6 px-4 sm:px-6 lg:px-8 pb-20 lg:pb-6">
          <div className="max-w-7xl mx-auto">{renderVista()}</div>
        </main>
      </div>

      <BottomNav vistaActual={vistaActual} cambiarVista={setVistaActual} />
    </div>
  );
}

export default App;
