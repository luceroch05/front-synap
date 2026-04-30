import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, UserCheck, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { ParticipantesService, Participante, CreateParticipanteDto } from '@/lib/services/participantes.service';

const emptyForm: CreateParticipanteDto = { tipoDocumento: 'DNI', numeroDocumento: '', nombres: '', apellidos: '', email: '', telefono: '' };
const TIPOS_DOC = ['DNI', 'Carné de Extranjería', 'Pasaporte', 'RUC'];

export default function ParticipantesPage() {
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateParticipanteDto>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try { setLoading(true); setParticipantes(await ParticipantesService.findAll()); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const abrirCrear = () => { setForm(emptyForm); setEditingId(null); setModalOpen(true); };

  const abrirEditar = (p: Participante) => {
    setForm({ tipoDocumento: p.tipoDocumento, numeroDocumento: p.numeroDocumento, nombres: p.nombres, apellidos: p.apellidos, email: p.email || '', telefono: p.telefono || '' });
    setEditingId(p.id); setModalOpen(true);
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      editingId ? await ParticipantesService.update(editingId, form) : await ParticipantesService.create(form);
      setModalOpen(false); await cargar();
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar este participante?')) return;
    try { await ParticipantesService.remove(id); await cargar(); } catch (e: any) { setError(e.message); }
  };

  const toggleActivo = async (id: number) => {
    try { await ParticipantesService.toggleActive(id); await cargar(); } catch (e: any) { setError(e.message); }
  };

  const filtrados = participantes.filter(p => {
    const q = search.toLowerCase();
    return p.nombres.toLowerCase().includes(q) || p.apellidos.toLowerCase().includes(q) || p.numeroDocumento.includes(q) || (p.email || '').toLowerCase().includes(q);
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Participantes</h1>
          <p className="text-sm text-gray-500 mt-1">{participantes.length} participantes registrados</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={abrirCrear}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-shadow">
          <Plus className="w-4 h-4" /> Nuevo Participante
        </motion.button>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error} <button onClick={() => setError('')} className="float-right font-bold">×</button></div>}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, documento o correo..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-gray-500 text-sm">Cargando...</p></div>
        ) : filtrados.length === 0 ? (
          <div className="p-12 text-center"><UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No hay participantes. Registra el primero.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['Documento', 'Nombres', 'Apellidos', 'Correo', 'Teléfono', 'Estado', ''].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtrados.map(p => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-400">{p.tipoDocumento}</div>
                      <div className="font-medium text-gray-900">{p.numeroDocumento}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{p.nombres}</td>
                    <td className="px-6 py-4 text-gray-700">{p.apellidos}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{p.email || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{p.telefono || '—'}</td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${p.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.activo ? 'Activo' : 'Inactivo'}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => toggleActivo(p.id)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">{p.activo ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}</button>
                        <button onClick={() => abrirEditar(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => eliminar(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Participante' : 'Nuevo Participante'}>
        <form onSubmit={guardar} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento *</label>
              <select value={form.tipoDocumento} onChange={e => setForm({ ...form, tipoDocumento: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                {TIPOS_DOC.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">N° Documento *</label>
              <input value={form.numeroDocumento} onChange={e => setForm({ ...form, numeroDocumento: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="12345678" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombres *</label>
              <input value={form.nombres} onChange={e => setForm({ ...form, nombres: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Juan Carlos" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
              <input value={form.apellidos} onChange={e => setForm({ ...form, apellidos: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="García López" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="correo@ejemplo.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="987654321" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50">
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Registrar'}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">Cancelar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
