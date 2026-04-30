import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inscripciones</h1>
          <p className="text-sm text-gray-500 mt-1">{inscripciones.length} inscripciones registradas</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={abrirCrear}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-shadow">
          <Plus className="w-4 h-4" /> Nueva Inscripción
        </motion.button>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error} <button onClick={() => setError('')} className="float-right font-bold">×</button></div>}

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por participante o documento..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
        <select value={filtroEstado} onChange={e => setFiltroEstado(Number(e.target.value))}
          className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
          <option value={0}>Todos los estados</option>
          {estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-gray-500 text-sm">Cargando...</p></div>
        ) : filtrados.length === 0 ? (
          <div className="p-12 text-center"><FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No hay inscripciones. Crea la primera.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['Participante', 'Programa / Grupo', 'Modalidad', 'Estado', 'Fecha', ''].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtrados.map(i => {
                  const est = i.estado?.nombre || '';
                  return (
                    <motion.tr key={i.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{i.participante ? `${i.participante.nombres} ${i.participante.apellidos}` : '—'}</div>
                        <div className="text-xs text-gray-400">{i.participante?.tipoDocumento}: {i.participante?.numeroDocumento}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800 text-sm">{i.grupo?.programa?.nombre || '—'}</div>
                        <div className="text-xs text-gray-500">{i.grupo?.nombreGrupo}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{i.grupo?.modalidad || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${estadoColors[est] || 'bg-gray-100 text-gray-600'}`}>{est || '—'}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{fmtDate(i.fechaInscripcion)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setModalEstado(i); setNuevoEstadoId(i.estadoId); }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Cambiar estado">
                            <ClipboardList className="w-4 h-4" />
                          </button>
                          {i.grupo?.id && (
                            <button onClick={() => navigate(`/dashboard/grupos/${i.grupo!.id}/notas`)}
                              className="px-2.5 py-1 text-xs text-purple-600 hover:bg-purple-50 rounded-lg font-medium" title="Ver notas">
                              Notas
                            </button>
                          )}
                          <button onClick={() => eliminar(i.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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

      {/* Modal nueva inscripción */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Inscripción">
        <form onSubmit={guardar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Participante *</label>
            <select value={form.participanteId} onChange={e => setForm({ ...form, participanteId: Number(e.target.value) })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required>
              <option value={0} disabled>Seleccionar participante...</option>
              {participantes.map(p => <option key={p.id} value={p.id}>{p.nombres} {p.apellidos} — {p.numeroDocumento}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grupo *</label>
            <select value={form.grupoId} onChange={e => setForm({ ...form, grupoId: Number(e.target.value) })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required>
              <option value={0} disabled>Seleccionar grupo...</option>
              {grupos.map(g => <option key={g.id} value={g.id}>{g.programa?.nombre} — {g.nombreGrupo}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
            <select value={form.estadoId} onChange={e => setForm({ ...form, estadoId: Number(e.target.value) })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required>
              <option value={0} disabled>Seleccionar estado...</option>
              {estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inscripción *</label>
            <input type="date" value={form.fechaInscripcion} onChange={e => setForm({ ...form, fechaInscripcion: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50">
              {saving ? 'Guardando...' : 'Inscribir'}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">Cancelar</button>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Nuevo Estado</label>
            <select value={nuevoEstadoId} onChange={e => setNuevoEstadoId(Number(e.target.value))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
              {estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={cambiarEstado} disabled={saving} className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50">
              {saving ? 'Guardando...' : 'Actualizar'}
            </button>
            <button onClick={() => setModalEstado(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">Cancelar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
