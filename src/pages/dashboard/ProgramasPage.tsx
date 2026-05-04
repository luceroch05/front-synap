import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="page-root">
      <div className="page-header">
        <div>
          <h1 className="page-title">Programas</h1>
          <p className="page-subtitle">{programas.length} programas registrados</p>
        </div>
        <button onClick={abrirCrear} className="btn-primary">
          <Plus size={16} /> Nuevo Programa
        </button>
      </div>

      <div className="page-body">
        {error && (
          <div className="error-bar">
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-bold text-lg leading-none">×</button>
          </div>
        )}

        <div className="search-wrap">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o tipo..."
          />
        </div>

        <div className="table-card">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="spinner" />
              <p className="text-sm text-gray-400">Cargando...</p>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <BookOpen size={40} className="text-gray-200" />
              <p className="text-sm text-gray-400">No hay programas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ borderBottom: '1px solid #F0F2F5' }}>
                  <tr style={{ backgroundColor: '#FAFAFA' }}>
                    {['Tipo', 'Nombre', 'Descripción', 'Horas', 'Evaluación', 'Estado', ''].map(h => (
                      <th key={h} className="table-header">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map(p => (
                    <tr key={p.id} className="table-row">
                      <td className="table-cell">
                        <span className="badge-orange">{p.tipoPrograma?.nombre || '—'}</span>
                      </td>
                      <td className="table-cell font-medium text-gray-900">{p.nombre}</td>
                      <td className="table-cell text-gray-500 text-sm max-w-xs truncate">{p.descripcion || '—'}</td>
                      <td className="table-cell text-gray-700 whitespace-nowrap">{p.horasAcademicas}h</td>
                      <td className="table-cell">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${p.tieneEvaluacion ? 'bg-orange-50 text-orange-700' : 'bg-gray-100 text-gray-400'}`}>
                          {p.tieneEvaluacion ? `Sí (≥${p.notaMinimaAprobatoria})` : 'No'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={p.activo ? 'badge-green' : 'badge-gray'}>
                          {p.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/dashboard/programas/${p.id}/unidades`)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[#F7941D] hover:bg-orange-50 transition-colors"
                            title="Gestionar Unidades"
                          >
                            <Layers size={15} />
                          </button>
                          <button onClick={() => toggleActivo(p.id)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                            {p.activo
                              ? <ToggleRight size={18} className="text-emerald-500" />
                              : <ToggleLeft size={18} className="text-gray-300" />
                            }
                          </button>
                          <button onClick={() => abrirEditar(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#F7941D] hover:bg-orange-50 transition-colors">
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => eliminar(p.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Programa' : 'Nuevo Programa'}>
        <form onSubmit={guardar} className="space-y-4">
          <div>
            <label className="form-label">Tipo de Programa *</label>
            <select value={form.tipoProgramaId} onChange={e => setForm({ ...form, tipoProgramaId: Number(e.target.value) })}
              className="form-input" required>
              <option value={0} disabled>Seleccionar tipo...</option>
              {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Nombre *</label>
            <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
              className="form-input" placeholder="Nombre del programa" required />
          </div>
          <div>
            <label className="form-label">Descripción</label>
            <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
              className="form-input resize-none"
              rows={3} placeholder="Descripción del programa..." />
          </div>
          <div>
            <label className="form-label">Horas Académicas *</label>
            <input type="number" value={form.horasAcademicas} onChange={e => setForm({ ...form, horasAcademicas: Number(e.target.value) })}
              className="form-input" min={1} required />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-700">Tiene evaluación</p>
              <p className="text-xs text-gray-400">Habilita el registro de notas por unidades</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, tieneEvaluacion: !form.tieneEvaluacion })}
              className="relative w-10 h-6 rounded-full transition-colors duration-200"
              style={{ backgroundColor: form.tieneEvaluacion ? '#F7941D' : '#E5E7EB' }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                style={{ transform: form.tieneEvaluacion ? 'translateX(16px)' : 'translateX(0)' }}
              />
            </button>
          </div>
          {form.tieneEvaluacion && (
            <div>
              <label className="form-label">Nota mínima aprobatoria</label>
              <input type="number" value={form.notaMinimaAprobatoria} onChange={e => setForm({ ...form, notaMinimaAprobatoria: Number(e.target.value) })}
                className="form-input" min={0} max={20} step={0.5} />
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="modal-btn-primary">
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="modal-btn-cancel">Cancelar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
