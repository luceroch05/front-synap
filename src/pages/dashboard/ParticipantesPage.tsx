import { useState, useEffect } from 'react';
import { Plus, Search, UserCheck, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { ParticipantesService, Participante, CreateParticipanteDto } from '@/lib/services/participantes.service';

const emptyForm: CreateParticipanteDto = { tipoDocumento: 'DNI', numeroDocumento: '', nombres: '', apellidos: '', email: '', telefono: '' };
const TIPOS_DOC = ['DNI', 'Carné de Extranjería', 'Pasaporte', 'RUC'];

export default function ParticipantesPage() {
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateParticipanteDto>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try { setLoading(true); setParticipantes(await ParticipantesService.findAll()); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const abrirCrear = () => { setForm(emptyForm); setEditingId(null); setModalOpen(true); };

  const abrirEditar = (p: Participante) => {
    setForm({ tipoDocumento: p.tipoDocumento, numeroDocumento: p.numeroDocumento, nombres: p.nombres, apellidos: p.apellidos, email: p.email || '', telefono: p.telefono || '' });
    setEditingId(p.id); setModalOpen(true);
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      editingId ? await ParticipantesService.update(editingId, form) : await ParticipantesService.create(form);
      setModalOpen(false); await cargar();
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar este participante?')) return;
    try { await ParticipantesService.remove(id); await cargar(); } catch (e: any) { setError(e.message); }
  };

  const toggleActivo = async (id: number) => {
    try { await ParticipantesService.toggleActive(id); await cargar(); } catch (e: any) { setError(e.message); }
  };

  const filtrados = participantes.filter(p => {
    const q = search.toLowerCase();
    return p.nombres.toLowerCase().includes(q) || p.apellidos.toLowerCase().includes(q) || p.numeroDocumento.includes(q) || (p.email || '').toLowerCase().includes(q);
  });

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
                        <div className="text-xs text-gray-400">{p.tipoDocumento}</div>
                        <div className="font-medium text-gray-900">{p.numeroDocumento}</div>
                      </td>
                      <td className="table-cell font-medium text-gray-900">{p.nombres}</td>
                      <td className="table-cell text-gray-700">{p.apellidos}</td>
                      <td className="table-cell text-sm text-gray-500">{p.email || '—'}</td>
                      <td className="table-cell text-sm text-gray-500">{p.telefono || '—'}</td>
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
                          <button onClick={() => abrirEditar(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#F7941D] hover:bg-orange-50 transition-colors">
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Participante' : 'Nuevo Participante'}>
        <form onSubmit={guardar} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Tipo de Documento *</label>
              <select value={form.tipoDocumento} onChange={e => setForm({ ...form, tipoDocumento: e.target.value })}
                className="form-input">
                {TIPOS_DOC.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">N° Documento *</label>
              <input value={form.numeroDocumento} onChange={e => setForm({ ...form, numeroDocumento: e.target.value })}
                className="form-input" placeholder="12345678" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Nombres *</label>
              <input value={form.nombres} onChange={e => setForm({ ...form, nombres: e.target.value })}
                className="form-input" placeholder="Juan Carlos" required />
            </div>
            <div>
              <label className="form-label">Apellidos *</label>
              <input value={form.apellidos} onChange={e => setForm({ ...form, apellidos: e.target.value })}
                className="form-input" placeholder="García López" required />
            </div>
          </div>
          <div>
            <label className="form-label">Correo Electrónico</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="form-input" placeholder="correo@ejemplo.com" />
          </div>
          <div>
            <label className="form-label">Teléfono</label>
            <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })}
              className="form-input" placeholder="987654321" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="modal-btn-primary">
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="modal-btn-cancel">Cancelar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
