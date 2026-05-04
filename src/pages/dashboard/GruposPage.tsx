import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, Edit2, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { GruposProgramasService, GrupoProgramas, CreateGrupoProgramaDto, ModalidadGrupo } from '@/lib/services/grupos-programas.service';
import { ProgramasService, Programa } from '@/lib/services/programas.service';

const emptyForm: CreateGrupoProgramaDto = { programaId: 0, nombreGrupo: '', fechaInicio: '', fechaFin: '', modalidad: ModalidadGrupo.PRESENCIAL };
const modalBadge: Record<string, string> = {
  PRESENCIAL: 'bg-orange-50 text-orange-700',
  VIRTUAL: 'bg-purple-100 text-purple-700',
  MIXTA: 'bg-blue-100 text-blue-700',
};

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
    <div className="page-root">
      <div className="page-header">
        <div>
          <h1 className="page-title">Grupos de Programas</h1>
          <p className="page-subtitle">{grupos.length} grupos registrados</p>
        </div>
        <button onClick={abrirCrear} className="btn-primary">
          <Plus size={16} /> Nuevo Grupo
        </button>
      </div>

      <div className="page-body">
        {error && (
          <div className="error-bar">
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-bold text-lg leading-none">×</button>
          </div>
        )}

        <div className="flex gap-3">
          <div className="search-wrap flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="search-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar grupo o programa..."
            />
          </div>
          <select
            value={filtroPrograma}
            onChange={e => setFiltroPrograma(Number(e.target.value))}
            className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none transition-all"
            style={{ borderColor: undefined }}
          >
            <option value={0}>Todos los programas</option>
            {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>

        <div className="table-card">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="spinner" />
              <p className="text-sm text-gray-400">Cargando...</p>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Users size={40} className="text-gray-200" />
              <p className="text-sm text-gray-400">No hay registros</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ borderBottom: '1px solid #F0F2F5' }}>
                  <tr style={{ backgroundColor: '#FAFAFA' }}>
                    {['Programa', 'Grupo', 'Modalidad', 'Inicio', 'Fin', 'Estado', ''].map(h => (
                      <th key={h} className="table-header">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map(g => (
                    <tr key={g.id} className="table-row">
                      <td className="table-cell text-sm text-gray-600 max-w-[150px] truncate">{g.programa?.nombre || '—'}</td>
                      <td className="table-cell font-medium text-gray-900">{g.nombreGrupo}</td>
                      <td className="table-cell">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${modalBadge[g.modalidad] || 'bg-gray-100 text-gray-700'}`}>{g.modalidad}</span>
                      </td>
                      <td className="table-cell text-sm text-gray-600 whitespace-nowrap">{fmtDate(g.fechaInicio)}</td>
                      <td className="table-cell text-sm text-gray-600 whitespace-nowrap">{fmtDate(g.fechaFin)}</td>
                      <td className="table-cell">
                        <span className={g.activo ? 'badge-green' : 'badge-gray'}>
                          {g.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => navigate(`/dashboard/grupos/${g.id}`)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#F7941D] hover:bg-orange-50 transition-colors" title="Ver detalle">
                            <Eye size={15} />
                          </button>
                          <button onClick={() => toggleActivo(g.id)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                            {g.activo
                              ? <ToggleRight size={18} className="text-emerald-500" />
                              : <ToggleLeft size={18} className="text-gray-300" />
                            }
                          </button>
                          <button onClick={() => abrirEditar(g)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#F7941D] hover:bg-orange-50 transition-colors">
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => eliminar(g.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Grupo' : 'Nuevo Grupo'}>
        <form onSubmit={guardar} className="space-y-4">
          <div>
            <label className="form-label">Programa *</label>
            <select value={form.programaId} onChange={e => setForm({ ...form, programaId: Number(e.target.value) })}
              className="form-input" required>
              <option value={0} disabled>Seleccionar programa...</option>
              {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Nombre del Grupo *</label>
            <input value={form.nombreGrupo} onChange={e => setForm({ ...form, nombreGrupo: e.target.value })}
              className="form-input" placeholder="Ej: Grupo A - Turno Noche" required />
          </div>
          <div>
            <label className="form-label">Modalidad *</label>
            <select value={form.modalidad} onChange={e => setForm({ ...form, modalidad: e.target.value as ModalidadGrupo })}
              className="form-input">
              <option value="PRESENCIAL">Presencial</option>
              <option value="VIRTUAL">Virtual</option>
              <option value="MIXTA">Mixta</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Fecha Inicio *</label>
              <input type="date" value={form.fechaInicio} onChange={e => setForm({ ...form, fechaInicio: e.target.value })}
                className="form-input" required />
            </div>
            <div>
              <label className="form-label">Fecha Fin *</label>
              <input type="date" value={form.fechaFin} onChange={e => setForm({ ...form, fechaFin: e.target.value })}
                className="form-input" required />
            </div>
          </div>
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
