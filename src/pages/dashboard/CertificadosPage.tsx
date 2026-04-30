import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Award, Copy, Ban, CheckCircle, Eye, ExternalLink } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { CertificadosService, Certificado } from '@/lib/services/certificados.service';
import { API_URL } from '@/lib/api-config';

const estadoColors: Record<string, string> = {
  Emitido: 'bg-green-100 text-green-700',
  Anulado: 'bg-red-100 text-red-700',
  Pendiente: 'bg-yellow-100 text-yellow-700',
};

export default function CertificadosPage() {
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [modalAnular, setModalAnular] = useState<Certificado | null>(null);
  const [modalVisor, setModalVisor] = useState<Certificado | null>(null);
  const [motivo, setMotivo] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try { setLoading(true); setCertificados(await CertificadosService.findAll()); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const copiarCodigo = (cert: Certificado) => {
    navigator.clipboard.writeText(cert.codigoUnico);
    setCopiedId(cert.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const anular = async () => {
    if (!modalAnular) return;
    setSaving(true);
    try {
      await CertificadosService.anular(modalAnular.id, motivo);
      setModalAnular(null);
      setMotivo('');
      await cargar();
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  const filtrados = certificados.filter(c => {
    const q = search.toLowerCase();
    const participante = c.inscripcion?.participante;
    return (
      c.codigoUnico.toLowerCase().includes(q) ||
      (participante ? `${participante.nombres} ${participante.apellidos}`.toLowerCase().includes(q) : false) ||
      (c.inscripcion?.grupo?.programa?.nombre || '').toLowerCase().includes(q)
    );
  });

  const fmtDate = (d: string) => { if (!d) return '—'; const [y, m, day] = d.split('T')[0].split('-').map(Number); return new Date(y, m - 1, day).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }); };

  const pdfUrl = (cert: Certificado) => cert.url ? `${API_URL}${cert.url}` : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificados</h1>
          <p className="text-sm text-gray-500 mt-1">{certificados.length} certificados registrados</p>
        </div>
        <span className="text-sm text-gray-500 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
          Los certificados se generan desde el detalle del grupo
        </span>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error} <button onClick={() => setError('')} className="float-right font-bold">×</button></div>}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Emitidos', count: certificados.filter(c => c.estado?.nombre === 'Emitido').length, color: 'text-green-600 bg-green-50' },
          { label: 'Pendientes', count: certificados.filter(c => c.estado?.nombre === 'Pendiente').length, color: 'text-yellow-600 bg-yellow-50' },
          { label: 'Anulados', count: certificados.filter(c => c.estado?.nombre === 'Anulado').length, color: 'text-red-600 bg-red-50' },
        ].map(s => (
          <div key={s.label} className={`p-4 rounded-xl border ${s.color.split(' ')[1]} border-current/20`}>
            <div className={`text-2xl font-bold ${s.color.split(' ')[0]}`}>{s.count}</div>
            <div className="text-sm text-gray-600 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por código, participante o programa..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-gray-500 text-sm">Cargando...</p></div>
        ) : filtrados.length === 0 ? (
          <div className="p-12 text-center"><Award className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No hay certificados aún.</p><p className="text-sm text-gray-400 mt-1">Genera certificados desde el detalle de un grupo.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['Código Único', 'Participante', 'Programa', 'Fecha Emisión', 'Estado', ''].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtrados.map(cert => {
                  const participante = cert.inscripcion?.participante;
                  const est = cert.estado?.nombre || '';
                  const url = pdfUrl(cert);
                  return (
                    <motion.tr key={cert.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium text-gray-900">{cert.codigoUnico}</span>
                          <button onClick={() => copiarCodigo(cert)} className="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="Copiar código">
                            {copiedId === cert.id ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {participante ? (
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{participante.nombres} {participante.apellidos}</div>
                            <div className="text-xs text-gray-400">{participante.tipoDocumento}: {participante.numeroDocumento}</div>
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{cert.inscripcion?.grupo?.programa?.nombre || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{fmtDate(cert.fechaEmision)}</td>
                      <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${estadoColors[est] || 'bg-gray-100 text-gray-600'}`}>{est || '—'}</span></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {url && (
                            <>
                              <button onClick={() => setModalVisor(cert)}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors">
                                <Eye className="w-3.5 h-3.5" /> Ver
                              </button>
                              <a href={url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors" title="Abrir en nueva pestaña">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </>
                          )}
                          {est !== 'Anulado' && (
                            <button onClick={() => { setModalAnular(cert); setMotivo(''); }}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors">
                              <Ban className="w-3.5 h-3.5" /> Anular
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal visor PDF */}
      <Modal isOpen={!!modalVisor} onClose={() => setModalVisor(null)}
        title={`Certificado — ${modalVisor?.codigoUnico}`} size="lg">
        {modalVisor && pdfUrl(modalVisor) && (
          <div className="space-y-3">
            <iframe
              src={pdfUrl(modalVisor)!}
              className="w-full rounded-xl border border-gray-200"
              style={{ height: '70vh' }}
              title="Certificado PDF"
            />
            <div className="flex gap-3">
              <a href={pdfUrl(modalVisor)!} target="_blank" rel="noopener noreferrer"
                className="flex-1 py-2.5 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity">
                Abrir en nueva pestaña / Descargar
              </a>
              <button onClick={() => setModalVisor(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal anular */}
      <Modal isOpen={!!modalAnular} onClose={() => setModalAnular(null)} title="Anular Certificado" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Certificado: <strong className="font-mono">{modalAnular?.codigoUnico}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de anulación *</label>
            <textarea value={motivo} onChange={e => setMotivo(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
              rows={3} placeholder="Indique el motivo..." />
          </div>
          <div className="flex gap-3">
            <button onClick={anular} disabled={saving || !motivo.trim()}
              className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
              {saving ? 'Anulando...' : 'Confirmar Anulación'}
            </button>
            <button onClick={() => setModalAnular(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">Cancelar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
