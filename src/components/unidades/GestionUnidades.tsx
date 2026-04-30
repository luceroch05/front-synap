import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Layers, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { UnidadesService, Unidad, CreateUnidadDto } from '@/lib/services/unidades.service';
import { ProgramasService, Programa } from '@/lib/services/programas.service';

interface GestionUnidadesProps {
  programaId: number;
}

const emptyForm: Omit<CreateUnidadDto, 'programaId'> = { nombre: '', descripcion: '', orden: 1, peso: 0 };

export default function GestionUnidades({ programaId }: GestionUnidadesProps) {
  const navigate = useNavigate();
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [programa, setPrograma] = useState<Programa | null>(null);
  const [loading, setLoading] = useState(true);
  const [pesoTotal, setPesoTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<CreateUnidadDto, 'programaId'>>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activandoEval, setActivandoEval] = useState(false);

  useEffect(() => { cargar(); }, [programaId]);

  const cargar = async () => {
    try {
      setLoading(true);
      const [unidadesData, programaData] = await Promise.all([
        UnidadesService.findByPrograma(programaId),
        ProgramasService.findOne(programaId),
      ]);
      setUnidades(unidadesData);
      setPrograma(programaData);
      const peso = unidadesData.reduce((s, u) => s + Number(u.peso), 0);
      setPesoTotal(peso);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const activarEvaluacion = async () => {
    setActivandoEval(true);
    try {
      await ProgramasService.update(programaId, { tieneEvaluacion: true });
      await cargar();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActivandoEval(false);
    }
  };

  const abrirCrear = () => {
    setForm({ ...emptyForm, orden: unidades.length + 1 });
    setEditingId(null);
    setModalOpen(true);
  };

  const abrirEditar = (u: Unidad) => {
    setForm({ nombre: u.nombre, descripcion: u.descripcion || '', orden: u.orden, peso: u.peso });
    setEditingId(u.id);
    setModalOpen(true);
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await UnidadesService.update(editingId, form);
      } else {
        await UnidadesService.create({ ...form, programaId });
      }
      setModalOpen(false);
      await cargar();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar esta unidad?')) return;
    try {
      await UnidadesService.remove(id);
      await cargar();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const pesoRestante = 100 - pesoTotal;
  const pesoMaxEdit = editingId
    ? 100 - (pesoTotal - Number(unidades.find(u => u.id === editingId)?.peso || 0))
    : pesoRestante;

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Cargando...</p>
      </div>
    );
  }

  if (!programa) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Programa no encontrado</p>
        <button onClick={() => navigate('/dashboard/programas')} className="text-blue-600 hover:underline text-sm">
          Volver a programas
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/programas')}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Unidades</h1>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Programa: <span className="font-medium text-gray-700">{programa.nombre}</span>
            {programa.tipoPrograma && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-lg text-xs">
                {programa.tipoPrograma.nombre}
              </span>
            )}
          </p>
        </div>
        {programa.tieneEvaluacion && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={abrirCrear}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-shadow"
          >
            <Plus className="w-4 h-4" /> Nueva Unidad
          </motion.button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')} className="font-bold text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {/* Banner evaluación no activada */}
      {!programa.tieneEvaluacion && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4"
        >
          <div className="p-2 bg-amber-100 rounded-xl shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-amber-800 mb-1">
              Este programa no tiene evaluación activada
            </h3>
            <p className="text-sm text-amber-700 mb-3">
              Para gestionar unidades necesitas activar la evaluación. Las unidades organizan el contenido
              y definen los pesos de calificación del programa.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={activarEvaluacion}
              disabled={activandoEval}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
            >
              {activandoEval ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Activando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Activar evaluación
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Stats de peso */}
      {programa.tieneEvaluacion && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Unidades</p>
            <p className="text-2xl font-bold text-gray-900">{unidades.length}</p>
          </div>
          <div className={`rounded-2xl border p-4 shadow-sm ${pesoTotal === 100 ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Peso asignado</p>
            <p className={`text-2xl font-bold ${pesoTotal === 100 ? 'text-green-600' : 'text-gray-900'}`}>
              {pesoTotal}%
            </p>
          </div>
          <div className={`rounded-2xl border p-4 shadow-sm ${pesoRestante === 0 ? 'bg-gray-50 border-gray-200' : 'bg-orange-50 border-orange-200'}`}>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Peso restante</p>
            <p className={`text-2xl font-bold ${pesoRestante === 0 ? 'text-gray-400' : 'text-orange-600'}`}>
              {pesoRestante}%
            </p>
          </div>
        </div>
      )}

      {/* Tabla unidades */}
      {programa.tieneEvaluacion && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {unidades.length === 0 ? (
            <div className="p-12 text-center">
              <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-1">No hay unidades aún</p>
              <p className="text-gray-400 text-sm">Crea la primera unidad para este programa</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {['#', 'Nombre', 'Descripción', 'Peso', 'Estado', ''].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {unidades.map(u => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="w-7 h-7 flex items-center justify-center bg-purple-100 text-purple-700 rounded-lg text-xs font-bold">
                          {u.orden}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{u.nombre}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm max-w-xs truncate">{u.descripcion || '—'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                          {u.peso}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${u.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {u.activo ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => abrirEditar(u)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => eliminar(u.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal crear/editar */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Unidad' : 'Nueva Unidad'}>
        <form onSubmit={guardar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              placeholder="Nombre de la unidad"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
              rows={3}
              placeholder="Descripción opcional..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orden *</label>
              <input
                type="number"
                value={form.orden}
                onChange={e => setForm({ ...form, orden: Number(e.target.value) })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                min={1}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso (%) * <span className="text-xs text-gray-400">máx. {pesoMaxEdit}%</span>
              </label>
              <input
                type="number"
                value={form.peso}
                onChange={e => setForm({ ...form, peso: Number(e.target.value) })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                min={0}
                max={pesoMaxEdit}
                step={0.01}
                required
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <motion.button
              type="submit"
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium disabled:opacity-60 transition-opacity"
            >
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Unidad'}
            </motion.button>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
