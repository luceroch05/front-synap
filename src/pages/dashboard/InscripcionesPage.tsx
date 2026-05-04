import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, FileText, Trash2, ClipboardList, Users, Calendar, 
  Eye, CheckCircle, X, User, BookOpen, Layers, Clock, Award
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { InscripcionesService, Inscripcion, CreateInscripcionDto } from '@/lib/services/inscripciones.service';
import { ParticipantesService, Participante } from '@/lib/services/participantes.service';
import { GruposProgramasService, GrupoProgramas } from '@/lib/services/grupos-programas.service';
import { EstadosInscripcionService, EstadoInscripcion } from '@/lib/services/estados-inscripcion.service';

const emptyForm: CreateInscripcionDto = {
  participanteId: 0,
  grupoId: 0,
  estadoId: 0,
  fechaInscripcion: new Date().toISOString().split('T')[0],
};

const estadoColors: Record<string, string> = {
  Inscrito: 'bg-blue-50 text-blue-700',
  Aprobado: 'bg-green-50 text-green-700',
  Retirado: 'bg-red-50 text-red-700',
  Egresado: 'bg-purple-50 text-purple-700',
};

// COMPONENTE COMBOBOX PARA PARTICIPANTES
function ParticipanteCombobox({ options, value, onChange, placeholder = "Buscar participante..." }: { 
  options: Participante[]; 
  value: number; 
  onChange: (id: number) => void; 
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedParticipante = options.find(o => o.id === value);

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter(opt => 
      opt.nombres.toLowerCase().includes(term) || 
      opt.apellidos.toLowerCase().includes(term) ||
      opt.numeroDocumento.includes(term)
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

  const handleSelect = (participante: Participante) => {
    onChange(participante.id);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className={`relative flex items-center border rounded-xl transition-all ${
        isOpen ? 'border-[#F7941D] ring-2 ring-[#F7941D]/20' : 'border-gray-200'
      }`}>
        <Users className="absolute left-3 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={isOpen ? searchTerm : (selectedParticipante ? `${selectedParticipante.nombres} ${selectedParticipante.apellidos}` : '')}
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
        {selectedParticipante && !isOpen && (
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
                <div>
                  <span className="font-medium">{opt.nombres} {opt.apellidos}</span>
                  <div className="text-xs text-gray-400">{opt.tipoDocumento}: {opt.numeroDocumento}</div>
                </div>
                {value === opt.id && <CheckCircle className="w-3.5 h-3.5 text-[#F7941D]" />}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// COMPONENTE COMBOBOX PARA GRUPOS
function GrupoCombobox({ options, value, onChange, placeholder = "Buscar grupo..." }: { 
  options: GrupoProgramas[]; 
  value: number; 
  onChange: (id: number) => void; 
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedGrupo = options.find(o => o.id === value);

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter(opt => 
      opt.nombreGrupo.toLowerCase().includes(term) || 
      opt.programa?.nombre.toLowerCase().includes(term)
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

  const handleSelect = (grupo: GrupoProgramas) => {
    onChange(grupo.id);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className={`relative flex items-center border rounded-xl transition-all ${
        isOpen ? 'border-[#F7941D] ring-2 ring-[#F7941D]/20' : 'border-gray-200'
      }`}>
        <Layers className="absolute left-3 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={isOpen ? searchTerm : (selectedGrupo ? `${selectedGrupo.programa?.nombre} - ${selectedGrupo.nombreGrupo}` : '')}
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
        {selectedGrupo && !isOpen && (
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
                <div>
                  <span className="font-medium">{opt.programa?.nombre}</span>
                  <div className="text-xs text-gray-400">{opt.nombreGrupo} - {opt.modalidad}</div>
                </div>
                {value === opt.id && <CheckCircle className="w-3.5 h-3.5 text-[#F7941D]" />}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function InscripcionesPage() {
  const navigate = useNavigate();
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [grupos, setGrupos] = useState<GrupoProgramas[]>([]);
  const [estados, setEstados] = useState<EstadoInscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEstado, setModalEstado] = useState<Inscripcion | null>(null);
  const [nuevoEstadoId, setNuevoEstadoId] = useState(0);
  const [form, setForm] = useState<CreateInscripcionDto>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const [insc, part, grup, est] = await Promise.all([
        InscripcionesService.findAll(),
        ParticipantesService.findAll(),
        GruposProgramasService.findAll(),
        EstadosInscripcionService.findAll(),
      ]);
      setInscripciones(insc);
      setParticipantes(part);
      setGrupos(grup);
      setEstados(est);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const abrirCrear = () => {
    setForm({ 
      ...emptyForm, 
      participanteId: participantes[0]?.id || 0, 
      grupoId: grupos[0]?.id || 0, 
      estadoId: estados[0]?.id || 0 
    });
    setErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.participanteId || form.participanteId === 0) newErrors.participanteId = 'Selecciona un participante';
    if (!form.grupoId || form.grupoId === 0) newErrors.grupoId = 'Selecciona un grupo';
    if (!form.estadoId || form.estadoId === 0) newErrors.estadoId = 'Selecciona un estado';
    if (!form.fechaInscripcion) newErrors.fechaInscripcion = 'Selecciona la fecha de inscripción';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      await InscripcionesService.create(form);
      setModalOpen(false); 
      await cargar();
    } catch (e: any) { 
      setError(e.message); 
    } finally { 
      setSaving(false); 
    }
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar esta inscripción?')) return;
    try { await InscripcionesService.remove(id); await cargar(); } 
    catch (e: any) { setError(e.message); }
  };

  const cambiarEstado = async () => {
    if (!modalEstado || !nuevoEstadoId) return;
    setSaving(true);
    try {
      await InscripcionesService.changeEstado(modalEstado.id, nuevoEstadoId);
      setModalEstado(null); 
      await cargar();
    } catch (e: any) { 
      setError(e.message); 
    } finally { 
      setSaving(false); 
    }
  };

  const filtrados = inscripciones.filter(i => {
    const p = i.participante;
    const q = search.toLowerCase();
    const matchSearch = p ? (p.nombres + ' ' + p.apellidos + ' ' + p.numeroDocumento).toLowerCase().includes(q) : true;
    const matchEstado = filtroEstado === 0 || i.estadoId === filtroEstado;
    return matchSearch && matchEstado;
  });

  const fmtDate = (d: string) => { 
    if (!d) return '—'; 
    const [y, m, day] = d.split('T')[0].split('-').map(Number); 
    return new Date(y, m - 1, day).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }); 
  };

  const getEstadoColor = (estadoNombre: string) => {
    return estadoColors[estadoNombre] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inscripciones</h1>
          <p className="page-subtitle">{inscripciones.length} inscripciones registradas</p>
        </div>
        <button onClick={abrirCrear} className="btn-primary">
          <Plus size={16} /> Nueva Inscripción
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
              placeholder="Buscar por participante o documento..."
            />
          </div>
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(Number(e.target.value))}
            className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none"
          >
            <option value={0}>Todos los estados</option>
            {estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
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
              <FileText size={40} className="text-gray-200" />
              <p className="text-sm text-gray-400">No hay registros</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ borderBottom: '1px solid #F0F2F5' }}>
                  <tr style={{ backgroundColor: '#FAFAFA' }}>
                    {['Participante', 'Programa / Grupo', 'Modalidad', 'Estado', 'Fecha', ''].map(h => (
                      <th key={h} className="table-header">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map(i => {
                    const est = i.estado?.nombre || '';
                    return (
                      <tr key={i.id} className="table-row">
                        <td className="table-cell">
                          <div className="font-medium text-gray-900">{i.participante ? `${i.participante.nombres} ${i.participante.apellidos}` : '—'}</div>
                          <div className="text-xs text-gray-400">{i.participante?.tipoDocumento}: {i.participante?.numeroDocumento}</div>
                        </td>
                        <td className="table-cell">
                          <div className="font-medium text-gray-800 text-sm">{i.grupo?.programa?.nombre || '—'}</div>
                          <div className="text-xs text-gray-500">{i.grupo?.nombreGrupo}</div>
                        </td>
                        <td className="table-cell">
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${i.grupo?.modalidad === 'PRESENCIAL' ? 'bg-orange-50 text-orange-700' : i.grupo?.modalidad === 'VIRTUAL' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                            {i.grupo?.modalidad || '—'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getEstadoColor(est)}`}>
                            {est || '—'}
                          </span>
                        </td>
                        <td className="table-cell text-sm text-gray-600 whitespace-nowrap">{fmtDate(i.fechaInscripcion)}</td>
                        <td className="table-cell">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => { setModalEstado(i); setNuevoEstadoId(i.estadoId); }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-[#F7941D] hover:bg-orange-50 transition-colors"
                              title="Cambiar estado"
                            >
                              <ClipboardList size={15} />
                            </button>
                            {i.grupo?.id && (
                              <button
                                onClick={() => navigate(`/dashboard/grupos/${i.grupo!.id}/notas`)}
                                className="px-2.5 py-1 text-xs text-gray-500 hover:text-[#F7941D] hover:bg-orange-50 rounded-lg font-medium transition-colors"
                                title="Ver notas"
                              >
                                Notas
                              </button>
                            )}
                            <button onClick={() => eliminar(i.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL NUEVA INSCRIPCIÓN MEJORADO */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nueva Inscripción"
        size="lg"
      >
        <form onSubmit={guardar} className="space-y-5">
          
          {/* Participante con combobox */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <Users size={16} className="text-[#F7941D]" />
              Participante *
            </label>
            <ParticipanteCombobox
              options={participantes}
              value={form.participanteId}
              onChange={(id) => setForm({ ...form, participanteId: id })}
              placeholder="Buscar participante por nombre o documento..."
            />
            {errors.participanteId && <p className="text-xs text-red-500 mt-1">{errors.participanteId}</p>}
          </div>

          {/* Grupo con combobox */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <Layers size={16} className="text-[#F7941D]" />
              Grupo *
            </label>
            <GrupoCombobox
              options={grupos}
              value={form.grupoId}
              onChange={(id) => setForm({ ...form, grupoId: id })}
              placeholder="Buscar grupo por programa o nombre..."
            />
            {errors.grupoId && <p className="text-xs text-red-500 mt-1">{errors.grupoId}</p>}
          </div>

          {/* Estado - Cards seleccionables */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <ClipboardList size={16} className="text-[#F7941D]" />
              Estado *
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {estados.map(est => {
                const selected = form.estadoId === est.id;
                return (
                  <button
                    key={est.id}
                    type="button"
                    onClick={() => setForm({ ...form, estadoId: est.id })}
                    className={`py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      selected 
                        ? 'border-[#F7941D] bg-orange-50 shadow-sm scale-[0.98] text-[#F7941D]' 
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {selected && <CheckCircle size={14} />}
                    {est.nombre}
                  </button>
                );
              })}
            </div>
            {errors.estadoId && <p className="text-xs text-red-500 mt-1">{errors.estadoId}</p>}
          </div>

          {/* Fecha de Inscripción */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <Calendar size={16} className="text-[#F7941D]" />
              Fecha de Inscripción *
            </label>
            <input
              type="date"
              value={form.fechaInscripcion}
              onChange={e => setForm({ ...form, fechaInscripcion: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#F7941D]/20 focus:border-[#F7941D] ${
                errors.fechaInscripcion ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.fechaInscripcion && <p className="text-xs text-red-500 mt-1">{errors.fechaInscripcion}</p>}
          </div>

          {/* Vista previa dinámica */}
          {form.participanteId !== 0 && form.grupoId !== 0 && form.estadoId !== 0 && (
            <div className="mt-2 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
              <div className="flex items-center gap-2 text-xs font-medium text-orange-600 mb-2">
                <Eye size={12} />
                Vista previa
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-white rounded-lg shadow-sm text-xs flex items-center gap-1">
                  <User size={10} className="text-[#F7941D]" />
                  {participantes.find(p => p.id === form.participanteId)?.nombres} {participantes.find(p => p.id === form.participanteId)?.apellidos}
                </span>
                <span className="px-2 py-1 bg-white rounded-lg shadow-sm text-xs flex items-center gap-1">
                  <BookOpen size={10} className="text-[#F7941D]" />
                  {grupos.find(g => g.id === form.grupoId)?.programa?.nombre}
                </span>
                <span className="px-2 py-1 bg-white rounded-lg shadow-sm text-xs flex items-center gap-1">
                  <Award size={10} className="text-[#F7941D]" />
                  {estados.find(e => e.id === form.estadoId)?.nombre}
                </span>
                <span className="px-2 py-1 bg-white rounded-lg shadow-sm text-xs flex items-center gap-1">
                  <Calendar size={10} className="text-[#F7941D]" />
                  {fmtDate(form.fechaInscripcion)}
                </span>
              </div>
            </div>
          )}

          {/* Botones de acción */}
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
                'Crear inscripción'
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

      {/* MODAL CAMBIAR ESTADO MEJORADO */}
      <Modal
        isOpen={!!modalEstado}
        onClose={() => setModalEstado(null)}
        title="Cambiar Estado de Inscripción"
        size="sm"
      >
        <div className="space-y-4">
          {modalEstado?.participante && (
            <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
              <p className="text-xs text-orange-600 mb-1">Participante</p>
              <p className="text-sm font-semibold text-gray-800">
                {modalEstado.participante.nombres} {modalEstado.participante.apellidos}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {modalEstado.participante.tipoDocumento}: {modalEstado.participante.numeroDocumento}
              </p>
            </div>
          )}
          
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <ClipboardList size={16} className="text-[#F7941D]" />
              Nuevo Estado
            </label>
            <div className="grid grid-cols-2 gap-2">
              {estados.map(est => {
                const selected = nuevoEstadoId === est.id;
                return (
                  <button
                    key={est.id}
                    type="button"
                    onClick={() => setNuevoEstadoId(est.id)}
                    className={`py-2 px-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      selected 
                        ? 'border-[#F7941D] bg-orange-50 shadow-sm text-[#F7941D]' 
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {selected && <CheckCircle size={14} />}
                    {est.nombre}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              onClick={cambiarEstado}
              disabled={saving}
              className="flex-1 bg-[#F7941D] hover:bg-[#E8850C] text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Actualizar estado'
              )}
            </button>
            <button
              onClick={() => setModalEstado(null)}
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}