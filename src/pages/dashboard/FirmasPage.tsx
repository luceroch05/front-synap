import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, PenLine } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import ImageUpload from '@/components/ui/ImageUpload';
import { FirmasService, Firma, CreateFirmaDto } from '@/lib/services/firmas.service';

const emptyForm: CreateFirmaDto = { nombreAutoridad: '', cargo: '', imagenFirma: '', activo: true };

export default function FirmasPage() {
  const [firmas, setFirmas] = useState<Firma[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateFirmaDto>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      setFirmas(await FirmasService.findAll());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const abrirCrear = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setModalOpen(true);
  };

  const abrirEditar = (firma: Firma) => {
    setForm({ nombreAutoridad: firma.nombreAutoridad, cargo: firma.cargo, imagenFirma: firma.imagenFirma, activo: firma.activo });
    setEditingId(firma.id);
    setModalOpen(true);
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombreAutoridad.trim() || !form.cargo.trim()) { setError('Nombre y cargo son obligatorios'); return; }
    if (!form.imagenFirma) { setError('Debe subir la imagen de la firma'); return; }
    setSaving(true);
    try {
      if (editingId) {
        await FirmasService.update(editingId, form);
      } else {
        await FirmasService.create(form);
      }
      setModalOpen(false);
      await cargar();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar esta firma?')) return;
    try {
      await FirmasService.remove(id);
      await cargar();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const toggleActivo = async (id: number) => {
    try {
      await FirmasService.toggleActive(id);
      await cargar();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <h1 className="page-title">Firmas</h1>
          <p className="page-subtitle">Gestiona las firmas de autoridades para los certificados</p>
        </div>
        <button onClick={abrirCrear} className="btn-primary">
          <Plus size={16} /> Nueva Firma
        </button>
      </div>

      <div className="page-body">
        {error && (
          <div className="error-bar">
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-bold text-lg leading-none">×</button>
          </div>
        )}

        <div className="table-card">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="spinner" />
              <p className="text-sm text-gray-400">Cargando...</p>
            </div>
          ) : firmas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <PenLine size={40} className="text-gray-200" />
              <p className="text-sm text-gray-400">No hay firmas registradas</p>
            </div>
          ) : (
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
                        {firma.imagenFirma ? (
                          <img
                            src={firma.imagenFirma}
                            alt={firma.nombreAutoridad}
                            className="h-12 max-w-[120px] object-contain bg-gray-50 rounded-lg border border-gray-100 p-1"
                          />
                        ) : (
                          <div className="h-12 w-24 bg-gray-100 rounded-lg flex items-center justify-center">
                            <PenLine size={18} className="text-gray-300" />
                          </div>
                        )}
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
                          <button onClick={() => toggleActivo(firma.id)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                            {firma.activo
                              ? <ToggleRight size={18} className="text-emerald-500" />
                              : <ToggleLeft size={18} className="text-gray-300" />
                            }
                          </button>
                          <button onClick={() => abrirEditar(firma)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#F7941D] hover:bg-orange-50 transition-colors">
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => eliminar(firma.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Firma' : 'Nueva Firma'} size="sm">
        <form onSubmit={guardar} className="space-y-4">
          <div>
            <label className="form-label">Nombre de la Autoridad *</label>
            <input
              value={form.nombreAutoridad}
              onChange={e => setForm({ ...form, nombreAutoridad: e.target.value })}
              placeholder="Ej: Dr. Juan Pérez García"
              required
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Cargo *</label>
            <input
              value={form.cargo}
              onChange={e => setForm({ ...form, cargo: e.target.value })}
              placeholder="Ej: Director de Posgrado"
              required
              className="form-input"
            />
          </div>

          <ImageUpload
            label="Imagen de la Firma *"
            value={form.imagenFirma}
            onChange={base64 => setForm({ ...form, imagenFirma: base64 })}
            accept="image/png,image/jpeg,image/webp"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="activoFirma"
              checked={form.activo ?? true}
              onChange={e => setForm({ ...form, activo: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="activoFirma" className="text-sm text-gray-700">Activo</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving || !form.imagenFirma} className="modal-btn-primary">
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="modal-btn-cancel">
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
