import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface ProfileFormProps {
  user: User;
  onComplete: () => void;
}

export default function ProfileForm({ user, onComplete }: ProfileFormProps) {
  const [nombre, setNombre] = useState(user.user_metadata?.full_name || '');
  const [programa, setPrograma] = useState('');
  const [universidad, setUniversidad] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !programa.trim() || !universidad.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('perfiles').insert({
        id: user.id,
        nombre: nombre.trim(),
        programa: programa.trim(),
        universidad: universidad.trim(),
      });

      if (error) throw error;

      onComplete();
    } catch (error) {
      console.error('Error guardando perfil:', error);
      alert('Error al guardar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Completa tu perfil
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Paso 1 de 2
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Juan Pérez"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Programa / Carrera
            </label>
            <input
              type="text"
              value={programa}
              onChange={e => setPrograma(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ingeniería de Sistemas"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Universidad
            </label>
            <input
              type="text"
              value={universidad}
              onChange={e => setUniversidad(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Universidad Tecnológica del Perú"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
          >
            {loading ? 'Guardando...' : 'Continuar'}
          </button>
        </form>
      </div>
    </div>
  );
}
