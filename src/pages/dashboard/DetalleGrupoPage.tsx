import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Users, Calendar, MapPin, ClipboardList, Plus, Trash2,
  CheckCircle, Briefcase, Laptop, RefreshCw, User, FileText, Eye
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Combobox from '@/components/ui/Combobox';
import { GruposProgramasService, GrupoProgramas } from '@/lib/services/grupos-programas.service';
import { InscripcionesService, Inscripcion, CreateInscripcionDto } from '@/lib/services/inscripciones.service';
import { ParticipantesService, Participante } from '@/lib/services/participantes.service';
import { EstadosInscripcionService, EstadoInscripcion } from '@/lib/services/estados-inscripcion.service';
import { CertificadosService, EstadoCertificado } from '@/lib/services/certificados.service';

const esAprobado = (nombre?: string) => nombre?.toUpperCase() === 'APROBADO';

const estadoColor = (nombre?: string) => {
  switch (nombre?.toUpperCase()) {
    case 'APROBADO':  return 'bg-green-100 text-green-700 border-green-200';
    case 'RETIRADO':  return 'bg-red-100 text-red-700 border-red-200';
    case 'EGRESADO':  return 'bg-purple-100 text-purple-700 border-purple-200';
    default:          return 'bg-blue-100 text-blue-700 border-blue-200';
  }
};

const modalidadIcon: Record<string, React.ReactNode> = {
  PRESENCIAL: <Briefcase size={14} />,
  VIRTUAL:    <Laptop size={14} />,
  MIXTA:      <RefreshCw size={14} />,
};

export default function DetalleGrupoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const grupoId = Number(id);

  const [grupo, setGrupo]               = useState<GrupoProgramas | null>(null);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [estados, setEstados]           = useState<EstadoInscripcion[]>([]);
  const [estadosCert, setEstadosCert]   = useState<EstadoCertificado[]>([]);
  const [loading, setLoading]           = useState(true);
  const [modalInsc, setModalInsc]       = useState(false);
  const [modalGenerar, setModalGenerar] = useState(false);
  const [formInsc, setFormInsc]         = useState<CreateInscripcionDto>({
    participanteId: 0, grupoId, estadoId: 0,
    fechaInscripcion: new Date().toISOString().split('T')[0],
  });
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState('');
  const [generando, setGenerando]       = useState(false);
  const [resultadoGen, setResultadoGen] = useState<{ exitosos: number; fallidos: { inscripcionId: number; error: string }[] } | null>(null);
  const [cambiandoEstado, setCambiandoEstado] = useState<number | null>(null);
  const [eliminando, setEliminando]     = useState<number | null>(null);

  useEffect(() => { cargar(); }, [grupoId]);

  const cargar = async () => {
    try {
      setLoading(true);
      const [g, insc, part, est, estCert] = await Promise.all([
        GruposProgramasService.findOne(grupoId),
        InscripcionesService.findByGrupo(grupoId),
        ParticipantesService.findAll(),
        EstadosInscripcionService.findAll(),
        CertificadosService.findEstados(),
      ]);
      setGrupo(g);
      setInscripciones(insc);
      setParticipantes(part);
      setEstados(est);
      setEstadosCert(estCert);
      setFormInsc(prev => ({ ...prev, estadoId: est[0]?.id || 0 }));
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const inscribir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInsc.participanteId) return;
    setSaving(true);
    try {
      await InscripcionesService.create({ ...formInsc, grupoId });
      setModalInsc(false);
      await cargar();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const cambiarEstado = async (inscripcionId: number, estadoId: number) => {
    setCambiandoEstado(inscripcionId);
    try {
      await InscripcionesService.changeEstado(inscripcionId, estadoId);
      await cargar();
    } catch (e: any) { setError(e.message); }
    finally { setCambiandoEstado(null); }
  };

  const eliminarInscripcion = async (inscripcionId: number, nombre: string) => {
    if (!confirm(`¿Eliminar la inscripción de ${nombre}?`)) return;
    setEliminando(inscripcionId);
    try {
      await InscripcionesService.remove(inscripcionId);
      await cargar();
    } catch (e: any) { setError(e.message); }
    finally { setEliminando(null); }
  };

  const generarCertificados = async () => {
    if (!grupo) return;
    const aprobadas = inscripciones.filter(i => esAprobado(i.estado?.nombre));
    if (aprobadas.length === 0) { setError('No hay inscripciones aprobadas para generar certificados.'); return; }
    const estadoEmitido = estadosCert.find(e => e.nombre.toUpperCase() === 'EMITIDO');
    setGenerando(true);
    try {
      const result = await CertificadosService.generarMasivo({
        inscripcionesIds: aprobadas.map(i => i.id),
        programaId: grupo.programaId,
        ...(estadoEmitido && { estadoId: estadoEmitido.id }),
      });
      setResultadoGen({ exitosos: result.exitosos.length, fallidos: result.fallidos });
      setModalGenerar(true);
      await cargar();
    } catch (e: any) { setError(e.message); }
    finally { setGenerando(false); }
  };

  const fmtDate = (d: string) => {
    if (!d) return '—';
    const [y, m, day] = d.split('T')[0].split('-').map(Number);
    return new Date(y, m - 1, day).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) return (
    <div className="page-root flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="spinner" />
        <p className="text-sm text-gray-400">Cargando...</p>
      </div>
    </div>
  );

  if (!grupo) return <div className="p-6 text-red-500">Grupo no encontrado.</div>;

  const aprobadas = inscripciones.filter(i => esAprobado(i.estado?.nombre)).length;

  const yaInscritos = inscripciones.map(i => i.participanteId);
  const participanteSeleccionado = participantes.find(p => p.id === formInsc.participanteId);
  const estadoSeleccionado = estados.find(e => e.id === formInsc.estadoId);

  return (
    <div className="page-root">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/grupos')}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="page-title">{grupo.nombreGrupo}</h1>
            <p className="page-subtitle">{grupo.programa?.nombre}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate(`/dashboard/grupos/${grupoId}/notas`)} className="btn-secondary">
            <ClipboardList size={16} /> Registrar Notas
          </button>
          <button
            onClick={generarCertificados}
            disabled={generando || aprobadas === 0}
            className="btn-primary disabled:opacity-50"
          >
            {generando ? 'Generando...' : `Generar Certificados (${aprobadas})`}
          </button>
        </div>
      </div>

      <div className="page-body">
        {error && (
          <div className="error-bar">
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-bold text-lg leading-none">×</button>
          </div>
        )}

        {/* Info cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="table-card p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <MapPin size={14} />
              <span className="text-xs font-semibold uppercase tracking-wider">Modalidad</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">{modalidadIcon[grupo.modalidad]}</span>
              <span className="font-semibold text-gray-900">{grupo.modalidad}</span>
            </div>
          </div>
          <div className="table-card p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Calendar size={14} />
              <span className="text-xs font-semibold uppercase tracking-wider">Inicio</span>
            </div>
            <p className="font-semibold text-gray-900">{fmtDate(grupo.fechaInicio)}</p>
          </div>
          <div className="table-card p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Calendar size={14} />
              <span className="text-xs font-semibold uppercase tracking-wider">Fin</span>
            </div>
            <p className="font-semibold text-gray-900">{fmtDate(grupo.fechaFin)}</p>
          </div>
          <div className="table-card p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Users size={14} />
              <span className="text-xs font-semibold uppercase tracking-wider">Inscritos</span>
            </div>
            <p className="font-semibold text-gray-900">{inscripciones.length}</p>
          </div>
        </div>

        {/* Tabla de inscripciones */}
        <div className="table-card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="font-semibold text-gray-900">Participantes inscritos</h2>
              {aprobadas > 0 && (
                <p className="text-xs text-green-600 mt-0.5">{aprobadas} aprobado{aprobadas > 1 ? 's' : ''}</p>
              )}
            </div>
            <button onClick={() => setModalInsc(true)} className="btn-primary text-sm px-3 py-1.5">
              <Plus size={14} /> Inscribir participante
            </button>
          </div>

          {inscripciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Users size={40} className="text-gray-200" />
              <p className="text-sm text-gray-400">No hay participantes inscritos en este grupo</p>
              <button onClick={() => setModalInsc(true)} className="mt-2 text-sm text-[#E8B84B] hover:underline">
                Inscribir el primero
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ borderBottom: '1px solid #F0F2F5' }}>
                  <tr style={{ backgroundColor: '#FAFAFA' }}>
                    {['#', 'Participante', 'Documento', 'Fecha Inscripción', 'Estado', ''].map(h => (
                      <th key={h} className="table-header">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inscripciones.map((i, idx) => {
                    const p = i.participante;
                    const nombre = p ? `${p.nombres} ${p.apellidos}` : `Inscripción #${i.id}`;
                    const estNombre = i.estado?.nombre || '';
                    const cambiando = cambiandoEstado === i.id;
                    return (
                      <tr key={i.id} className="table-row">
                        <td className="table-cell text-gray-400 text-sm">{idx + 1}</td>
                        <td className="table-cell">
                          <div className="font-medium text-gray-900">{nombre}</div>
                          {p?.email && <div className="text-xs text-gray-400">{p.email}</div>}
                        </td>
                        <td className="table-cell text-sm text-gray-500">
                          {p ? `${p.tipoDocumento}: ${p.numeroDocumento}` : '—'}
                        </td>
                        <td className="table-cell text-sm text-gray-600 whitespace-nowrap">
                          {fmtDate(i.fechaInscripcion)}
                        </td>
                        <td className="table-cell">
                          {cambiando ? (
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin border-[#E8B84B]" />
                              <span className="text-xs text-gray-400">Actualizando...</span>
                            </div>
                          ) : (
                            <select
                              value={i.estadoId}
                              onChange={e => cambiarEstado(i.id, Number(e.target.value))}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer outline-none ${estadoColor(estNombre)}`}
                            >
                              {estados.map(est => (
                                <option key={est.id} value={est.id}>{est.nombre}</option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="table-cell">
                          <button
                            onClick={() => eliminarInscripcion(i.id, nombre)}
                            disabled={eliminando === i.id}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                            title="Eliminar inscripción"
                          >
                            {eliminando === i.id
                              ? <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin block" />
                              : <Trash2 size={15} />
                            }
                          </button>
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

      {/* Modal inscribir participante */}
      <Modal isOpen={modalInsc} onClose={() => setModalInsc(false)} title="Inscribir Participante" size="md">
        <form onSubmit={inscribir} className="space-y-5">

          {/* Participante - Combobox */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <User size={16} className="text-[#E8B84B]" />
              Participante *
            </label>
            <Combobox
              options={participantes
                .filter(p => !yaInscritos.includes(p.id))
                .map(p => ({
                  id: p.id,
                  label: `${p.nombres} ${p.apellidos}`,
                  sublabel: `${p.tipoDocumento}: ${p.numeroDocumento}`,
                }))}
              value={formInsc.participanteId}
              onChange={id => setFormInsc({ ...formInsc, participanteId: id })}
              placeholder="Buscar por nombre o documento..."
            />
            {participantes.filter(p => !yaInscritos.includes(p.id)).length === 0 && (
              <p className="text-xs text-amber-600 mt-1">Todos los participantes ya están inscritos en este grupo.</p>
            )}
          </div>

          {/* Estado - Cards */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <ClipboardList size={16} className="text-[#E8B84B]" />
              Estado inicial *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {estados.map(est => {
                const selected = formInsc.estadoId === est.id;
                return (
                  <button
                    key={est.id}
                    type="button"
                    onClick={() => setFormInsc({ ...formInsc, estadoId: est.id })}
                    className={`py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      selected
                        ? 'border-[#E8B84B] bg-orange-50 text-[#E8B84B] shadow-sm scale-[0.98]'
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

          {/* Fecha */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <Calendar size={16} className="text-[#E8B84B]" />
              Fecha de inscripción *
            </label>
            <input
              type="date"
              value={formInsc.fechaInscripcion}
              onChange={e => setFormInsc({ ...formInsc, fechaInscripcion: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#E8B84B]/20 focus:border-[#E8B84B]"
            />
          </div>

          {/* Vista previa */}
          {formInsc.participanteId !== 0 && formInsc.estadoId !== 0 && (
            <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
              <div className="flex items-center gap-2 text-xs font-medium text-orange-600 mb-2">
                <Eye size={12} />
                Vista previa
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 bg-white rounded-lg shadow-sm flex items-center gap-1">
                  <User size={10} className="text-[#E8B84B]" />
                  {participanteSeleccionado
                    ? `${participanteSeleccionado.nombres} ${participanteSeleccionado.apellidos}`
                    : '—'}
                </span>
                <span className="px-2 py-1 bg-white rounded-lg shadow-sm flex items-center gap-1">
                  <FileText size={10} className="text-[#E8B84B]" />
                  {participanteSeleccionado?.tipoDocumento}: {participanteSeleccionado?.numeroDocumento}
                </span>
                <span className="px-2 py-1 bg-white rounded-lg shadow-sm flex items-center gap-1">
                  <ClipboardList size={10} className="text-[#E8B84B]" />
                  {estadoSeleccionado?.nombre}
                </span>
                <span className="px-2 py-1 bg-white rounded-lg shadow-sm flex items-center gap-1">
                  <Calendar size={10} className="text-[#E8B84B]" />
                  {fmtDate(formInsc.fechaInscripcion)}
                </span>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving || !formInsc.participanteId}
              className="flex-1 bg-[#E8B84B] hover:bg-[#D4A017] text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Inscribiendo...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Inscribir participante
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setModalInsc(false)}
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal resultado generación */}
      <Modal isOpen={modalGenerar} onClose={() => setModalGenerar(false)} title="Resultado de Generación" size="sm">
        {resultadoGen && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-green-50 rounded-xl">
                <div className="text-3xl font-bold text-green-600">{resultadoGen.exitosos}</div>
                <div className="text-sm text-gray-600 mt-1">Generados</div>
              </div>
              <div className="p-4 bg-red-50 rounded-xl">
                <div className="text-3xl font-bold text-red-600">{resultadoGen.fallidos.length}</div>
                <div className="text-sm text-gray-600 mt-1">Con errores</div>
              </div>
            </div>
            {resultadoGen.fallidos.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Detalle de errores:</p>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {resultadoGen.fallidos.map(f => (
                    <div key={f.inscripcionId} className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                      <span className="font-medium">Inscripción #{f.inscripcionId}:</span> {f.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={() => { setModalGenerar(false); if (resultadoGen.exitosos > 0) navigate('/dashboard/certificados'); }}
              className="w-full bg-[#E8B84B] hover:bg-[#D4A017] text-white font-semibold py-2.5 px-4 rounded-xl transition-all"
            >
              {resultadoGen.exitosos > 0 ? 'Ver Certificados' : 'Cerrar'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
