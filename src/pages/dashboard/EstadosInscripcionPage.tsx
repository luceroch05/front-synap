import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { EstadosInscripcionService, EstadoInscripcion } from '@/lib/services/estados-inscripcion.service';

interface FormData { nombre: string; descripcion: string; }
const emptyForm: FormData = { nombre: '', descripcion: '' };

export default function EstadosInscripcionPage() {
  const [estados, setEstados] = useState<EstadoInscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try { setLoading(true); setEstados(await EstadosInscripcionService.findAll()); }
    catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      editingId ? await EstadosInscripcionService.update(editingId, form) : await EstadosInscripcionService.create(form);
      setModalOpen(false); await cargar();
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar este estado?')) return;
    try { await EstadosInscripcionService.remove(id); await cargar(); } catch (e: any) { setError(e.message); }
  };

  const badgeColors = ['badge-orange', 'badge-green', 'badge-red', 'badge-purple', 'badge-blue'];

  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <h1 className="page-title">Estados de Inscripción</h1>
          <p className="page-subtitle">Configura los posibles estados para las inscripciones</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditingId(null); setModalOpen(true); }}
          className="btn-primary"
        >
          <Plus size={16} /> Nuevo Estado
        </button>
      </div>

      <div className="page-body">
        {error && (
          <div className="error-bar">
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-bold text-lg leading-none">×</button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="spinner" />
            <p className="text-sm text-gray-400">Cargando...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {estados.map((est, idx) => (
              <div
                key={est.id}
                className="table-card p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Tag size={15} className="text-gray-400" />
                    <span className={badgeColors[idx % badgeColors.length]}>{est.nombre}</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setForm({ nombre: est.nombre, descripcion: est.descripcion || '' }); setEditingId(est.id); setModalOpen(true); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-[#F7941D] hover:bg-orange-50 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => eliminar(est.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500">{est.descripcion || 'Sin descripción'}</p>
              </div>
            ))}
            {estados.length === 0 && (
              <div className="col-span-3 table-card flex flex-col items-center justify-center py-16 gap-2">
                <Tag size={40} className="text-gray-200" />
                <p className="text-sm text-gray-400">No hay estados configurados</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Estado' : 'Nuevo Estado'} size="sm">
        <form onSubmit={guardar} className="space-y-4">
          <div>
            <label className="form-label">Nombre *</label>
            <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
              className="form-input" placeholder="Ej: Aprobado, Retirado..." required />
          </div>
          <div>
            <label className="form-label">Descripción</label>
            <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
              className="form-input resize-none" rows={3} placeholder="Descripción del estado..." />
          </div>
          <div className="flex gap-3 pt-1">
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
