import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Users, Edit2, Trash2, Eye, ToggleLeft, ToggleRight,
  CheckCircle, Calendar, Briefcase, Laptop, RefreshCw
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Combobox from '@/components/ui/Combobox';
import { GruposProgramasService, GrupoProgramas, CreateGrupoProgramaDto, ModalidadGrupo } from '@/lib/services/grupos-programas.service';
import { ProgramasService, Programa } from '@/lib/services/programas.service';

const emptyForm: CreateGrupoProgramaDto = { programaId: 0, nombreGrupo: '', fechaInicio: '', fechaFin: '', modalidad: ModalidadGrupo.PRESENCIAL };
const modalBadge: Record<string, string> = {
  PRESENCIAL: 'bg-orange-50 text-orange-700',
  VIRTUAL:    'bg-purple-100 text-purple-700',
  MIXTA:      'bg-blue-100 text-blue-700',
};

export default function GruposPage() {
  const navigate = useNavigate();
  const [grupos, setGrupos]     = useState<GrupoProgramas[]>([]);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filtroPrograma, setFiltroPrograma] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm]         = useState<CreateGrupoProgramaDto>(emptyForm);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [errors, setErrors]     = useState<Record<string, string>>({});

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const [g, p] = await Promise.all([GruposProgramasService.findAll(), ProgramasService.findAll()]);
      setGrupos(g); setProgramas(p);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const abrirCrear = () => {
    setForm({ ...emptyForm, programaId: programas[0]?.id || 0 });
    setEditingId(null); setErrors({}); setModalOpen(true);
  };

  const abrirEditar = (g: GrupoProgramas) => {
    setForm({
      programaId: g.programaId,
      nombreGrupo: g.nombreGrupo,
      fechaInicio: g.fechaInicio?.split('T')[0] || '',
      fechaFin: g.fechaFin?.split('T')[0] || '',
      modalidad: g.modalidad,
    });
    setEditingId(g.id); setErrors({}); setModalOpen(true);
  };

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!form.programaId) e.programaId = 'Selecciona un programa';
    if (!form.nombreGrupo?.trim()) e.nombreGrupo = 'Ingresa el nombre del grupo';
    if (!form.fechaInicio) e.fechaInicio = 'Selecciona fecha de inicio';
    if (!form.fechaFin) e.fechaFin = 'Selecciona fecha de fin';
    if (form.fechaInicio && form.fechaFin && form.fechaInicio > form.fechaFin)
      e.fechaFin = 'La fecha fin debe ser posterior a la de inicio';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
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

  const fmtDate = (d: string) => {
    if (!d) return '—';
    const [y, m, day] = d.split('T')[0].split('-').map(Number);
    return new Date(y, m - 1, day).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const modalidades = [
    { value: 'PRESENCIAL', label: 'Presencial', icon: Briefcase, color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { value: 'VIRTUAL',    label: 'Virtual',    icon: Laptop,    color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { value: 'MIXTA',      label: 'Mixta',      icon: RefreshCw, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  ];

  const programaOpts = programas.map(p => ({
    id: p.id,
    label: p.nombre,
    sublabel: (p as any).codigo,
  }));

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
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${modalBadge[g.modalidad] || 'bg-gray-100 text-gray-700'}`}>
                          {g.modalidad}
                        </span>
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
                              : <ToggleLeft size={18} className="text-gray-300" />}
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Grupo' : 'Nuevo Grupo'} size="lg">
        <form onSubmit={guardar} className="space-y-5">

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <Users size={16} className="text-[#F7941D]" />
              Programa *
            </label>
            <Combobox
              options={programaOpts}
              value={form.programaId}
              onChange={id => setForm({ ...form, programaId: id })}
              placeholder="Buscar programa por nombre o código..."
            />
            {errors.programaId && <p className="text-xs text-red-500 mt-1">{errors.programaId}</p>}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <Users size={16} className="text-[#F7941D]" />
              Nombre del Grupo *
            </label>
            <input
              value={form.nombreGrupo}
              onChange={e => setForm({ ...form, nombreGrupo: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#F7941D]/20 focus:border-[#F7941D] ${
                errors.nombreGrupo ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="Ej: Grupo A - Turno Noche"
              autoComplete="off"
            />
            {errors.nombreGrupo && <p className="text-xs text-red-500 mt-1">{errors.nombreGrupo}</p>}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Briefcase size={16} className="text-[#F7941D]" />
              Modalidad *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {modalidades.map(mod => {
                const Icon = mod.icon;
                return (
                  <button
                    key={mod.value}
                    type="button"
                    onClick={() => setForm({ ...form, modalidad: mod.value as ModalidadGrupo })}
                    className={`py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      form.modalidad === mod.value
                        ? `${mod.color} border-current shadow-sm scale-[0.98]`
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={16} />
                    {mod.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                <Calendar size={14} className="text-[#F7941D]" />
                Fecha Inicio *
              </label>
              <input
                type="date"
                value={form.fechaInicio}
                onChange={e => setForm({ ...form, fechaInicio: e.target.value })}
                className={`w-full px-3 py-2.5 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#F7941D]/20 focus:border-[#F7941D] ${
                  errors.fechaInicio ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.fechaInicio && <p className="text-xs text-red-500 mt-1">{errors.fechaInicio}</p>}
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                <Calendar size={14} className="text-[#F7941D]" />
                Fecha Fin *
              </label>
              <input
                type="date"
                value={form.fechaFin}
                onChange={e => setForm({ ...form, fechaFin: e.target.value })}
                className={`w-full px-3 py-2.5 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#F7941D]/20 focus:border-[#F7941D] ${
                  errors.fechaFin ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.fechaFin && <p className="text-xs text-red-500 mt-1">{errors.fechaFin}</p>}
            </div>
          </div>

          {form.programaId && form.nombreGrupo && form.modalidad && form.fechaInicio && form.fechaFin && (
            <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
              <div className="flex items-center gap-2 text-xs font-medium text-orange-600 mb-2">
                <CheckCircle size={12} />
                Vista previa
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 bg-white rounded-lg shadow-sm flex items-center gap-1">
                  <Users size={10} />
                  {programas.find(p => p.id === form.programaId)?.nombre?.split(' ').slice(0, 3).join(' ') || 'Programa'}
                </span>
                <span className="px-2 py-1 bg-white rounded-lg shadow-sm">{form.nombreGrupo}</span>
                <span className="px-2 py-1 bg-white rounded-lg shadow-sm">{form.modalidad.toLowerCase()}</span>
                <span className="px-2 py-1 bg-white rounded-lg shadow-sm flex items-center gap-1">
                  <Calendar size={10} />
                  {new Date(form.fechaInicio).toLocaleDateString()} → {new Date(form.fechaFin).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#F7941D] hover:bg-[#E8850C] text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                editingId ? 'Actualizar Grupo' : 'Crear Grupo'
              )}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
