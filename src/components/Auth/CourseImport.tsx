import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { parsearPDF, type CursoParsed } from '../../utils/pdfParser';
import type { EstadoCurso, TipoCurso } from '../../models';

interface CourseImportProps {
  userId: string;
  onComplete: () => void;
}

export default function CourseImport({ userId, onComplete }: CourseImportProps) {
  const [modo, setModo] = useState<'seleccionar' | 'pdf' | 'manual'>('seleccionar');
  const [cursos, setCursos] = useState<CursoParsed[]>([]);
  const [loading, setLoading] = useState(false);
  const [parseando, setParseando] = useState(false);

  // Manual
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [creditos, setCreditos] = useState('');
  const [ciclo, setCiclo] = useState('');
  const [estado, setEstado] = useState<EstadoCurso>('pendiente');
  const [tipo, setTipo] = useState<TipoCurso>('obligatorio');

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseando(true);

    try {
      const resultado = await parsearPDF(file);
      setCursos(resultado.cursos);
      setModo('pdf');
    } catch (error: any) {
      alert(error.message || 'Error al procesar el PDF');
    } finally {
      setParseando(false);
    }
  };

  const handleAgregarManual = () => {
    if (
      !codigo.trim() ||
      !nombre.trim() ||
      !creditos ||
      !ciclo ||
      parseFloat(creditos) <= 0 ||
      parseInt(ciclo) < 1 ||
      parseInt(ciclo) > 12
    ) {
      alert('Por favor completa todos los campos correctamente');
      return;
    }

    const nuevoCurso: CursoParsed = {
      codigo: codigo.trim(),
      nombre: nombre.trim(),
      creditos: parseFloat(creditos),
      ciclo: parseInt(ciclo),
      estado,
      tipo,
    };

    setCursos([...cursos, nuevoCurso]);
    setCodigo('');
    setNombre('');
    setCreditos('');
    setCiclo('');
    setEstado('pendiente');
    setTipo('obligatorio');
  };

  const handleEliminarCurso = (index: number) => {
    setCursos(cursos.filter((_, i) => i !== index));
  };

  const handleEditarCurso = (
    index: number,
    campo: keyof CursoParsed,
    valor: string | number
  ) => {
    const nuevoCursos = [...cursos];
    (nuevoCursos[index] as any)[campo] = valor;
    setCursos(nuevoCursos);
  };

  const handleConfirmar = async () => {
    if (cursos.length === 0) {
      alert('Debes agregar al menos un curso');
      return;
    }

    setLoading(true);

    try {
      const cursosDB = cursos.map(c => ({
        user_id: userId,
        codigo: c.codigo,
        nombre: c.nombre,
        ciclo: c.ciclo,
        creditos: c.creditos,
        estado: c.estado,
        tipo: c.tipo,
      }));

      const { error } = await supabase.from('cursos').insert(cursosDB);

      if (error) throw error;

      onComplete();
    } catch (error) {
      console.error('Error importando cursos:', error);
      alert('Error al importar cursos');
    } finally {
      setLoading(false);
    }
  };

  if (parseando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Analizando tu plan de estudios...
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Importando {cursos.length} cursos...
          </p>
        </div>
      </div>
    );
  }

  if (modo === 'seleccionar') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Importar cursos
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Paso 2 de 2</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Subir PDF
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Sube el PDF de tu plan de estudios descargado desde el portal de tu
                universidad
              </p>
              <label className="cursor-pointer inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Seleccionar PDF
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handlePDFUpload}
                />
              </label>
            </div>

            <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Ingresar manualmente
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Agrega tus cursos uno por uno completando un formulario
              </p>
              <button
                onClick={() => setModo('manual')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Comenzar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (modo === 'pdf' || (modo === 'manual' && cursos.length > 0)) {
    const stats = {
      aprobados: cursos.filter(c => c.estado === 'aprobado').length,
      convalidados: cursos.filter(c => c.estado === 'convalidado').length,
      enCurso: cursos.filter(c => c.estado === 'en-curso').length,
      pendientes: cursos.filter(c => c.estado === 'pendiente').length,
    };

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Confirmar cursos
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {cursos.length} cursos detectados - Verifica que todo esté correcto
            </p>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                {stats.aprobados}
              </div>
              <div className="text-sm text-green-600 dark:text-green-500">Aprobados</div>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {stats.convalidados}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-500">
                Convalidados
              </div>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                {stats.enCurso}
              </div>
              <div className="text-sm text-yellow-600 dark:text-yellow-500">
                En curso
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {stats.pendientes}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pendientes</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Código
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Créditos
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Ciclo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Tipo
                    </th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {cursos.map((curso, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={curso.codigo}
                          onChange={e =>
                            handleEditarCurso(index, 'codigo', e.target.value)
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={curso.nombre}
                          onChange={e =>
                            handleEditarCurso(index, 'nombre', e.target.value)
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={curso.creditos}
                          onChange={e =>
                            handleEditarCurso(
                              index,
                              'creditos',
                              parseFloat(e.target.value)
                            )
                          }
                          step="0.1"
                          min="0.1"
                          max="10"
                          className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={curso.ciclo}
                          onChange={e =>
                            handleEditarCurso(index, 'ciclo', parseInt(e.target.value))
                          }
                          min="1"
                          max="12"
                          className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={curso.estado}
                          onChange={e =>
                            handleEditarCurso(
                              index,
                              'estado',
                              e.target.value as EstadoCurso
                            )
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="en-curso">En curso</option>
                          <option value="aprobado">Aprobado</option>
                          <option value="convalidado">Convalidado</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={curso.tipo}
                          onChange={e =>
                            handleEditarCurso(
                              index,
                              'tipo',
                              e.target.value as TipoCurso
                            )
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="obligatorio">Obligatorio</option>
                          <option value="electivo">Electivo</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleEliminarCurso(index)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-4 justify-between">
            <button
              onClick={() => {
                setCursos([]);
                setModo('seleccionar');
              }}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <div className="flex gap-4">
              {modo === 'pdf' && (
                <button
                  onClick={() => {
                    setCursos([]);
                    setModo('manual');
                  }}
                  className="px-6 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                >
                  ¿Algo salió mal? Ingresar manualmente
                </button>
              )}
              <button
                onClick={handleConfirmar}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Confirmar e importar {cursos.length} cursos
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modo manual sin cursos agregados
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Agregar cursos manualmente
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Completa el formulario para cada curso
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Código
              </label>
              <input
                type="text"
                value={codigo}
                onChange={e => setCodigo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="MAT101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Matemática I"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Créditos
              </label>
              <input
                type="number"
                value={creditos}
                onChange={e => setCreditos(e.target.value)}
                step="0.1"
                min="0.1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ciclo
              </label>
              <input
                type="number"
                value={ciclo}
                onChange={e => setCiclo(e.target.value)}
                min="1"
                max="12"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado
              </label>
              <select
                value={estado}
                onChange={e => setEstado(e.target.value as EstadoCurso)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en-curso">En curso</option>
                <option value="aprobado">Aprobado</option>
                <option value="convalidado">Convalidado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo
              </label>
              <select
                value={tipo}
                onChange={e => setTipo(e.target.value as TipoCurso)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="obligatorio">Obligatorio</option>
                <option value="electivo">Electivo</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleAgregarManual}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Agregar curso
          </button>
        </div>

        {cursos.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Cursos agregados ({cursos.length})
            </h3>
            <div className="space-y-2">
              {cursos.map((curso, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {curso.codigo} - {curso.nombre}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {curso.creditos} créditos • Ciclo {curso.ciclo} • {curso.estado}
                    </div>
                  </div>
                  <button
                    onClick={() => handleEliminarCurso(index)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-between">
          <button
            onClick={() => setModo('seleccionar')}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
          >
            Volver
          </button>
          {cursos.length > 0 && (
            <button
              onClick={handleConfirmar}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Finalizar ({cursos.length} cursos)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
