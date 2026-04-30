import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, BookOpen, Edit2, Trash2, Layers, ToggleLeft, ToggleRight } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { ProgramasService, Programa, CreateProgramaDto } from '@/lib/services/programas.service';
import { TiposProgramaService, TipoPrograma } from '@/lib/services/tipos-programa.service';

const emptyForm: CreateProgramaDto = { tipoProgramaId: 0, nombre: '', descripcion: '', horasAcademicas: 0, tieneEvaluacion: false, notaMinimaAprobatoria: 13 };

export default function ProgramasPage() {
  const navigate = useNavigate();
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [tipos, setTipos] = useState<TipoPrograma[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateProgramaDto>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const [p, t] = await Promise.all([ProgramasService.findAll(), TiposProgramaService.findAll()]);
      setProgramas(p);
      setTipos(t);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const abrirCrear = () => {
    setForm({ ...emptyForm, tipoProgramaId: tipos[0]?.id || 0 });
    setEditingId(null);
    setModalOpen(true);
  };

  const abrirEditar = (p: Programa) => {
    setForm({ tipoProgramaId: p.tipoProgramaId, nombre: p.nombre, descripcion: p.descripcion, horasAcademicas: p.horasAcademicas, tieneEvaluacion: p.tieneEvaluacion, notaMinimaAprobatoria: p.notaMinimaAprobatoria });
    setEditingId(p.id);
    setModalOpen(true);
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      editingId ? await ProgramasService.update(editingId, form) : await ProgramasService.create(form);
      setModalOpen(false);
      await cargar();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar este programa?')) return;
    try { await ProgramasService.remove(id); await cargar(); }
    catch (e: any) { setError(e.message); }
  };

  const toggleActivo = async (id: number) => {
    try { await ProgramasService.toggleActive(id); await cargar(); }
    catch (e: any) { setError(e.message); }
  };

  const filtrados = programas.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.tipoPrograma?.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Programas</h1>
          <p className="text-sm text-gray-500 mt-1">{programas.length} programas registrados</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={abrirCrear}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-shadow">
          <Plus className="w-4 h-4" /> Nuevo Programa
        </motion.button>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error} <button onClick={() => setError('')} className="float-right font-bold">×</button></div>}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o tipo..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Cargando...</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No hay programas. Crea el primero.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['Tipo', 'Nombre', 'Descripción', 'Horas', 'Evaluación', 'Estado', ''].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtrados.map(p => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">{p.tipoPrograma?.nombre || '—'}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{p.nombre}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm max-w-xs truncate">{p.descripcion || '—'}</td>
                    <td className="px-6 py-4 text-gray-700 whitespace-nowrap">{p.horasAcademicas}h</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${p.tieneEvaluacion ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-400'}`}>
                        {p.tieneEvaluacion ? `Sí (≥${p.notaMinimaAprobatoria})` : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${p.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => navigate(`/dashboard/programas/${p.id}/unidades`)}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Gestionar Unidades">
                          <Layers className="w-4 h-4" />
                        </button>
                        <button onClick={() => toggleActivo(p.id)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                          {p.activo ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button onClick={() => abrirEditar(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => eliminar(p.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Programa' : 'Nuevo Programa'}>
        <form onSubmit={guardar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Programa *</label>
            <select value={form.tipoProgramaId} onChange={e => setForm({ ...form, tipoProgramaId: Number(e.target.value) })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required>
              <option value={0} disabled>Seleccionar tipo...</option>
              {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Nombre del programa" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              rows={3} placeholder="Descripción del programa..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Horas Académicas *</label>
            <input type="number" value={form.horasAcademicas} onChange={e => setForm({ ...form, horasAcademicas: Number(e.target.value) })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" min={1} required />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-700">Tiene evaluación</p>
              <p className="text-xs text-gray-400">Habilita el registro de notas por unidades</p>
            </div>
            <button type="button" onClick={() => setForm({ ...form, tieneEvaluacion: !form.tieneEvaluacion })}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.tieneEvaluacion ? 'bg-blue-600' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.tieneEvaluacion ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          {form.tieneEvaluacion && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nota mínima aprobatoria</label>
              <input type="number" value={form.notaMinimaAprobatoria} onChange={e => setForm({ ...form, notaMinimaAprobatoria: Number(e.target.value) })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" min={0} max={20} step={0.5} />
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50">
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Programa'}
            </button>
            <button type="button" onClick={() => setModalOpen(false)}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
