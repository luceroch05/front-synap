import { useState, useEffect } from 'react';
import { Search, Award, Copy, Ban, CheckCircle, Eye, ExternalLink, Trash2, AlertTriangle } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { CertificadosService, Certificado } from '@/lib/services/certificados.service';
import { API_URL } from '@/lib/api-config';

const estadoColor = (nombre?: string) => {
  switch (nombre?.toUpperCase()) {
    case 'EMITIDO':   return 'bg-green-100 text-green-700';
    case 'ANULADO':   return 'bg-red-100 text-red-700';
    case 'PENDIENTE': return 'bg-yellow-100 text-yellow-700';
    default:          return 'bg-gray-100 text-gray-600';
  }
};

export default function CertificadosPage() {
  const [certificados, setCertificados]   = useState<Certificado[]>([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [copiedId, setCopiedId]           = useState<number | null>(null);
  const [modalAnular, setModalAnular]     = useState<Certificado | null>(null);
  const [modalEliminar, setModalEliminar] = useState<Certificado | null>(null);
  const [modalVisor, setModalVisor]       = useState<Certificado | null>(null);
  const [motivo, setMotivo]               = useState('');
  const [saving, setSaving]               = useState(false);
  const [eliminando, setEliminando]       = useState(false);
  const [error, setError]                 = useState('');

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
    if (!modalAnular || !motivo.trim()) return;
    setSaving(true);
    try {
      await CertificadosService.anular(modalAnular.id, motivo);
      setModalAnular(null);
      setMotivo('');
      await cargar();
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  const eliminar = async () => {
    if (!modalEliminar) return;
    setEliminando(true);
    try {
      await CertificadosService.remove(modalEliminar.id);
      setModalEliminar(null);
      await cargar();
    } catch (e: any) { setError(e.message); } finally { setEliminando(false); }
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

  const fmtDate = (d: string) => {
    if (!d) return '—';
    const [y, m, day] = d.split('T')[0].split('-').map(Number);
    return new Date(y, m - 1, day).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const pdfUrl = (cert: Certificado) => cert.url ? `${API_URL}${cert.url}` : null;

  const totalEmitidos  = certificados.filter(c => c.estado?.nombre?.toUpperCase() === 'EMITIDO').length;
  const totalPendiente = certificados.filter(c => c.estado?.nombre?.toUpperCase() === 'PENDIENTE').length;
  const totalAnulados  = certificados.filter(c => c.estado?.nombre?.toUpperCase() === 'ANULADO').length;

  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <h1 className="page-title">Certificados</h1>
          <p className="page-subtitle">{certificados.length} certificados registrados</p>
        </div>
        <span className="text-sm bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1.5 rounded-lg">
          Los certificados se generan desde el detalle del grupo
        </span>
      </div>

      <div className="page-body">
        {error && (
          <div className="error-bar">
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-bold text-lg leading-none">×</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="table-card p-5" style={{ borderTop: '3px solid #F7941D' }}>
            <div className="text-2xl font-bold text-[#F7941D]">{totalEmitidos}</div>
            <div className="text-sm text-gray-500 mt-1">Emitidos</div>
          </div>
          <div className="table-card p-5" style={{ borderTop: '3px solid #7C3AED' }}>
            <div className="text-2xl font-bold text-purple-600">{totalPendiente}</div>
            <div className="text-sm text-gray-500 mt-1">Pendientes</div>
          </div>
          <div className="table-card p-5" style={{ borderTop: '3px solid #EF4444' }}>
            <div className="text-2xl font-bold text-red-600">{totalAnulados}</div>
            <div className="text-sm text-gray-500 mt-1">Anulados</div>
          </div>
        </div>

        <div className="search-wrap">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por código, participante o programa..."
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
              <Award size={40} className="text-gray-200" />
              <p className="text-sm text-gray-400">No hay certificados aún</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ borderBottom: '1px solid #F0F2F5' }}>
                  <tr style={{ backgroundColor: '#FAFAFA' }}>
                    {['Código Único', 'Participante', 'Programa', 'Fecha Emisión', 'Estado', ''].map(h => (
                      <th key={h} className="table-header">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map(cert => {
                    const participante = cert.inscripcion?.participante;
                    const est = cert.estado?.nombre || '';
                    const url = pdfUrl(cert);
                    const esAnulado = est.toUpperCase() === 'ANULADO';
                    return (
                      <tr key={cert.id} className="table-row">
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-medium text-gray-900">{cert.codigoUnico}</span>
                            <button
                              onClick={() => copiarCodigo(cert)}
                              className="p-1 text-gray-400 hover:text-[#F7941D] transition-colors"
                              title="Copiar código"
                            >
                              {copiedId === cert.id
                                ? <CheckCircle size={14} className="text-emerald-500" />
                                : <Copy size={14} />}
                            </button>
                          </div>
                        </td>
                        <td className="table-cell">
                          {participante ? (
                            <div>
                              <div className="font-medium text-gray-900 text-sm">{participante.nombres} {participante.apellidos}</div>
                              <div className="text-xs text-gray-400">{participante.tipoDocumento}: {participante.numeroDocumento}</div>
                            </div>
                          ) : '—'}
                        </td>
                        <td className="table-cell text-sm text-gray-700">{cert.inscripcion?.grupo?.programa?.nombre || '—'}</td>
                        <td className="table-cell text-sm text-gray-600 whitespace-nowrap">{fmtDate(cert.fechaEmision)}</td>
                        <td className="table-cell">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${estadoColor(est)}`}>
                            {est || '—'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center justify-end gap-1">
                            {url && (
                              <>
                                <button
                                  onClick={() => setModalVisor(cert)}
                                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-gray-500 hover:text-[#F7941D] hover:bg-orange-50 rounded-lg font-medium transition-colors"
                                >
                                  <Eye size={13} /> Ver
                                </button>
                                <a
                                  href={url} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                                  title="Abrir en nueva pestaña"
                                >
                                  <ExternalLink size={13} />
                                </a>
                              </>
                            )}
                            {!esAnulado && (
                              <button
                                onClick={() => { setModalAnular(cert); setMotivo(''); }}
                                className="flex items-center gap-1 px-2.5 py-1 text-xs text-orange-600 hover:bg-orange-50 rounded-lg font-medium transition-colors"
                                title="Anular certificado"
                              >
                                <Ban size={13} /> Anular
                              </button>
                            )}
                            <button
                              onClick={() => setModalEliminar(cert)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Eliminar certificado"
                            >
                              <Trash2 size={14} />
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

      {/* Modal visor PDF */}
      <Modal isOpen={!!modalVisor} onClose={() => setModalVisor(null)} title={`Certificado — ${modalVisor?.codigoUnico}`} size="lg">
        {modalVisor && pdfUrl(modalVisor) && (
          <div className="space-y-3">
            <iframe
              src={pdfUrl(modalVisor)!}
              className="w-full rounded-xl border border-gray-200"
              style={{ height: '70vh' }}
              title="Certificado PDF"
            />
            <div className="flex gap-3">
              <a
                href={pdfUrl(modalVisor)!} target="_blank" rel="noopener noreferrer"
                className="flex-1 bg-[#F7941D] hover:bg-[#E8850C] text-white font-semibold py-2.5 px-4 rounded-xl transition-all text-center text-sm"
              >
                Abrir en nueva pestaña / Descargar
              </a>
              <button onClick={() => setModalVisor(null)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm">
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal anular */}
      <Modal isOpen={!!modalAnular} onClose={() => setModalAnular(null)} title="Anular Certificado" size="sm">
        <div className="space-y-4">
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
            <p className="text-xs text-orange-600 mb-1">Certificado</p>
            <p className="font-mono text-sm font-semibold text-gray-800">{modalAnular?.codigoUnico}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {modalAnular?.inscripcion?.participante
                ? `${modalAnular.inscripcion.participante.nombres} ${modalAnular.inscripcion.participante.apellidos}`
                : ''}
            </p>
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <Ban size={14} className="text-orange-500" />
              Motivo de anulación *
            </label>
            <textarea
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-orange-300 focus:border-orange-400 resize-none"
              rows={3}
              placeholder="Indique el motivo de la anulación..."
            />
          </div>
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={anular}
              disabled={saving || !motivo.trim()}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Anulando...
                </>
              ) : (
                <><Ban size={15} /> Confirmar Anulación</>
              )}
            </button>
            <button onClick={() => setModalAnular(null)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal eliminar */}
      <Modal isOpen={!!modalEliminar} onClose={() => setModalEliminar(null)} title="Eliminar Certificado" size="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">Esta acción no se puede deshacer</p>
              <p className="text-sm text-red-700 mt-1">
                Se eliminará permanentemente el certificado{' '}
                <span className="font-mono font-bold">{modalEliminar?.codigoUnico}</span>
                {modalEliminar?.inscripcion?.participante && (
                  <> de <strong>{modalEliminar.inscripcion.participante.nombres} {modalEliminar.inscripcion.participante.apellidos}</strong></>
                )}.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={eliminar}
              disabled={eliminando}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {eliminando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Eliminando...
                </>
              ) : (
                <><Trash2 size={15} /> Eliminar definitivamente</>
              )}
            </button>
            <button
              onClick={() => setModalEliminar(null)}
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
