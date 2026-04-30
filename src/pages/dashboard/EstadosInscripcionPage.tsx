import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { EstadosInscripcionService, EstadoInscripcion } from '@/lib/services/estados-inscripcion.service';

interface FormData { nombre: string; descripcion: string; }
const emptyForm: FormData = { nombre: '', descripcion: '' };

export default function EstadosInscripcionPage() {
  const [estados, setEstados] = useState<EstadoInscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try { setLoading(true); setEstados(await EstadosInscripcionService.findAll()); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      editingId ? await EstadosInscripcionService.update(editingId, form) : await EstadosInscripcionService.create(form);
      setModalOpen(false); await cargar();
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar este estado?')) return;
    try { await EstadosInscripcionService.remove(id); await cargar(); } catch (e: any) { setError(e.message); }
  };

  const badgeColors = ['bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-red-100 text-red-700', 'bg-purple-100 text-purple-700', 'bg-yellow-100 text-yellow-700'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estados de Inscripción</h1>
          <p className="text-sm text-gray-500 mt-1">Configura los posibles estados para las inscripciones</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => { setForm(emptyForm); setEditingId(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-md">
          <Plus className="w-4 h-4" /> Nuevo Estado
        </motion.button>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error} <button onClick={() => setError('')} className="float-right font-bold">×</button></div>}

      {loading ? (
        <div className="p-12 text-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {estados.map((est, idx) => (
            <motion.div key={est.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${badgeColors[idx % badgeColors.length]}`}>{est.nombre}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setForm({ nombre: est.nombre, descripcion: est.descripcion || '' }); setEditingId(est.id); setModalOpen(true); }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => eliminar(est.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <p className="text-sm text-gray-500">{est.descripcion || 'Sin descripción'}</p>
            </motion.div>
          ))}
          {estados.length === 0 && (
            <div className="col-span-3 p-12 text-center bg-white rounded-2xl border border-gray-200">
              <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay estados configurados.</p>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Estado' : 'Nuevo Estado'} size="sm">
        <form onSubmit={guardar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Ej: Aprobado, Retirado..." required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              rows={3} placeholder="Descripción del estado..." />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50">
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">Cancelar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
