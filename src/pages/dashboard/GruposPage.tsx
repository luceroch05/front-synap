import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Users, Edit2, Trash2, Eye, ToggleLeft, ToggleRight, 
  CheckCircle, Calendar, Clock, Briefcase, Laptop, RefreshCw, X 
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { GruposProgramasService, GrupoProgramas, CreateGrupoProgramaDto, ModalidadGrupo } from '@/lib/services/grupos-programas.service';
import { ProgramasService, Programa } from '@/lib/services/programas.service';

const emptyForm: CreateGrupoProgramaDto = { programaId: 0, nombreGrupo: '', fechaInicio: '', fechaFin: '', modalidad: ModalidadGrupo.PRESENCIAL };
const modalBadge: Record<string, string> = {
  PRESENCIAL: 'bg-orange-50 text-orange-700',
  VIRTUAL: 'bg-purple-100 text-purple-700',
  MIXTA: 'bg-blue-100 text-blue-700',
};

// COMPONENTE COMBOBOX
function ProgramaCombobox({ options, value, onChange, placeholder = "Buscar programa..." }: { 
  options: any[], 
  value: number, 
  onChange: (id: number) => void, 
  placeholder?: string 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedProgram = options.find(o => o.id === value);

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter(opt => 
      opt.nombre.toLowerCase().includes(term) || 
      opt.codigo?.toLowerCase().includes(term)
    );
  }, [options, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (program: any) => {
    onChange(program.id);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className={`relative flex items-center border rounded-xl transition-all ${
        isOpen ? 'border-[#F7941D] ring-2 ring-[#F7941D]/20' : 'border-gray-200'
      }`}>
        <Search className="absolute left-3 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={isOpen ? searchTerm : (selectedProgram?.nombre || '')}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setSearchTerm('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setHighlightedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setHighlightedIndex(prev => Math.max(prev - 1, -1));
            } else if (e.key === 'Enter' && highlightedIndex >= 0) {
              e.preventDefault();
              handleSelect(filteredOptions[highlightedIndex]);
            } else if (e.key === 'Escape') {
              setIsOpen(false);
              setSearchTerm('');
            }
          }}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2.5 bg-transparent rounded-xl text-sm outline-none"
        />
        {selectedProgram && !isOpen && (
          <div className="absolute right-3 px-1.5 py-0.5 bg-green-50 rounded text-[10px] font-medium text-green-600">
            ✓
          </div>
        )}
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
          {filteredOptions.map((opt, idx) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                idx === highlightedIndex ? 'bg-orange-50 text-[#F7941D]' : 'hover:bg-gray-50'
              } ${value === opt.id ? 'bg-orange-50/50 font-medium text-[#F7941D]' : 'text-gray-700'}`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{opt.nombre}</span>
                {value === opt.id && <CheckCircle className="w-3.5 h-3.5 text-[#F7941D]" />}
              </div>
              {opt.codigo && <span className="text-xs text-gray-400">{opt.codigo}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    setEditingId(null); 
    setErrors({});
    setModalOpen(true); 
  };

  const abrirEditar = (g: GrupoProgramas) => {
    setForm({ 
      programaId: g.programaId, 
      nombreGrupo: g.nombreGrupo, 
      fechaInicio: g.fechaInicio?.split('T')[0] || '', 
      fechaFin: g.fechaFin?.split('T')[0] || '', 
      modalidad: g.modalidad 
    });
    setEditingId(g.id); 
    setErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.programaId || form.programaId === 0) newErrors.programaId = 'Selecciona un programa';
    if (!form.nombreGrupo?.trim()) newErrors.nombreGrupo = 'Ingresa el nombre del grupo';
    if (!form.fechaInicio) newErrors.fechaInicio = 'Selecciona fecha de inicio';
    if (!form.fechaFin) newErrors.fechaFin = 'Selecciona fecha de fin';
    if (form.fechaInicio && form.fechaFin && form.fechaInicio > form.fechaFin) {
      newErrors.fechaFin = 'La fecha fin debe ser posterior a la de inicio';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      editingId ? await GruposProgramasService.update(editingId, form) : await GruposProgramasService.create(form);
      setModalOpen(false); 
      await cargar();
    } catch (e: any) { 
      setError(e.message); 
    } finally { 
      setSaving(false); 
    }
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

  const modalidades = [
    { value: 'PRESENCIAL', label: 'Presencial', icon: Briefcase, color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { value: 'VIRTUAL', label: 'Virtual', icon: Laptop, color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { value: 'MIXTA', label: 'Mixta', icon: RefreshCw, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  ];

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

      {/* MODAL MEJORADO - SIN EMOJIS */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Grupo' : 'Nuevo Grupo'} size="lg">
        <form onSubmit={guardar} className="space-y-5">
          {/* Programa con combobox */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <Users size={16} className="text-[#F7941D]" />
              Programa *
            </label>
            <ProgramaCombobox
              options={programas.map(p => ({ id: p.id, nombre: p.nombre, codigo: (p as any).codigo }))}
              value={form.programaId}
              onChange={(id) => setForm({ ...form, programaId: id })}
              placeholder="Buscar programa por nombre o código..."
            />
            {errors.programaId && <p className="text-xs text-red-500 mt-1">{errors.programaId}</p>}
          </div>

          {/* Nombre del Grupo */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <Clock size={16} className="text-[#F7941D]" />
              Nombre del Grupo *
            </label>
            <input
              value={form.nombreGrupo}
              onChange={e => setForm({ ...form, nombreGrupo: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#F7941D]/20 focus:border-[#F7941D] ${
                errors.nombreGrupo ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="Ej: Grupo A - Turno Noche, Comisión 1, etc."
              autoComplete="off"
            />
            {errors.nombreGrupo && <p className="text-xs text-red-500 mt-1">{errors.nombreGrupo}</p>}
          </div>

          {/* Modalidad - Cards con iconos de Lucide */}
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

          {/* Fechas */}
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

          {/* Preview sin emojis */}
          {form.programaId && form.nombreGrupo && form.modalidad && form.fechaInicio && form.fechaFin && (
            <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
              <div className="flex items-center gap-2 text-xs font-medium text-orange-600 mb-2">
                <CheckCircle size={12} />
                Vista previa
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 bg-white rounded-lg shadow-sm flex items-center gap-1">
                  <Users size={10} />
                  {programas.find(p => p.id === form.programaId)?.nombre?.split(' ').slice(0, 2).join(' ') || 'Programa'}
                </span>
                <span className="px-2 py-1 bg-white rounded-lg shadow-sm flex items-center gap-1">
                  <Clock size={10} />
                  {form.nombreGrupo}
                </span>
                <span className="px-2 py-1 bg-white rounded-lg shadow-sm flex items-center gap-1">
                  {form.modalidad === 'PRESENCIAL' && <Briefcase size={10} />}
                  {form.modalidad === 'VIRTUAL' && <Laptop size={10} />}
                  {form.modalidad === 'MIXTA' && <RefreshCw size={10} />}
                  {form.modalidad.toLowerCase()}
                </span>
                <span className="px-2 py-1 bg-white rounded-lg shadow-sm flex items-center gap-1">
                  <Calendar size={10} />
                  {new Date(form.fechaInicio).toLocaleDateString()} → {new Date(form.fechaFin).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4">
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
                <>{editingId ? 'Actualizar Grupo' : 'Crear Grupo'}</>
              )}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}