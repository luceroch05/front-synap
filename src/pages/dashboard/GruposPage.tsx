import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Users, Edit2, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { GruposProgramasService, GrupoProgramas, CreateGrupoProgramaDto, ModalidadGrupo } from '@/lib/services/grupos-programas.service';
import { ProgramasService, Programa } from '@/lib/services/programas.service';

const emptyForm: CreateGrupoProgramaDto = { programaId: 0, nombreGrupo: '', fechaInicio: '', fechaFin: '', modalidad: ModalidadGrupo.PRESENCIAL };
const modalBadge: Record<string, string> = { PRESENCIAL: 'bg-blue-100 text-blue-700', VIRTUAL: 'bg-purple-100 text-purple-700', MIXTA: 'bg-orange-100 text-orange-700' };

export default function GruposPage() {
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState<GrupoProgramas[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroPrograma, setFiltroPrograma] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateGrupoProgramaDto>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const [g, p] = await Promise.all([GruposProgramasService.findAll(), ProgramasService.findAll()]);
      setGrupos(g); setProgramas(p);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const abrirCrear = () => { setForm({ ...emptyForm, programaId: programas[0]?.id || 0 }); setEditingId(null); setModalOpen(true); };

  const abrirEditar = (g: GrupoProgramas) => {
    setForm({ programaId: g.programaId, nombreGrupo: g.nombreGrupo, fechaInicio: g.fechaInicio?.split('T')[0] || '', fechaFin: g.fechaFin?.split('T')[0] || '', modalidad: g.modalidad });
    setEditingId(g.id); setModalOpen(true);
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      editingId ? await GruposProgramasService.update(editingId, form) : await GruposProgramasService.create(form);
      setModalOpen(false); await cargar();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar este grupo?')) return;
    try { await GruposProgramasService.remove(id); await cargar(); } catch (e: any) { setError(e.message); }
  };

  const toggleActivo = async (id: number) => {
    try { await GruposProgramasService.toggleActive(id); await cargar(); } catch (e: any) { setError(e.message); }
  };

  const filtrados = grupos.filter(g => {
    const q = search.toLowerCase();
    return (g.nombreGrupo.toLowerCase().includes(q) || g.programa?.nombre.toLowerCase().includes(q)) &&
      (filtroPrograma === 0 || g.programaId === filtroPrograma);
  });

  const fmtDate = (d: string) => { if (!d) return '—'; const [y, m, day] = d.split('T')[0].split('-').map(Number); return new Date(y, m - 1, day).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }); };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grupos de Programas</h1>
          <p className="text-sm text-gray-500 mt-1">{grupos.length} grupos registrados</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={abrirCrear}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-shadow">
          <Plus className="w-4 h-4" /> Nuevo Grupo
        </motion.button>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error} <button onClick={() => setError('')} className="float-right font-bold">×</button></div>}

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar grupo o programa..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
        <select value={filtroPrograma} onChange={e => setFiltroPrograma(Number(e.target.value))}
          className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
          <option value={0}>Todos los programas</option>
          {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-gray-500 text-sm">Cargando...</p></div>
        ) : filtrados.length === 0 ? (
          <div className="p-12 text-center"><Users className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No hay grupos. Crea el primero.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['Programa', 'Grupo', 'Modalidad', 'Inicio', 'Fin', 'Estado', ''].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtrados.map(g => (
                  <motion.tr key={g.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-[150px] truncate">{g.programa?.nombre || '—'}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{g.nombreGrupo}</td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${modalBadge[g.modalidad] || 'bg-gray-100 text-gray-700'}`}>{g.modalidad}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{fmtDate(g.fechaInicio)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{fmtDate(g.fechaFin)}</td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${g.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{g.activo ? 'Activo' : 'Inactivo'}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => navigate(`/dashboard/grupos/${g.id}`)} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg" title="Ver detalle"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => toggleActivo(g.id)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">{g.activo ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}</button>
                        <button onClick={() => abrirEditar(g)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => eliminar(g.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Grupo' : 'Nuevo Grupo'}>
        <form onSubmit={guardar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Programa *</label>
            <select value={form.programaId} onChange={e => setForm({ ...form, programaId: Number(e.target.value) })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required>
              <option value={0} disabled>Seleccionar programa...</option>
              {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Grupo *</label>
            <input value={form.nombreGrupo} onChange={e => setForm({ ...form, nombreGrupo: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Ej: Grupo A - Turno Noche" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad *</label>
            <select value={form.modalidad} onChange={e => setForm({ ...form, modalidad: e.target.value as ModalidadGrupo })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
              <option value="PRESENCIAL">Presencial</option>
              <option value="VIRTUAL">Virtual</option>
              <option value="MIXTA">Mixta</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio *</label>
              <input type="date" value={form.fechaInicio} onChange={e => setForm({ ...form, fechaInicio: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin *</label>
              <input type="date" value={form.fechaFin} onChange={e => setForm({ ...form, fechaFin: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50">
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Grupo'}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">Cancelar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
