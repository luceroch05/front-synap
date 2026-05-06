import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Edit2, Trash2, Settings, ToggleLeft, ToggleRight, Image as ImageIcon, 
  PenLine, Eye, CheckCircle, BookOpen, Shield, FileText, Users
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import ImageUpload from '@/components/ui/ImageUpload';
import { ConfiguracionesCertificadoService, ConfiguracionCertificado, CreateConfiguracionCertificadoDto } from '@/lib/services/configuraciones-certificado.service';
import { ProgramasService, Programa } from '@/lib/services/programas.service';
import { FirmasService, Firma, CreateFirmaDto } from '@/lib/services/firmas.service';
import { LogosService, Logo, CreateLogoDto } from '@/lib/services/logos.service';

type Tab = 'configuraciones' | 'logos' | 'firmas';

const emptyConfig: CreateConfiguracionCertificadoDto = { programaId: 0, plantillaUrl: '', activo: true, logos: [], firmas: [] };
const emptyLogo: CreateLogoDto = { nombre: '', imagenLogo: '', activo: true };
const emptyFirma: CreateFirmaDto = { nombreAutoridad: '', cargo: '', imagenFirma: '', activo: true };

// COMPONENTE COMBOBOX PARA PROGRAMAS
function ProgramaCombobox({ options, value, onChange, placeholder = "Buscar programa..." }: { 
  options: Programa[]; 
  value: number; 
  onChange: (id: number) => void; 
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedPrograma = options.find(o => o.id === value);

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter(opt => opt.nombre.toLowerCase().includes(term));
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

  const handleSelect = (programa: Programa) => {
    onChange(programa.id);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className={`relative flex items-center border rounded-xl transition-all ${
        isOpen ? 'border-[#E8B84B] ring-2 ring-[#E8B84B]/20' : 'border-gray-200'
      }`}>
        <BookOpen className="absolute left-3 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={isOpen ? searchTerm : (selectedPrograma?.nombre || '')}
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
        {selectedPrograma && !isOpen && (
          <div className="absolute right-3 px-1.5 py-0.5 bg-green-50 rounded text-[10px] font-medium text-green-600 flex items-center gap-1">
            <CheckCircle size={10} />
            Seleccionado
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
                idx === highlightedIndex ? 'bg-orange-50 text-[#E8B84B]' : 'hover:bg-gray-50'
              } ${value === opt.id ? 'bg-orange-50/50 font-medium text-[#E8B84B]' : 'text-gray-700'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className={value === opt.id ? 'text-[#E8B84B]' : 'text-gray-400'} />
                  <span>{opt.nombre}</span>
                </div>
                {value === opt.id && <CheckCircle className="w-3.5 h-3.5 text-[#E8B84B]" />}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// COMPONENTE SELECTOR DE ITEMS (reutilizable para logos y firmas)
function ItemSelector({ items, selectedIds, onChange, maxSelection = 3, type = 'logo' }: { 
  items: any[]; 
  selectedIds: number[]; 
  onChange: (ids: number[]) => void; 
  maxSelection?: number;
  type: 'logo' | 'firma';
}) {
  const toggleItem = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(x => x !== id));
    } else if (selectedIds.length < maxSelection) {
      onChange([...selectedIds, id]);
    }
  };

  const getItemImage = (item: any) => {
    if (type === 'logo') return item.imagenLogo;
    return item.imagenFirma;
  };

  const getItemName = (item: any) => {
    if (type === 'logo') return item.nombre || `Logo #${item.id}`;
    return `${item.nombreAutoridad} - ${item.cargo}`;
  };

  if (items.length === 0) return null;

  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
        {type === 'logo' ? <ImageIcon size={16} className="text-[#E8B84B]" /> : <PenLine size={16} className="text-[#E8B84B]" />}
        {type === 'logo' ? 'Logos' : 'Firmas'} (máx. {maxSelection})
      </label>
      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-gray-50">
        {items.map(item => {
          const isSelected = selectedIds.includes(item.id);
          const isDisabled = !isSelected && selectedIds.length >= maxSelection;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleItem(item.id)}
              disabled={isDisabled}
              className={`flex items-center gap-3 p-2 rounded-xl border-2 transition-all text-left ${
                isSelected 
                  ? 'border-[#E8B84B] bg-orange-50 shadow-sm' 
                  : isDisabled 
                    ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="w-12 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-gray-100">
                {getItemImage(item) ? (
                  <img src={getItemImage(item)} alt={getItemName(item)} className="max-w-full max-h-full object-contain" />
                ) : (
                  <ImageIcon size={20} className="text-gray-300" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-xs font-medium truncate ${isSelected ? 'text-[#E8B84B]' : 'text-gray-700'}`}>
                  {getItemName(item)}
                </p>
              </div>
              {isSelected && <CheckCircle size={14} className="text-[#E8B84B] flex-shrink-0" />}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-1">
        {selectedIds.length}/{maxSelection} seleccionados
      </p>
    </div>
  );
}

export default function ConfigCertificadosPage() {
  const [tab, setTab] = useState<Tab>('configuraciones');

  const [programas, setProgramas] = useState<Programa[]>([]);
  const [firmas, setFirmas] = useState<Firma[]>([]);
  const [logos, setLogos] = useState<Logo[]>([]);
  const [configs, setConfigs] = useState<ConfiguracionCertificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { cargarTodo(); }, []);

  const cargarTodo = async () => {
    try {
      setLoading(true);
      const [c, p, f, l] = await Promise.all([
        ConfiguracionesCertificadoService.findAll(),
        ProgramasService.findAll(),
        FirmasService.findAll(),
        LogosService.findAll(),
      ]);
      setConfigs(c); setProgramas(p); setFirmas(f); setLogos(l);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  /* ══════════════════════════════════════════════════
     CONFIGURACIONES
  ══════════════════════════════════════════════════ */
  const [configModal, setConfigModal] = useState(false);
  const [editingConfigId, setEditingConfigId] = useState<number | null>(null);
  const [configForm, setConfigForm] = useState<CreateConfiguracionCertificadoDto>(emptyConfig);
  const [selFirmas, setSelFirmas] = useState<number[]>([]);
  const [selLogos, setSelLogos] = useState<number[]>([]);
  const [savingConfig, setSavingConfig] = useState(false);

  const abrirCrearConfig = () => {
    setConfigForm({ ...emptyConfig, programaId: programas[0]?.id || 0, activo: true });
    setSelFirmas([]); setSelLogos([]);
    setEditingConfigId(null); setErrors({});
    setConfigModal(true);
  };

  const abrirEditarConfig = (c: ConfiguracionCertificado) => {
    setConfigForm({ programaId: c.programaId, plantillaUrl: c.plantillaUrl || '', activo: c.activo });
    setSelFirmas(c.firmas?.map(f => f.firmaId) || []);
    setSelLogos(c.logos?.map(l => l.logoId) || []);
    setEditingConfigId(c.id); setErrors({});
    setConfigModal(true);
  };

  const validateConfig = () => {
    const newErrors: Record<string, string> = {};
    if (!configForm.programaId || configForm.programaId === 0) newErrors.programaId = 'Selecciona un programa';
    if (!configForm.plantillaUrl) newErrors.plantillaUrl = 'Sube la imagen de fondo de la plantilla';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const guardarConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateConfig()) return;
    setSavingConfig(true);
    const data = { ...configForm, firmas: selFirmas.map(id => ({ firmaId: id })), logos: selLogos.map(id => ({ logoId: id })) };
    try {
      editingConfigId
        ? await ConfiguracionesCertificadoService.update(editingConfigId, data)
        : await ConfiguracionesCertificadoService.create(data);
      setConfigModal(false); await cargarTodo();
    } catch (e: any) { setError(e.message); }
    finally { setSavingConfig(false); }
  };

  const eliminarConfig = async (id: number) => {
    if (!confirm('¿Eliminar esta configuración?')) return;
    try { await ConfiguracionesCertificadoService.remove(id); await cargarTodo(); } 
    catch (e: any) { setError(e.message); }
  };

  const toggleConfig = async (id: number) => {
    try { await ConfiguracionesCertificadoService.toggleActive(id); await cargarTodo(); } 
    catch (e: any) { setError(e.message); }
  };

  /* ══════════════════════════════════════════════════
     LOGOS
  ══════════════════════════════════════════════════ */
  const [logoModal, setLogoModal] = useState(false);
  const [editingLogoId, setEditingLogoId] = useState<number | null>(null);
  const [logoForm, setLogoForm] = useState<CreateLogoDto>(emptyLogo);
  const [savingLogo, setSavingLogo] = useState(false);
  const [logoErrors, setLogoErrors] = useState<Record<string, string>>({});

  const abrirCrearLogo = () => { setLogoForm({ ...emptyLogo, activo: true }); setEditingLogoId(null); setLogoErrors({}); setLogoModal(true); };
  const abrirEditarLogo = (l: Logo) => { setLogoForm({ nombre: l.nombre || '', imagenLogo: l.imagenLogo, activo: l.activo }); setEditingLogoId(l.id); setLogoErrors({}); setLogoModal(true); };

  const validateLogo = () => {
    const newErrors: Record<string, string> = {};
    if (!logoForm.imagenLogo) newErrors.imagenLogo = 'Selecciona una imagen';
    setLogoErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const guardarLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogo()) return;
    setSavingLogo(true);
    try {
      editingLogoId ? await LogosService.update(editingLogoId, logoForm) : await LogosService.create(logoForm);
      setLogoModal(false); await cargarTodo();
    } catch (e: any) { setError(e.message); }
    finally { setSavingLogo(false); }
  };

  const eliminarLogo = async (id: number) => {
    if (!confirm('¿Eliminar este logo?')) return;
    try { await LogosService.remove(id); await cargarTodo(); } 
    catch (e: any) { setError(e.message); }
  };

  const toggleLogo = async (id: number) => {
    try { await LogosService.toggleActive(id); await cargarTodo(); } 
    catch (e: any) { setError(e.message); }
  };

  /* ══════════════════════════════════════════════════
     FIRMAS
  ══════════════════════════════════════════════════ */
  const [firmaModal, setFirmaModal] = useState(false);
  const [editingFirmaId, setEditingFirmaId] = useState<number | null>(null);
  const [firmaForm, setFirmaForm] = useState<CreateFirmaDto>(emptyFirma);
  const [savingFirma, setSavingFirma] = useState(false);
  const [firmaErrors, setFirmaErrors] = useState<Record<string, string>>({});

  const abrirCrearFirma = () => { setFirmaForm({ ...emptyFirma, activo: true }); setEditingFirmaId(null); setFirmaErrors({}); setFirmaModal(true); };
  const abrirEditarFirma = (f: Firma) => { setFirmaForm({ nombreAutoridad: f.nombreAutoridad, cargo: f.cargo, imagenFirma: f.imagenFirma, activo: f.activo }); setEditingFirmaId(f.id); setFirmaErrors({}); setFirmaModal(true); };

  const validateFirma = () => {
    const newErrors: Record<string, string> = {};
    if (!firmaForm.nombreAutoridad?.trim()) newErrors.nombreAutoridad = 'Ingresa el nombre de la autoridad';
    if (!firmaForm.cargo?.trim()) newErrors.cargo = 'Ingresa el cargo';
    if (!firmaForm.imagenFirma) newErrors.imagenFirma = 'Sube la imagen de la firma';
    setFirmaErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const guardarFirma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFirma()) return;
    setSavingFirma(true);
    try {
      editingFirmaId ? await FirmasService.update(editingFirmaId, firmaForm) : await FirmasService.create(firmaForm);
      setFirmaModal(false); await cargarTodo();
    } catch (e: any) { setError(e.message); }
    finally { setSavingFirma(false); }
  };

  const eliminarFirma = async (id: number) => {
    if (!confirm('¿Eliminar esta firma?')) return;
    try { await FirmasService.remove(id); await cargarTodo(); } 
    catch (e: any) { setError(e.message); }
  };

  const toggleFirma = async (id: number) => {
    try { await FirmasService.toggleActive(id); await cargarTodo(); } 
    catch (e: any) { setError(e.message); }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'configuraciones', label: 'Configuraciones', icon: <Settings size={15} />, count: configs.length },
    { key: 'logos', label: 'Logos', icon: <ImageIcon size={15} />, count: logos.length },
    { key: 'firmas', label: 'Firmas', icon: <PenLine size={15} />, count: firmas.length },
  ];

  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <h1 className="page-title">Configuración de Certificados</h1>
          <p className="page-subtitle">Gestiona plantillas, logos y firmas para los certificados</p>
        </div>
      </div>

      <div className="page-body">
        {error && (
          <div className="error-bar">
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-bold text-lg leading-none">×</button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.icon}
              {t.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-orange-50 text-orange-700' : 'bg-gray-200 text-gray-500'}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="spinner" />
            <p className="text-sm text-gray-400">Cargando...</p>
          </div>
        ) : (
          <>
            {/* TAB: CONFIGURACIONES */}
            {tab === 'configuraciones' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button onClick={abrirCrearConfig} className="btn-primary">
                    <Plus size={16} /> Nueva Configuración
                  </button>
                </div>

                {configs.length === 0 ? (
                  <div className="table-card flex flex-col items-center justify-center py-16 gap-2">
                    <Settings size={40} className="text-gray-200" />
                    <p className="text-sm text-gray-400">No hay configuraciones. Primero agrega logos y firmas, luego crea una configuración.</p>
                  </div>
                ) : (
                  <div className="table-card">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead style={{ borderBottom: '1px solid #F0F2F5' }}>
                          <tr style={{ backgroundColor: '#FAFAFA' }}>
                            {['Programa', 'Plantilla', 'Firmas', 'Logos', 'Estado', ''].map(h => (
                              <th key={h} className="table-header">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {configs.map(c => (
                            <tr key={c.id} className="table-row">
                              <td className="table-cell font-medium text-gray-900">{c.programa?.nombre || `#${c.programaId}`}</td>
                              <td className="table-cell">
                                {c.plantillaUrl?.startsWith('data:') || c.plantillaUrl?.startsWith('http')
                                  ? <img src={c.plantillaUrl} alt="plantilla" className="h-10 w-16 object-cover rounded-lg border border-gray-200" />
                                  : <span className="badge-orange">Sin plantilla</span>}
                              </td>
                              <td className="table-cell text-sm text-gray-600">{c.firmas?.length || 0} firma(s)</td>
                              <td className="table-cell text-sm text-gray-600">{c.logos?.length || 0} logo(s)</td>
                              <td className="table-cell">
                                <span className={c.activo ? 'badge-green' : 'badge-gray'}>
                                  {c.activo ? 'Activo' : 'Inactivo'}
                                </span>
                              </td>
                              <td className="table-cell">
                                <div className="flex items-center justify-end gap-1">
                                  <button onClick={() => toggleConfig(c.id)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                    {c.activo ? <ToggleRight size={18} className="text-emerald-500" /> : <ToggleLeft size={18} className="text-gray-300" />}
                                  </button>
                                  <button onClick={() => abrirEditarConfig(c)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#E8B84B] hover:bg-orange-50 transition-colors">
                                    <Edit2 size={15} />
                                  </button>
                                  <button onClick={() => eliminarConfig(c.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                       </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: LOGOS */}
            {tab === 'logos' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button onClick={abrirCrearLogo} className="btn-primary">
                    <Plus size={16} /> Nuevo Logo
                  </button>
                </div>

                {logos.length === 0 ? (
                  <div className="table-card flex flex-col items-center justify-center py-16 gap-2">
                    <ImageIcon size={40} className="text-gray-200" />
                    <p className="text-sm text-gray-400">No hay logos. Agrega el primero.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {logos.map(logo => (
                      <div key={logo.id} className={`table-card overflow-hidden ${logo.activo ? '' : 'opacity-60'}`}>
                        <div className="aspect-square bg-gray-50 flex items-center justify-center p-3">
                          {logo.imagenLogo
                            ? <img src={logo.imagenLogo} alt={logo.nombre || 'Logo'} className="max-w-full max-h-full object-contain" />
                            : <ImageIcon size={36} className="text-gray-300" />}
                        </div>
                        <div className="p-3 border-t border-gray-100">
                          <p className="text-sm font-medium text-gray-800 truncate">{logo.nombre || 'Sin nombre'}</p>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-medium ${logo.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                            {logo.activo ? 'Activo' : 'Inactivo'}
                          </span>
                          <div className="flex items-center gap-1 mt-2">
                            <button onClick={() => toggleLogo(logo.id)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                              {logo.activo ? <ToggleRight size={16} className="text-emerald-500" /> : <ToggleLeft size={16} className="text-gray-300" />}
                            </button>
                            <button onClick={() => abrirEditarLogo(logo)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#E8B84B] hover:bg-orange-50 transition-colors">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => eliminarLogo(logo.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: FIRMAS */}
            {tab === 'firmas' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button onClick={abrirCrearFirma} className="btn-primary">
                    <Plus size={16} /> Nueva Firma
                  </button>
                </div>

                {firmas.length === 0 ? (
                  <div className="table-card flex flex-col items-center justify-center py-16 gap-2">
                    <PenLine size={40} className="text-gray-200" />
                    <p className="text-sm text-gray-400">No hay firmas. Agrega la primera.</p>
                  </div>
                ) : (
                  <div className="table-card">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead style={{ borderBottom: '1px solid #F0F2F5' }}>
                          <tr style={{ backgroundColor: '#FAFAFA' }}>
                            {['Firma', 'Autoridad', 'Cargo', 'Estado', ''].map(h => (
                              <th key={h} className="table-header">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {firmas.map(firma => (
                            <tr key={firma.id} className="table-row">
                              <td className="table-cell">
                                {firma.imagenFirma
                                  ? <img src={firma.imagenFirma} alt={firma.nombreAutoridad} className="h-12 max-w-[120px] object-contain bg-gray-50 rounded-lg border border-gray-100 p-1" />
                                  : <div className="h-12 w-24 bg-gray-100 rounded-lg flex items-center justify-center"><PenLine size={16} className="text-gray-300" /></div>}
                               </td>
                              <td className="table-cell font-medium text-gray-900">{firma.nombreAutoridad}</td>
                              <td className="table-cell text-sm text-gray-600">{firma.cargo}</td>
                              <td className="table-cell">
                                <span className={firma.activo ? 'badge-green' : 'badge-gray'}>
                                  {firma.activo ? 'Activo' : 'Inactivo'}
                                </span>
                               </td>
                              <td className="table-cell">
                                <div className="flex items-center justify-end gap-1">
                                  <button onClick={() => toggleFirma(firma.id)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                    {firma.activo ? <ToggleRight size={18} className="text-emerald-500" /> : <ToggleLeft size={18} className="text-gray-300" />}
                                  </button>
                                  <button onClick={() => abrirEditarFirma(firma)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#E8B84B] hover:bg-orange-50 transition-colors">
                                    <Edit2 size={15} />
                                  </button>
                                  <button onClick={() => eliminarFirma(firma.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                               </td>
                             </tr>
                          ))}
                        </tbody>
                       </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL: CONFIGURACIÓN MEJORADO */}
      <Modal isOpen={configModal} onClose={() => setConfigModal(false)} title={editingConfigId ? 'Editar Configuración' : 'Nueva Configuración'} size="lg">
        <form onSubmit={guardarConfig} className="space-y-5">
          
          {/* Programa con combobox */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <BookOpen size={16} className="text-[#E8B84B]" />
              Programa *
            </label>
            <ProgramaCombobox
              options={programas}
              value={configForm.programaId}
              onChange={(id) => setConfigForm({ ...configForm, programaId: id })}
              placeholder="Buscar programa..."
            />
            {errors.programaId && <p className="text-xs text-red-500 mt-1">{errors.programaId}</p>}
          </div>

          {/* Plantilla */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <ImageIcon size={16} className="text-[#E8B84B]" />
              Imagen de fondo de la plantilla *
            </label>
            <ImageUpload 
              label="" 
              value={configForm.plantillaUrl}
              onChange={base64 => setConfigForm({ ...configForm, plantillaUrl: base64 })}
              accept="image/jpeg,image/png,image/webp" 
            />
            {errors.plantillaUrl && <p className="text-xs text-red-500 mt-1">{errors.plantillaUrl}</p>}
            <p className="text-xs text-gray-400 mt-1">Recomendado: horizontal, mín. 1122×793 px (A4 landscape)</p>
          </div>

          {/* Preview de plantilla */}
          {configForm.plantillaUrl && (
            <div className="mt-2 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
              <div className="flex items-center gap-2 text-xs font-medium text-orange-600 mb-2">
                <Eye size={12} />
                Vista previa de la plantilla
              </div>
              <img src={configForm.plantillaUrl} alt="Plantilla preview" className="max-h-32 rounded-lg border border-orange-200 shadow-sm" />
            </div>
          )}

          {/* Selector de Firmas */}
          {firmas.length > 0 && (
            <ItemSelector
              items={firmas}
              selectedIds={selFirmas}
              onChange={setSelFirmas}
              maxSelection={3}
              type="firma"
            />
          )}

          {/* Selector de Logos */}
          {logos.length > 0 && (
            <ItemSelector
              items={logos}
              selectedIds={selLogos}
              onChange={setSelLogos}
              maxSelection={3}
              type="logo"
            />
          )}

          {/* Estado activo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setConfigForm({ ...configForm, activo: !configForm.activo })}
              className="relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 shadow-sm"
              style={{ backgroundColor: configForm.activo ? '#E8B84B' : '#D1D5DB' }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200"
                style={{ transform: configForm.activo ? 'translateX(24px)' : 'translateX(0)' }}
              />
            </button>
            <span className="text-sm text-gray-700">Configuración activa</span>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={savingConfig}
              className="flex-1 bg-[#E8B84B] hover:bg-[#D4A017] text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {savingConfig ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>{editingConfigId ? 'Actualizar configuración' : 'Crear configuración'}</>
              )}
            </button>
            <button
              type="button"
              onClick={() => setConfigModal(false)}
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>

        </form>
      </Modal>

      {/* MODAL: LOGO MEJORADO */}
      <Modal isOpen={logoModal} onClose={() => setLogoModal(false)} title={editingLogoId ? 'Editar Logo' : 'Nuevo Logo'} size="md">
        <form onSubmit={guardarLogo} className="space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <FileText size={16} className="text-[#E8B84B]" />
              Nombre (opcional)
            </label>
            <input
              value={logoForm.nombre || ''}
              onChange={e => setLogoForm({ ...logoForm, nombre: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#E8B84B]/20 focus:border-[#E8B84B]"
              placeholder="Ej: Logo UNMSM"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <ImageIcon size={16} className="text-[#E8B84B]" />
              Imagen del Logo *
            </label>
            <ImageUpload 
              label="" 
              value={logoForm.imagenLogo}
              onChange={base64 => setLogoForm({ ...logoForm, imagenLogo: base64 })}
            />
            {logoErrors.imagenLogo && <p className="text-xs text-red-500 mt-1">{logoErrors.imagenLogo}</p>}
          </div>

          {logoForm.imagenLogo && (
            <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
              <div className="flex items-center gap-2 text-xs font-medium text-orange-600 mb-2">
                <Eye size={12} />
                Vista previa
              </div>
              <img src={logoForm.imagenLogo} alt="Logo preview" className="h-16 object-contain" />
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLogoForm({ ...logoForm, activo: !logoForm.activo })}
              className="relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 shadow-sm"
              style={{ backgroundColor: logoForm.activo ? '#E8B84B' : '#D1D5DB' }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200"
                style={{ transform: logoForm.activo ? 'translateX(24px)' : 'translateX(0)' }}
              />
            </button>
            <span className="text-sm text-gray-700">Logo activo</span>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={savingLogo}
              className="flex-1 bg-[#E8B84B] hover:bg-[#D4A017] text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {savingLogo ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>{editingLogoId ? 'Actualizar logo' : 'Crear logo'}</>
              )}
            </button>
            <button
              type="button"
              onClick={() => setLogoModal(false)}
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: FIRMA MEJORADO */}
      <Modal isOpen={firmaModal} onClose={() => setFirmaModal(false)} title={editingFirmaId ? 'Editar Firma' : 'Nueva Firma'} size="md">
        <form onSubmit={guardarFirma} className="space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <Users size={16} className="text-[#E8B84B]" />
              Nombre de la autoridad *
            </label>
            <input
              value={firmaForm.nombreAutoridad}
              onChange={e => setFirmaForm({ ...firmaForm, nombreAutoridad: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#E8B84B]/20 focus:border-[#E8B84B] ${
                firmaErrors.nombreAutoridad ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="Ej: Dr. Juan Pérez García"
            />
            {firmaErrors.nombreAutoridad && <p className="text-xs text-red-500 mt-1">{firmaErrors.nombreAutoridad}</p>}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <Shield size={16} className="text-[#E8B84B]" />
              Cargo *
            </label>
            <input
              value={firmaForm.cargo}
              onChange={e => setFirmaForm({ ...firmaForm, cargo: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#E8B84B]/20 focus:border-[#E8B84B] ${
                firmaErrors.cargo ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="Ej: Director de Posgrado"
            />
            {firmaErrors.cargo && <p className="text-xs text-red-500 mt-1">{firmaErrors.cargo}</p>}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <PenLine size={16} className="text-[#E8B84B]" />
              Imagen de la firma *
            </label>
            <ImageUpload 
              label="" 
              value={firmaForm.imagenFirma}
              onChange={base64 => setFirmaForm({ ...firmaForm, imagenFirma: base64 })}
              accept="image/png,image/jpeg,image/webp"
            />
            {firmaErrors.imagenFirma && <p className="text-xs text-red-500 mt-1">{firmaErrors.imagenFirma}</p>}
          </div>

          {firmaForm.imagenFirma && (
            <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
              <div className="flex items-center gap-2 text-xs font-medium text-orange-600 mb-2">
                <Eye size={12} />
                Vista previa
              </div>
              <img src={firmaForm.imagenFirma} alt="Firma preview" className="h-12 object-contain" />
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFirmaForm({ ...firmaForm, activo: !firmaForm.activo })}
              className="relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 shadow-sm"
              style={{ backgroundColor: firmaForm.activo ? '#E8B84B' : '#D1D5DB' }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200"
                style={{ transform: firmaForm.activo ? 'translateX(24px)' : 'translateX(0)' }}
              />
            </button>
            <span className="text-sm text-gray-700">Firma activa</span>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={savingFirma}
              className="flex-1 bg-[#E8B84B] hover:bg-[#D4A017] text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {savingFirma ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>{editingFirmaId ? 'Actualizar firma' : 'Crear firma'}</>
              )}
            </button>
            <button
              type="button"
              onClick={() => setFirmaModal(false)}
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