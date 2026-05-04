import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Trash2, ClipboardList } from 'lucide-react';
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
  Inscrito: 'bg-blue-100 text-blue-700',
  Aprobado: 'bg-green-100 text-green-700',
  Retirado: 'bg-red-100 text-red-700',
  Egresado: 'bg-purple-100 text-purple-700',
};

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
    setForm({ ...emptyForm, participanteId: participantes[0]?.id || 0, grupoId: grupos[0]?.id || 0, estadoId: estados[0]?.id || 0 });
    setModalOpen(true);
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await InscripcionesService.create(form);
      setModalOpen(false); await cargar();
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar esta inscripción?')) return;
    try { await InscripcionesService.remove(id); await cargar(); } catch (e: any) { setError(e.message); }
  };

  const cambiarEstado = async () => {
    if (!modalEstado || !nuevoEstadoId) return;
    setSaving(true);
    try {
      await InscripcionesService.changeEstado(modalEstado.id, nuevoEstadoId);
      setModalEstado(null); await cargar();
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  const filtrados = inscripciones.filter(i => {
    const p = i.participante;
    const q = search.toLowerCase();
    const matchSearch = p ? (p.nombres + ' ' + p.apellidos + ' ' + p.numeroDocumento).toLowerCase().includes(q) : true;
    const matchEstado = filtroEstado === 0 || i.estadoId === filtroEstado;
    return matchSearch && matchEstado;
  });

  const fmtDate = (d: string) => { if (!d) return '—'; const [y, m, day] = d.split('T')[0].split('-').map(Number); return new Date(y, m - 1, day).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }); };

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
                        <td className="table-cell text-sm text-gray-600">{i.grupo?.modalidad || '—'}</td>
                        <td className="table-cell">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${estadoColors[est] || 'bg-gray-100 text-gray-600'}`}>{est || '—'}</span>
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

      {/* Modal nueva inscripción */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Inscripción">
        <form onSubmit={guardar} className="space-y-4">
          <div>
            <label className="form-label">Participante *</label>
            <select value={form.participanteId} onChange={e => setForm({ ...form, participanteId: Number(e.target.value) })}
              className="form-input" required>
              <option value={0} disabled>Seleccionar participante...</option>
              {participantes.map(p => <option key={p.id} value={p.id}>{p.nombres} {p.apellidos} — {p.numeroDocumento}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Grupo *</label>
            <select value={form.grupoId} onChange={e => setForm({ ...form, grupoId: Number(e.target.value) })}
              className="form-input" required>
              <option value={0} disabled>Seleccionar grupo...</option>
              {grupos.map(g => <option key={g.id} value={g.id}>{g.programa?.nombre} — {g.nombreGrupo}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Estado *</label>
            <select value={form.estadoId} onChange={e => setForm({ ...form, estadoId: Number(e.target.value) })}
              className="form-input" required>
              <option value={0} disabled>Seleccionar estado...</option>
              {estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Fecha de Inscripción *</label>
            <input type="date" value={form.fechaInscripcion} onChange={e => setForm({ ...form, fechaInscripcion: e.target.value })}
              className="form-input" required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="modal-btn-primary">
              {saving ? 'Guardando...' : 'Crear'}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="modal-btn-cancel">Cancelar</button>
          </div>
        </form>
      </Modal>

      {/* Modal cambiar estado */}
      <Modal isOpen={!!modalEstado} onClose={() => setModalEstado(null)} title="Cambiar Estado de Inscripción" size="sm">
        <div className="space-y-4">
          {modalEstado?.participante && (
            <p className="text-sm text-gray-600">
              Participante: <strong>{modalEstado.participante.nombres} {modalEstado.participante.apellidos}</strong>
            </p>
          )}
          <div>
            <label className="form-label">Nuevo Estado</label>
            <select value={nuevoEstadoId} onChange={e => setNuevoEstadoId(Number(e.target.value))}
              className="form-input">
              {estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={cambiarEstado} disabled={saving} className="modal-btn-primary">
              {saving ? 'Guardando...' : 'Actualizar'}
            </button>
            <button onClick={() => setModalEstado(null)} className="modal-btn-cancel">Cancelar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
