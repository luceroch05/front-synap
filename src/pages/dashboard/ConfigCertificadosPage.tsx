import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Settings, ToggleLeft, ToggleRight, Image as ImageIcon, PenLine } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import ImageUpload from '@/components/ui/ImageUpload';
import { ConfiguracionesCertificadoService, ConfiguracionCertificado, CreateConfiguracionCertificadoDto } from '@/lib/services/configuraciones-certificado.service';
import { ProgramasService, Programa } from '@/lib/services/programas.service';
import { FirmasService, Firma, CreateFirmaDto } from '@/lib/services/firmas.service';
import { LogosService, Logo, CreateLogoDto } from '@/lib/services/logos.service';

type Tab = 'configuraciones' | 'logos' | 'firmas';

/* ─── Configuraciones ─── */
const emptyConfig: CreateConfiguracionCertificadoDto = { programaId: 0, plantillaUrl: '', activo: true, logos: [], firmas: [] };

/* ─── Logos ─── */
const emptyLogo: CreateLogoDto = { nombre: '', imagenLogo: '', activo: true };

/* ─── Firmas ─── */
const emptyFirma: CreateFirmaDto = { nombreAutoridad: '', cargo: '', imagenFirma: '', activo: true };

export default function ConfigCertificadosPage() {
  const [tab, setTab] = useState<Tab>('configuraciones');

  /* ── datos compartidos ── */
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [firmas, setFirmas] = useState<Firma[]>([]);
  const [logos, setLogos] = useState<Logo[]>([]);
  const [configs, setConfigs] = useState<ConfiguracionCertificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    setConfigForm({ ...emptyConfig, programaId: programas[0]?.id || 0 });
    setSelFirmas([]); setSelLogos([]);
    setEditingConfigId(null); setConfigModal(true);
  };

  const abrirEditarConfig = (c: ConfiguracionCertificado) => {
    setConfigForm({ programaId: c.programaId, plantillaUrl: c.plantillaUrl || '', activo: c.activo });
    setSelFirmas(c.firmas?.map(f => f.firmaId) || []);
    setSelLogos(c.logos?.map(l => l.logoId) || []);
    setEditingConfigId(c.id); setConfigModal(true);
  };

  const guardarConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configForm.plantillaUrl) { setError('Sube la imagen de fondo de la plantilla'); return; }
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
    try { await ConfiguracionesCertificadoService.remove(id); await cargarTodo(); } catch (e: any) { setError(e.message); }
  };

  const toggleConfig = async (id: number) => {
    try { await ConfiguracionesCertificadoService.toggleActive(id); await cargarTodo(); } catch (e: any) { setError(e.message); }
  };

  /* ══════════════════════════════════════════════════
     LOGOS
  ══════════════════════════════════════════════════ */
  const [logoModal, setLogoModal] = useState(false);
  const [editingLogoId, setEditingLogoId] = useState<number | null>(null);
  const [logoForm, setLogoForm] = useState<CreateLogoDto>(emptyLogo);
  const [savingLogo, setSavingLogo] = useState(false);

  const abrirCrearLogo = () => { setLogoForm({ ...emptyLogo }); setEditingLogoId(null); setLogoModal(true); };
  const abrirEditarLogo = (l: Logo) => { setLogoForm({ nombre: l.nombre || '', imagenLogo: l.imagenLogo, activo: l.activo }); setEditingLogoId(l.id); setLogoModal(true); };

  const guardarLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoForm.imagenLogo) { setError('Selecciona una imagen'); return; }
    setSavingLogo(true);
    try {
      editingLogoId ? await LogosService.update(editingLogoId, logoForm) : await LogosService.create(logoForm);
      setLogoModal(false); await cargarTodo();
    } catch (e: any) { setError(e.message); }
    finally { setSavingLogo(false); }
  };

  const eliminarLogo = async (id: number) => {
    if (!confirm('¿Eliminar este logo?')) return;
    try { await LogosService.remove(id); await cargarTodo(); } catch (e: any) { setError(e.message); }
  };

  const toggleLogo = async (id: number) => {
    try { await LogosService.toggleActive(id); await cargarTodo(); } catch (e: any) { setError(e.message); }
  };

  /* ══════════════════════════════════════════════════
     FIRMAS
  ══════════════════════════════════════════════════ */
  const [firmaModal, setFirmaModal] = useState(false);
  const [editingFirmaId, setEditingFirmaId] = useState<number | null>(null);
  const [firmaForm, setFirmaForm] = useState<CreateFirmaDto>(emptyFirma);
  const [savingFirma, setSavingFirma] = useState(false);

  const abrirCrearFirma = () => { setFirmaForm({ ...emptyFirma }); setEditingFirmaId(null); setFirmaModal(true); };
  const abrirEditarFirma = (f: Firma) => { setFirmaForm({ nombreAutoridad: f.nombreAutoridad, cargo: f.cargo, imagenFirma: f.imagenFirma, activo: f.activo }); setEditingFirmaId(f.id); setFirmaModal(true); };

  const guardarFirma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firmaForm.nombreAutoridad.trim() || !firmaForm.cargo.trim()) { setError('Nombre y cargo son obligatorios'); return; }
    if (!firmaForm.imagenFirma) { setError('Sube la imagen de la firma'); return; }
    setSavingFirma(true);
    try {
      editingFirmaId ? await FirmasService.update(editingFirmaId, firmaForm) : await FirmasService.create(firmaForm);
      setFirmaModal(false); await cargarTodo();
    } catch (e: any) { setError(e.message); }
    finally { setSavingFirma(false); }
  };

  const eliminarFirma = async (id: number) => {
    if (!confirm('¿Eliminar esta firma?')) return;
    try { await FirmasService.remove(id); await cargarTodo(); } catch (e: any) { setError(e.message); }
  };

  const toggleFirma = async (id: number) => {
    try { await FirmasService.toggleActive(id); await cargarTodo(); } catch (e: any) { setError(e.message); }
  };

  /* ══════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════ */
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
            {/* ══ TAB: CONFIGURACIONES ══ */}
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
                                  <button onClick={() => abrirEditarConfig(c)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#F7941D] hover:bg-orange-50 transition-colors">
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

            {/* ══ TAB: LOGOS ══ */}
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
                      <div key={logo.id}
                        className={`table-card overflow-hidden ${logo.activo ? '' : 'opacity-60'}`}>
                        <div className="aspect-square bg-gray-50 flex items-center justify-center p-3">
                          {logo.imagenLogo
                            ? <img src={logo.imagenLogo} alt={logo.nombre || 'Logo'} className="max-w-full max-h-full object-contain" />
                            : <ImageIcon size={36} className="text-gray-300" />}
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium text-gray-800 truncate">{logo.nombre || 'Sin nombre'}</p>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-medium ${logo.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                            {logo.activo ? 'Activo' : 'Inactivo'}
                          </span>
                          <div className="flex items-center gap-1 mt-2">
                            <button onClick={() => toggleLogo(logo.id)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                              {logo.activo ? <ToggleRight size={16} className="text-emerald-500" /> : <ToggleLeft size={16} className="text-gray-300" />}
                            </button>
                            <button onClick={() => abrirEditarLogo(logo)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#F7941D] hover:bg-orange-50 transition-colors">
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

            {/* ══ TAB: FIRMAS ══ */}
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
                                  <button onClick={() => abrirEditarFirma(firma)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#F7941D] hover:bg-orange-50 transition-colors">
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

      {/* ═══ MODAL: CONFIGURACIÓN ═══ */}
      <Modal isOpen={configModal} onClose={() => setConfigModal(false)} title={editingConfigId ? 'Editar Configuración' : 'Nueva Configuración'} size="lg">
        <form onSubmit={guardarConfig} className="space-y-5">
          <div>
            <label className="form-label">Programa *</label>
            <select value={configForm.programaId} onChange={e => setConfigForm({ ...configForm, programaId: Number(e.target.value) })}
              className="form-input" required>
              <option value={0} disabled>Seleccionar programa...</option>
              {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          <ImageUpload label="Imagen de Fondo de la Plantilla *" value={configForm.plantillaUrl}
            onChange={base64 => setConfigForm({ ...configForm, plantillaUrl: base64 })}
            accept="image/jpeg,image/png,image/webp" />
          <p className="text-xs text-gray-400 -mt-3">Recomendado: horizontal, mín. 1122×793 px (A4 landscape)</p>

          {firmas.length > 0 && (
            <div>
              <label className="form-label">Firmas (máx. 3)</label>
              <div className="space-y-2 max-h-36 overflow-y-auto border border-gray-200 rounded-xl p-3">
                {firmas.map(f => (
                  <label key={f.id} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={selFirmas.includes(f.id)}
                      onChange={() => setSelFirmas(prev => prev.includes(f.id) ? prev.filter(x => x !== f.id) : [...prev, f.id])}
                      disabled={!selFirmas.includes(f.id) && selFirmas.length >= 3} className="rounded" />
                    {f.imagenFirma && <img src={f.imagenFirma} alt={f.nombreAutoridad} className="h-8 w-16 object-contain bg-gray-50 rounded border border-gray-100" />}
                    <span className="text-sm text-gray-700">{f.nombreAutoridad} — {f.cargo}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {logos.length > 0 && (
            <div>
              <label className="form-label">Logos (máx. 3)</label>
              <div className="space-y-2 max-h-36 overflow-y-auto border border-gray-200 rounded-xl p-3">
                {logos.map(l => (
                  <label key={l.id} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={selLogos.includes(l.id)}
                      onChange={() => setSelLogos(prev => prev.includes(l.id) ? prev.filter(x => x !== l.id) : [...prev, l.id])}
                      disabled={!selLogos.includes(l.id) && selLogos.length >= 3} className="rounded" />
                    {l.imagenLogo && <img src={l.imagenLogo} alt={l.nombre} className="h-8 w-16 object-contain bg-gray-50 rounded border border-gray-100" />}
                    <span className="text-sm text-gray-700">{l.nombre || `Logo #${l.id}`}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input type="checkbox" id="activoConfig" checked={configForm.activo ?? true}
              onChange={e => setConfigForm({ ...configForm, activo: e.target.checked })} className="rounded" />
            <label htmlFor="activoConfig" className="text-sm text-gray-700">Configuración activa</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={savingConfig || !configForm.plantillaUrl} className="modal-btn-primary">
              {savingConfig ? 'Guardando...' : editingConfigId ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={() => setConfigModal(false)} className="modal-btn-cancel">Cancelar</button>
          </div>
        </form>
      </Modal>

      {/* ═══ MODAL: LOGO ═══ */}
      <Modal isOpen={logoModal} onClose={() => setLogoModal(false)} title={editingLogoId ? 'Editar Logo' : 'Nuevo Logo'} size="sm">
        <form onSubmit={guardarLogo} className="space-y-4">
          <div>
            <label className="form-label">Nombre (opcional)</label>
            <input value={logoForm.nombre || ''} onChange={e => setLogoForm({ ...logoForm, nombre: e.target.value })}
              placeholder="Ej: Logo UNMSM" className="form-input" />
          </div>
          <ImageUpload label="Imagen del Logo *" value={logoForm.imagenLogo}
            onChange={base64 => setLogoForm({ ...logoForm, imagenLogo: base64 })} />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="activoLogo" checked={logoForm.activo ?? true}
              onChange={e => setLogoForm({ ...logoForm, activo: e.target.checked })} className="rounded" />
            <label htmlFor="activoLogo" className="text-sm text-gray-700">Activo</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={savingLogo || !logoForm.imagenLogo} className="modal-btn-primary">
              {savingLogo ? 'Guardando...' : editingLogoId ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={() => setLogoModal(false)} className="modal-btn-cancel">Cancelar</button>
          </div>
        </form>
      </Modal>

      {/* ═══ MODAL: FIRMA ═══ */}
      <Modal isOpen={firmaModal} onClose={() => setFirmaModal(false)} title={editingFirmaId ? 'Editar Firma' : 'Nueva Firma'} size="sm">
        <form onSubmit={guardarFirma} className="space-y-4">
          <div>
            <label className="form-label">Nombre de la Autoridad *</label>
            <input value={firmaForm.nombreAutoridad} onChange={e => setFirmaForm({ ...firmaForm, nombreAutoridad: e.target.value })}
              placeholder="Ej: Dr. Juan Pérez García" required className="form-input" />
          </div>
          <div>
            <label className="form-label">Cargo *</label>
            <input value={firmaForm.cargo} onChange={e => setFirmaForm({ ...firmaForm, cargo: e.target.value })}
              placeholder="Ej: Director de Posgrado" required className="form-input" />
          </div>
          <ImageUpload label="Imagen de la Firma *" value={firmaForm.imagenFirma}
            onChange={base64 => setFirmaForm({ ...firmaForm, imagenFirma: base64 })}
            accept="image/png,image/jpeg,image/webp" />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="activoFirma" checked={firmaForm.activo ?? true}
              onChange={e => setFirmaForm({ ...firmaForm, activo: e.target.checked })} className="rounded" />
            <label htmlFor="activoFirma" className="text-sm text-gray-700">Activo</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={savingFirma || !firmaForm.imagenFirma} className="modal-btn-primary">
              {savingFirma ? 'Guardando...' : editingFirmaId ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={() => setFirmaModal(false)} className="modal-btn-cancel">Cancelar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
