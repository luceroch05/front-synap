import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, BookOpen, Edit2, Trash2, Layers, ToggleLeft, ToggleRight, Minus,
  CheckCircle, Clock, FileText, Award, Hash, Eye, Briefcase, TrendingUp, Target
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { ProgramasService, Programa, CreateProgramaDto } from '@/lib/services/programas.service';
import { TiposProgramaService, TipoPrograma } from '@/lib/services/tipos-programa.service';

const emptyForm: CreateProgramaDto = {
  tipoProgramaId: 0,
  nombre: '',
  descripcion: '',
  horasAcademicas: 60,
  tieneEvaluacion: false,
  notaMinimaAprobatoria: 13,
};

// COMPONENTE TIPO SELECTOR
function TipoProgramaSelector({ tipos, value, onChange }: { 
  tipos: TipoPrograma[], 
  value: number, 
  onChange: (id: number) => void 
}) {
  const getIcon = (nombre: string) => {
    const name = nombre.toLowerCase();
    if (name.includes('tec')) return <Briefcase size={16} />;
    if (name.includes('dipl')) return <Award size={16} />;
    if (name.includes('espe')) return <Target size={16} />;
    if (name.includes('cert')) return <CheckCircle size={16} />;
    return <TrendingUp size={16} />;
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tipos.map(t => {
        const selected = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`flex flex-col items-center gap-2 rounded-xl p-3 border-2 transition-all duration-200 ${
              selected 
                ? 'border-[#F7941D] bg-orange-50 shadow-sm scale-[0.98]' 
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                selected ? 'bg-[#F7941D] text-white shadow-md' : 'bg-gray-100 text-gray-400'
              }`}
            >
              {getIcon(t.nombre)}
            </div>
            <span className={`text-xs font-medium ${selected ? 'text-[#F7941D]' : 'text-gray-600'}`}>
              {t.nombre}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// COMPONENTE SLIDER DE HORAS
function HorasSlider({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const percentage = ((value - 10) / 390) * 100;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Clock size={16} className="text-[#F7941D]" />
          Horas académicas *
        </label>
        <div className="flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-full">
          <Hash size={12} className="text-[#F7941D]" />
          <span className="text-base font-bold text-[#F7941D]">{value}</span>
          <span className="text-xs text-gray-500">horas</span>
        </div>
      </div>
      <input
        type="range"
        min={10}
        max={400}
        step={5}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          accentColor: '#F7941D',
          background: `linear-gradient(to right, #F7941D ${percentage}%, #FED7AA ${percentage}%)`,
        }}
      />
      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-gray-400">10h</span>
        <span className="text-[10px] text-gray-400">400h</span>
      </div>
    </div>
  );
}

// COMPONENTE STEPPER DE NOTA
function NotaStepper({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="mt-4 pt-4 border-t-2 border-orange-100">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Award size={16} className="text-[#F7941D]" />
          Nota mínima aprobatoria
        </p>
        <div className="flex items-center gap-3 bg-white rounded-full p-1 shadow-sm">
          <button
            type="button"
            onClick={() => onChange(Math.max(0, value - 0.5))}
            className="w-8 h-8 rounded-full bg-orange-50 hover:bg-orange-100 flex items-center justify-center text-[#F7941D] transition-all"
          >
            <Minus size={14} />
          </button>
          <span className="w-10 text-center text-lg font-bold text-gray-800 tabular-nums">
            {value}
          </span>
          <button
            type="button"
            onClick={() => onChange(Math.min(20, value + 0.5))}
            className="w-8 h-8 rounded-full bg-orange-50 hover:bg-orange-100 flex items-center justify-center text-[#F7941D] transition-all"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
      <div className="mt-3 h-2 rounded-full bg-orange-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#F7941D] transition-all duration-300"
          style={{ width: `${(value / 20) * 100}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-gray-300">0</span>
        <span className="text-[10px] text-gray-500">Nota</span>
        <span className="text-[10px] text-gray-300">20</span>
      </div>
    </div>
  );
}

// COMPONENTE TOGGLE EVALUACIÓN CORREGIDO - USA onChange
function EvaluacionToggle({ 
  tieneEvaluacion, 
  onChange,  // Cambiado a onChange
  notaMinima, 
  onNotaChange 
}: { 
  tieneEvaluacion: boolean; 
  onChange: (value: boolean) => void;  // Cambiado a onChange
  notaMinima: number;
  onNotaChange: (value: number) => void;
}) {
  return (
    <div
      className={`rounded-xl border-2 p-4 transition-all duration-200 ${
        tieneEvaluacion ? 'bg-orange-50 border-[#F7941D] shadow-sm' : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <FileText size={16} className="text-[#F7941D]" />
            Tiene evaluación
          </p>
          <p className="text-xs text-gray-400 mt-0.5 ml-7">Habilita el registro de notas por unidades</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(!tieneEvaluacion)}  // Cambiado a onChange
          className="relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 shadow-sm"
          style={{ backgroundColor: tieneEvaluacion ? '#F7941D' : '#D1D5DB' }}
        >
          <span
            className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200"
            style={{ transform: tieneEvaluacion ? 'translateX(24px)' : 'translateX(0)' }}
          />
        </button>
      </div>

      {tieneEvaluacion && (
        <NotaStepper value={notaMinima} onChange={onNotaChange} />
      )}
    </div>
  );
}

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
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    setErrors({});
    setModalOpen(true);
  };

  const abrirEditar = (p: Programa) => {
    setForm({
      tipoProgramaId: Number(p.tipoProgramaId),
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      horasAcademicas: Number(p.horasAcademicas),
      tieneEvaluacion: p.tieneEvaluacion,
      notaMinimaAprobatoria: Number(p.notaMinimaAprobatoria),
    });
    setEditingId(p.id);
    setErrors({});
    setModalOpen(true);
  };

const validateForm = () => {
  const newErrors: Record<string, string> = {};
  if (!form.tipoProgramaId || form.tipoProgramaId === 0) newErrors.tipoProgramaId = 'Selecciona un tipo de programa';
  if (!form.nombre?.trim()) newErrors.nombre = 'Ingresa el nombre del programa';
  if (form.horasAcademicas < 10) newErrors.horasAcademicas = 'Mínimo 10 horas';
  if (form.horasAcademicas > 400) newErrors.horasAcademicas = 'Máximo 400 horas';
  
  // CORREGIDO - Convertir a número
  const nota = Number(form.notaMinimaAprobatoria);
  if (form.tieneEvaluacion && (isNaN(nota) || nota < 0 || nota > 20)) {
    newErrors.notaMinimaAprobatoria = 'La nota debe estar entre 0 y 20';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
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

      {/* MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Programa' : 'Nuevo Programa'}
        size="lg"
      >
        <form onSubmit={guardar} className="space-y-5">
          
          {/* Selector visual de tipo */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Layers size={16} className="text-[#F7941D]" />
              Tipo de programa *
            </label>
            <TipoProgramaSelector 
              tipos={tipos} 
              value={form.tipoProgramaId} 
              onChange={(id) => setForm({ ...form, tipoProgramaId: id })}
            />
            {errors.tipoProgramaId && <p className="text-xs text-red-500 mt-1">{errors.tipoProgramaId}</p>}
          </div>

          {/* Nombre */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <BookOpen size={16} className="text-[#F7941D]" />
              Nombre del programa *
            </label>
            <input
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#F7941D]/20 focus:border-[#F7941D] ${
                errors.nombre ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="Ej: Excel avanzado para negocios"
              autoComplete="off"
            />
            {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <FileText size={16} className="text-[#F7941D]" />
              Descripción
            </label>
            <textarea
              value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#F7941D]/20 focus:border-[#F7941D] resize-none"
              rows={2}
              placeholder="Descripción breve del programa..."
            />
          </div>

          {/* Horas académicas */}
          <div>
            <HorasSlider 
              value={form.horasAcademicas} 
              onChange={(value) => setForm({ ...form, horasAcademicas: value })}
            />
            {errors.horasAcademicas && <p className="text-xs text-red-500 mt-1">{errors.horasAcademicas}</p>}
          </div>

          {/* Toggle evaluación */}
        {/* Toggle evaluación - CORREGIDO */}
          <EvaluacionToggle
            tieneEvaluacion={form.tieneEvaluacion ?? false}
            onChange={(value) => setForm({ ...form, tieneEvaluacion: value })}
            notaMinima={form.notaMinimaAprobatoria ?? 13}
            onNotaChange={(value) => setForm({ ...form, notaMinimaAprobatoria: value })}
          />

          {/* Vista previa */}
          {form.nombre && form.tipoProgramaId !== 0 && (
            <div className="mt-2 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
              <div className="flex items-center gap-2 text-xs font-medium text-orange-600 mb-2">
                <Eye size={12} />
                Vista previa
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-white rounded-lg shadow-sm text-xs flex items-center gap-1">
                  {tipos.find(t => t.id === form.tipoProgramaId)?.nombre || 'Tipo'}
                </span>
                <span className="px-2 py-1 bg-white rounded-lg shadow-sm text-xs flex items-center gap-1">
                  <BookOpen size={10} className="text-[#F7941D]" />
                  {form.nombre.length > 30 ? form.nombre.substring(0, 30) + '...' : form.nombre}
                </span>
                <span className="px-2 py-1 bg-white rounded-lg shadow-sm text-xs flex items-center gap-1">
                  <Clock size={10} className="text-[#F7941D]" />
                  {form.horasAcademicas} horas
                </span>
                {form.tieneEvaluacion && (
                  <span className="px-2 py-1 bg-white rounded-lg shadow-sm text-xs flex items-center gap-1">
                    <Award size={10} className="text-[#F7941D]" />
                    Nota ≥ {form.notaMinimaAprobatoria}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Botones */}
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
                <>{editingId ? 'Actualizar programa' : 'Crear programa'}</>
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