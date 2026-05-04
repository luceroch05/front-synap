import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, MapPin, ClipboardList, Plus, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { GruposProgramasService, GrupoProgramas } from '@/lib/services/grupos-programas.service';
import { InscripcionesService, Inscripcion, CreateInscripcionDto } from '@/lib/services/inscripciones.service';
import { ParticipantesService, Participante } from '@/lib/services/participantes.service';
import { EstadosInscripcionService, EstadoInscripcion } from '@/lib/services/estados-inscripcion.service';
import { CertificadosService } from '@/lib/services/certificados.service';

const estadoColors: Record<string, string> = {
  Inscrito: 'bg-blue-100 text-blue-700 border-blue-200',
  Aprobado: 'bg-green-100 text-green-700 border-green-200',
  Retirado: 'bg-red-100 text-red-700 border-red-200',
  Egresado: 'bg-purple-100 text-purple-700 border-purple-200',
};

export default function DetalleGrupoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const grupoId = Number(id);

  const [grupo, setGrupo] = useState<GrupoProgramas | null>(null);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [estados, setEstados] = useState<EstadoInscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalInsc, setModalInsc] = useState(false);
  const [modalGenerar, setModalGenerar] = useState(false);
  const [formInsc, setFormInsc] = useState<CreateInscripcionDto>({ participanteId: 0, grupoId, estadoId: 0, fechaInscripcion: new Date().toISOString().split('T')[0] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [generando, setGenerando] = useState(false);
  const [resultadoGen, setResultadoGen] = useState<{ exitosos: number; fallidos: { inscripcionId: number; error: string }[] } | null>(null);
  const [cambiandoEstado, setCambiandoEstado] = useState<number | null>(null);
  const [eliminando, setEliminando] = useState<number | null>(null);

  useEffect(() => { cargar(); }, [grupoId]);

  const cargar = async () => {
    try {
      setLoading(true);
      const [g, insc, part, est] = await Promise.all([
        GruposProgramasService.findOne(grupoId),
        InscripcionesService.findByGrupo(grupoId),
        ParticipantesService.findAll(),
        EstadosInscripcionService.findAll(),
      ]);
      setGrupo(g);
      setInscripciones(insc);
      setParticipantes(part);
      setEstados(est);
      setFormInsc(prev => ({ ...prev, estadoId: est[0]?.id || 0 }));
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const inscribir = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await InscripcionesService.create({ ...formInsc, grupoId });
      setModalInsc(false); await cargar();
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
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
    const idAprobado = estados.find(e => e.nombre === 'APROBADO')?.id;
    const aprobadas = inscripciones.filter(i =>
      i.estado?.nombre === 'APROBADO' || (idAprobado && i.estadoId === idAprobado)
    );
    if (aprobadas.length === 0) { setError('No hay inscripciones aprobadas para generar certificados.'); return; }
    setGenerando(true);
    try {
      const result = await CertificadosService.generarMasivo({
        inscripcionesIds: aprobadas.map(i => i.id),
        programaId: grupo.programaId,
      });
      setResultadoGen({ exitosos: result.exitosos.length, fallidos: result.fallidos });
      setModalGenerar(true);
      await cargar();
    } catch (e: any) { setError(e.message); } finally { setGenerando(false); }
  };

  const fmtDate = (d: string) => { if (!d) return '—'; const [y, m, day] = d.split('T')[0].split('-').map(Number); return new Date(y, m - 1, day).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }); };

  if (loading) return (
    <div className="page-root flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="spinner" />
        <p className="text-sm text-gray-400">Cargando...</p>
      </div>
    </div>
  );

  if (!grupo) return <div className="p-6 text-red-500">Grupo no encontrado.</div>;

  const idAprobado = estados.find(e => e.nombre === 'APROBADO')?.id;
  const aprobadas = inscripciones.filter(i =>
    i.estado?.nombre === 'APROBADO' || (idAprobado && i.estadoId === idAprobado)
  ).length;

  return (
    <div className="page-root">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard/grupos')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="page-title">{grupo.nombreGrupo}</h1>
            <p className="page-subtitle">{grupo.programa?.nombre}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/dashboard/grupos/${grupoId}/notas`)}
            className="btn-secondary"
          >
            <ClipboardList size={16} /> Registrar Notas
          </button>
          <button
            onClick={generarCertificados}
            disabled={generando || aprobadas === 0}
            className="btn-primary disabled:opacity-50"
          >
            {generando ? 'Generando...' : `Generar Certificados (${aprobadas} aprobados)`}
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

        {/* Info del grupo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: MapPin, label: 'Modalidad', value: grupo.modalidad },
            { icon: Calendar, label: 'Fecha Inicio', value: fmtDate(grupo.fechaInicio) },
            { icon: Calendar, label: 'Fecha Fin', value: fmtDate(grupo.fechaFin) },
            { icon: Users, label: 'Inscritos', value: String(inscripciones.length) },
          ].map(info => (
            <div key={info.label} className="table-card p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <info.icon size={14} />
                <span className="text-xs font-semibold uppercase tracking-wider">{info.label}</span>
              </div>
              <p className="font-semibold text-gray-900">{info.value}</p>
            </div>
          ))}
        </div>

        {/* Tabla de inscripciones */}
        <div className="table-card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Participantes inscritos</h2>
            <button
              onClick={() => setModalInsc(true)}
              className="btn-primary text-sm px-3 py-1.5"
            >
              <Plus size={14} /> Inscribir participante
            </button>
          </div>
          {inscripciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Users size={40} className="text-gray-200" />
              <p className="text-sm text-gray-400">No hay participantes inscritos en este grupo</p>
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
                        <td className="table-cell font-medium text-gray-900">{nombre}</td>
                        <td className="table-cell text-sm text-gray-500">{p ? `${p.tipoDocumento}: ${p.numeroDocumento}` : '—'}</td>
                        <td className="table-cell text-sm text-gray-600 whitespace-nowrap">{fmtDate(i.fechaInscripcion)}</td>
                        <td className="table-cell">
                          {cambiando ? (
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#F7941D transparent transparent transparent' }} />
                              <span className="text-xs text-gray-400">Cambiando...</span>
                            </div>
                          ) : (
                            <select
                              value={i.estadoId}
                              onChange={e => cambiarEstado(i.id, Number(e.target.value))}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer outline-none ${estadoColors[estNombre] || 'bg-gray-100 text-gray-600 border-gray-200'}`}
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

      {/* Modal inscribir */}
      <Modal isOpen={modalInsc} onClose={() => setModalInsc(false)} title="Inscribir Participante" size="sm">
        <form onSubmit={inscribir} className="space-y-4">
          <div>
            <label className="form-label">Participante *</label>
            <select value={formInsc.participanteId} onChange={e => setFormInsc({ ...formInsc, participanteId: Number(e.target.value) })}
              className="form-input" required>
              <option value={0} disabled>Seleccionar...</option>
              {participantes.map(p => <option key={p.id} value={p.id}>{p.nombres} {p.apellidos} — {p.numeroDocumento}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Estado inicial</label>
            <select value={formInsc.estadoId} onChange={e => setFormInsc({ ...formInsc, estadoId: Number(e.target.value) })}
              className="form-input">
              {estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Fecha de inscripción</label>
            <input type="date" value={formInsc.fechaInscripcion} onChange={e => setFormInsc({ ...formInsc, fechaInscripcion: e.target.value })}
              className="form-input" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving} className="modal-btn-primary">
              {saving ? 'Guardando...' : 'Inscribir'}
            </button>
            <button type="button" onClick={() => setModalInsc(false)} className="modal-btn-cancel">Cancelar</button>
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
              className="modal-btn-primary w-full"
            >
              {resultadoGen.exitosos > 0 ? 'Ver Certificados' : 'Cerrar'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
