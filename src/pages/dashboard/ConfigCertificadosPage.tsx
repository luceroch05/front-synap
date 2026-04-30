import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    { key: 'configuraciones', label: 'Configuraciones', icon: <Settings className="w-4 h-4" />, count: configs.length },
    { key: 'logos', label: 'Logos', icon: <ImageIcon className="w-4 h-4" />, count: logos.length },
    { key: 'firmas', label: 'Firmas', icon: <PenLine className="w-4 h-4" />, count: firmas.length },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración de Certificados</h1>
        <p className="text-sm text-gray-500 mt-1">Gestiona plantillas, logos y firmas para los certificados</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          {error} <button onClick={() => setError('')} className="float-right font-bold">×</button>
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
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : (
        <>
          {/* ══ TAB: CONFIGURACIONES ══ */}
          {tab === 'configuraciones' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={abrirCrearConfig}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-md text-sm">
                  <Plus className="w-4 h-4" /> Nueva Configuración
                </motion.button>
              </div>

              {configs.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-gray-200">
                  <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hay configuraciones. Primero agrega logos y firmas, luego crea una configuración.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {['Programa', 'Plantilla', 'Firmas', 'Logos', 'Estado', ''].map(h => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {configs.map(c => (
                        <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{c.programa?.nombre || `#${c.programaId}`}</td>
                          <td className="px-6 py-4">
                            {c.plantillaUrl?.startsWith('data:') || c.plantillaUrl?.startsWith('http')
                              ? <img src={c.plantillaUrl} alt="plantilla" className="h-10 w-16 object-cover rounded-lg border border-gray-200" />
                              : <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">Sin plantilla</span>}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{c.firmas?.length || 0} firma(s)</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{c.logos?.length || 0} logo(s)</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${c.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {c.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => toggleConfig(c.id)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">
                                {c.activo ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}
                              </button>
                              <button onClick={() => abrirEditarConfig(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => eliminarConfig(c.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ══ TAB: LOGOS ══ */}
          {tab === 'logos' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={abrirCrearLogo}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-md text-sm">
                  <Plus className="w-4 h-4" /> Nuevo Logo
                </motion.button>
              </div>

              {logos.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-gray-200">
                  <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hay logos. Agrega el primero.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {logos.map(logo => (
                    <motion.div key={logo.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${logo.activo ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
                      <div className="aspect-square bg-gray-50 flex items-center justify-center p-3">
                        {logo.imagenLogo
                          ? <img src={logo.imagenLogo} alt={logo.nombre || 'Logo'} className="max-w-full max-h-full object-contain" />
                          : <ImageIcon className="w-10 h-10 text-gray-300" />}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-gray-800 truncate">{logo.nombre || 'Sin nombre'}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-medium ${logo.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {logo.activo ? 'Activo' : 'Inactivo'}
                        </span>
                        <div className="flex items-center gap-1 mt-2">
                          <button onClick={() => toggleLogo(logo.id)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                            {logo.activo ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>
                          <button onClick={() => abrirEditarLogo(logo)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => eliminarLogo(logo.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ TAB: FIRMAS ══ */}
          {tab === 'firmas' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={abrirCrearFirma}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-md text-sm">
                  <Plus className="w-4 h-4" /> Nueva Firma
                </motion.button>
              </div>

              {firmas.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-gray-200">
                  <PenLine className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hay firmas. Agrega la primera.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {['Firma', 'Autoridad', 'Cargo', 'Estado', ''].map(h => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {firmas.map(firma => (
                        <motion.tr key={firma.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            {firma.imagenFirma
                              ? <img src={firma.imagenFirma} alt={firma.nombreAutoridad} className="h-12 max-w-[120px] object-contain bg-gray-50 rounded-lg border border-gray-100 p-1" />
                              : <div className="h-12 w-24 bg-gray-100 rounded-lg flex items-center justify-center"><PenLine className="w-5 h-5 text-gray-300" /></div>}
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">{firma.nombreAutoridad}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{firma.cargo}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${firma.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {firma.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => toggleFirma(firma.id)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">
                                {firma.activo ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}
                              </button>
                              <button onClick={() => abrirEditarFirma(firma)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => eliminarFirma(firma.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ═══ MODAL: CONFIGURACIÓN ═══ */}
      <Modal isOpen={configModal} onClose={() => setConfigModal(false)} title={editingConfigId ? 'Editar Configuración' : 'Nueva Configuración'} size="lg">
        <form onSubmit={guardarConfig} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Programa *</label>
            <select value={configForm.programaId} onChange={e => setConfigForm({ ...configForm, programaId: Number(e.target.value) })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Firmas (máx. 3)</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Logos (máx. 3)</label>
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
            <button type="submit" disabled={savingConfig || !configForm.plantillaUrl}
              className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50">
              {savingConfig ? 'Guardando...' : editingConfigId ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={() => setConfigModal(false)}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">Cancelar</button>
          </div>
        </form>
      </Modal>

      {/* ═══ MODAL: LOGO ═══ */}
      <Modal isOpen={logoModal} onClose={() => setLogoModal(false)} title={editingLogoId ? 'Editar Logo' : 'Nuevo Logo'} size="sm">
        <form onSubmit={guardarLogo} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre (opcional)</label>
            <input value={logoForm.nombre || ''} onChange={e => setLogoForm({ ...logoForm, nombre: e.target.value })}
              placeholder="Ej: Logo UNMSM"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <ImageUpload label="Imagen del Logo *" value={logoForm.imagenLogo}
            onChange={base64 => setLogoForm({ ...logoForm, imagenLogo: base64 })} />
          <div className="flex items-center gap-2">
            <input type="checkbox" id="activoLogo" checked={logoForm.activo ?? true}
              onChange={e => setLogoForm({ ...logoForm, activo: e.target.checked })} className="rounded" />
            <label htmlFor="activoLogo" className="text-sm text-gray-700">Activo</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={savingLogo || !logoForm.imagenLogo}
              className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50">
              {savingLogo ? 'Guardando...' : editingLogoId ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={() => setLogoModal(false)}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">Cancelar</button>
          </div>
        </form>
      </Modal>

      {/* ═══ MODAL: FIRMA ═══ */}
      <Modal isOpen={firmaModal} onClose={() => setFirmaModal(false)} title={editingFirmaId ? 'Editar Firma' : 'Nueva Firma'} size="sm">
        <form onSubmit={guardarFirma} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Autoridad *</label>
            <input value={firmaForm.nombreAutoridad} onChange={e => setFirmaForm({ ...firmaForm, nombreAutoridad: e.target.value })}
              placeholder="Ej: Dr. Juan Pérez García" required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo *</label>
            <input value={firmaForm.cargo} onChange={e => setFirmaForm({ ...firmaForm, cargo: e.target.value })}
              placeholder="Ej: Director de Posgrado" required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
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
            <button type="submit" disabled={savingFirma || !firmaForm.imagenFirma}
              className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50">
              {savingFirma ? 'Guardando...' : editingFirmaId ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={() => setFirmaModal(false)}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">Cancelar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
