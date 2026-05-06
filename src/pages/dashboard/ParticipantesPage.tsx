import { useState, useEffect } from 'react';
import { 
  Plus, Search, UserCheck, Edit2, Trash2, ToggleLeft, ToggleRight, 
  Mail, Phone, CreditCard, User, Eye, Shield, FileText
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { ParticipantesService, Participante, CreateParticipanteDto } from '@/lib/services/participantes.service';

const emptyForm: CreateParticipanteDto = { 
  tipoDocumento: 'DNI', 
  numeroDocumento: '', 
  nombres: '', 
  apellidos: '', 
  email: '', 
  telefono: '' 
};

const TIPOS_DOC = [
  { value: 'DNI', label: 'DNI', icon: CreditCard },
  { value: 'Carné de Extranjería', label: 'Carné de Extranjería', icon: Shield },
  { value: 'Pasaporte', label: 'Pasaporte', icon: FileText },
  { value: 'RUC', label: 'RUC', icon: CreditCard }
];

export default function ParticipantesPage() {
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateParticipanteDto>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try { 
      setLoading(true); 
      setParticipantes(await ParticipantesService.findAll()); 
    } catch (e: any) { 
      setError(e.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const abrirCrear = () => {
    setForm({ ...emptyForm, tipoDocumento: 'DNI' });
    setEditingId(null);
    setErrors({});
    setModalError('');
    setModalOpen(true);
  };

  const abrirEditar = (p: Participante) => {
    setForm({
      tipoDocumento: p.tipoDocumento,
      numeroDocumento: p.numeroDocumento,
      nombres: p.nombres,
      apellidos: p.apellidos,
      email: p.email || '',
      telefono: p.telefono || ''
    });
    setEditingId(p.id);
    setErrors({});
    setModalError('');
    setModalOpen(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.tipoDocumento) newErrors.tipoDocumento = 'Selecciona un tipo de documento';
    if (!form.numeroDocumento?.trim()) newErrors.numeroDocumento = 'Ingresa el número de documento';
    if (!form.nombres?.trim()) newErrors.nombres = 'Ingresa los nombres';
    if (!form.apellidos?.trim()) newErrors.apellidos = 'Ingresa los apellidos';
    if (form.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Ingresa un correo válido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setModalError('');
    try {
      editingId
        ? await ParticipantesService.update(editingId, form)
        : await ParticipantesService.create(form);
      setModalOpen(false);
      await cargar();
    } catch (e: any) {
      const msg: string = Array.isArray(e.message) ? e.message.join(', ') : e.message;
      if (msg.toLowerCase().includes('document') || msg.toLowerCase().includes('exist') || msg.toLowerCase().includes('conflict') || msg.toLowerCase().includes('duplica')) {
        setErrors(prev => ({ ...prev, numeroDocumento: 'Ya existe un participante con este número de documento' }));
      } else {
        setModalError(msg || 'Ocurrió un error al guardar');
      }
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar este participante?')) return;
    try { await ParticipantesService.remove(id); await cargar(); } 
    catch (e: any) { setError(e.message); }
  };

  const toggleActivo = async (id: number) => {
    try { await ParticipantesService.toggleActive(id); await cargar(); } 
    catch (e: any) { setError(e.message); }
  };

  const filtrados = participantes.filter(p => {
    const q = search.toLowerCase();
    return p.nombres.toLowerCase().includes(q) || 
           p.apellidos.toLowerCase().includes(q) || 
           p.numeroDocumento.includes(q) || 
           (p.email || '').toLowerCase().includes(q);
  });

  const getTipoIcon = (tipo: string) => {
    const found = TIPOS_DOC.find(t => t.value === tipo);
    const Icon = found?.icon || CreditCard;
    return <Icon size={14} />;
  };

  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <h1 className="page-title">Participantes</h1>
          <p className="page-subtitle">{participantes.length} participantes registrados</p>
        </div>
        <button onClick={abrirCrear} className="btn-primary">
          <Plus size={16} /> Nuevo Participante
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
            placeholder="Buscar por nombre, documento o correo..."
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
              <UserCheck size={40} className="text-gray-200" />
              <p className="text-sm text-gray-400">No hay registros</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ borderBottom: '1px solid #F0F2F5' }}>
                  <tr style={{ backgroundColor: '#FAFAFA' }}>
                    {['Documento', 'Nombres', 'Apellidos', 'Correo', 'Teléfono', 'Estado', ''].map(h => (
                      <th key={h} className="table-header">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map(p => (
                    <tr key={p.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400">
                            {getTipoIcon(p.tipoDocumento)}
                          </span>
                          <div>
                            <div className="text-[10px] text-gray-400">{p.tipoDocumento}</div>
                            <div className="font-medium text-gray-900 text-sm">{p.numeroDocumento}</div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell font-medium text-gray-900">{p.nombres}</td>
                      <td className="table-cell text-gray-700">{p.apellidos}</td>
                      <td className="table-cell text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Mail size={12} className="text-gray-300" />
                          <span>{p.email || '—'}</span>
                        </div>
                      </td>
                      <td className="table-cell text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Phone size={12} className="text-gray-300" />
                          <span>{p.telefono || '—'}</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={p.activo ? 'badge-green' : 'badge-gray'}>
                          {p.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => toggleActivo(p.id)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                            {p.activo
                              ? <ToggleRight size={18} className="text-emerald-500" />
                              : <ToggleLeft size={18} className="text-gray-300" />
                            }
                          </button>
                          <button onClick={() => abrirEditar(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#E8B84B] hover:bg-orange-50 transition-colors">
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

      {/* MODAL MEJORADO - SIN EMOJIS */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Participante' : 'Nuevo Participante'}
        size="md"
      >
        <form onSubmit={guardar} className="space-y-5">
          
          {/* Tipo de Documento - Cards seleccionables */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <CreditCard size={16} className="text-[#E8B84B]" />
              Tipo de documento *
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TIPOS_DOC.map(tipo => {
                const Icon = tipo.icon;
                const selected = form.tipoDocumento === tipo.value;
                return (
                  <button
                    key={tipo.value}
                    type="button"
                    onClick={() => setForm({ ...form, tipoDocumento: tipo.value })}
                    className={`flex flex-col items-center gap-2 rounded-xl p-3 border-2 transition-all duration-200 ${
                      selected 
                        ? 'border-[#E8B84B] bg-orange-50 shadow-sm scale-[0.98]' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        selected ? 'bg-[#E8B84B] text-white shadow-md' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <span className={`text-xs font-medium ${selected ? 'text-[#E8B84B]' : 'text-gray-600'}`}>
                      {tipo.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.tipoDocumento && <p className="text-xs text-red-500 mt-1">{errors.tipoDocumento}</p>}
          </div>

          {/* Número de Documento */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <FileText size={16} className="text-[#E8B84B]" />
              Número de documento *
            </label>
            <input
              value={form.numeroDocumento}
              onChange={e => setForm({ ...form, numeroDocumento: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#E8B84B]/20 focus:border-[#E8B84B] ${
                errors.numeroDocumento ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              placeholder={form.tipoDocumento === 'RUC' ? '20123456789' : '12345678'}
              autoComplete="off"
            />
            {errors.numeroDocumento && <p className="text-xs text-red-500 mt-1">{errors.numeroDocumento}</p>}
          </div>

          {/* Nombres y Apellidos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                <User size={16} className="text-[#E8B84B]" />
                Nombres *
              </label>
              <input
                value={form.nombres}
                onChange={e => setForm({ ...form, nombres: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#E8B84B]/20 focus:border-[#E8B84B] ${
                  errors.nombres ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                placeholder="Juan Carlos"
                autoComplete="off"
              />
              {errors.nombres && <p className="text-xs text-red-500 mt-1">{errors.nombres}</p>}
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                <User size={16} className="text-[#E8B84B]" />
                Apellidos *
              </label>
              <input
                value={form.apellidos}
                onChange={e => setForm({ ...form, apellidos: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#E8B84B]/20 focus:border-[#E8B84B] ${
                  errors.apellidos ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                placeholder="García López"
                autoComplete="off"
              />
              {errors.apellidos && <p className="text-xs text-red-500 mt-1">{errors.apellidos}</p>}
            </div>
          </div>

          {/* Correo Electrónico */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <Mail size={16} className="text-[#E8B84B]" />
              Correo electrónico
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#E8B84B]/20 focus:border-[#E8B84B] ${
                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="correo@ejemplo.com"
              autoComplete="off"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Teléfono */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <Phone size={16} className="text-[#E8B84B]" />
              Teléfono
            </label>
            <input
              value={form.telefono}
              onChange={e => setForm({ ...form, telefono: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#E8B84B]/20 focus:border-[#E8B84B]"
              placeholder="987654321"
              autoComplete="off"
            />
          </div>

          {/* Vista previa dinámica */}
          {(form.nombres || form.apellidos || form.numeroDocumento) && (
            <div className="mt-2 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
              <div className="flex items-center gap-2 text-xs font-medium text-orange-600 mb-2">
                <Eye size={12} />
                Vista previa
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-white rounded-lg shadow-sm text-xs flex items-center gap-1">
                  <CreditCard size={10} className="text-[#E8B84B]" />
                  {form.tipoDocumento}
                </span>
                <span className="px-2 py-1 bg-white rounded-lg shadow-sm text-xs flex items-center gap-1">
                  <FileText size={10} className="text-[#E8B84B]" />
                  {form.numeroDocumento || 'N° documento'}
                </span>
                {(form.nombres || form.apellidos) && (
                  <span className="px-2 py-1 bg-white rounded-lg shadow-sm text-xs flex items-center gap-1">
                    <User size={10} className="text-[#E8B84B]" />
                    {form.nombres} {form.apellidos}
                  </span>
                )}
                {form.email && (
                  <span className="px-2 py-1 bg-white rounded-lg shadow-sm text-xs flex items-center gap-1">
                    <Mail size={10} className="text-[#E8B84B]" />
                    {form.email}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Error del servidor dentro del modal */}
          {modalError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <span className="shrink-0 mt-0.5">⚠</span>
              <span className="flex-1">{modalError}</span>
              <button type="button" onClick={() => setModalError('')} className="shrink-0 font-bold text-red-400 hover:text-red-600 leading-none">×</button>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#E8B84B] hover:bg-[#D4A017] text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>{editingId ? 'Actualizar participante' : 'Crear participante'}</>
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