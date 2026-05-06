import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Image as ImageIcon } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import ImageUpload from '@/components/ui/ImageUpload';
import { LogosService, Logo, CreateLogoDto } from '@/lib/services/logos.service';

const emptyForm: CreateLogoDto = { nombre: '', imagenLogo: '', activo: true };

export default function LogosPage() {
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateLogoDto>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      setLogos(await LogosService.findAll());
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

  const abrirEditar = (logo: Logo) => {
    setForm({ nombre: logo.nombre || '', imagenLogo: logo.imagenLogo, activo: logo.activo });
    setEditingId(logo.id);
    setModalOpen(true);
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.imagenLogo) { setError('Debe seleccionar una imagen'); return; }
    setSaving(true);
    try {
      if (editingId) {
        await LogosService.update(editingId, form);
      } else {
        await LogosService.create(form);
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
    if (!confirm('¿Eliminar este logo?')) return;
    try {
      await LogosService.remove(id);
      await cargar();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const toggleActivo = async (id: number) => {
    try {
      await LogosService.toggleActive(id);
      await cargar();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <h1 className="page-title">Logos</h1>
          <p className="page-subtitle">Gestiona los logos institucionales para los certificados</p>
        </div>
        <button onClick={abrirCrear} className="btn-primary">
          <Plus size={16} /> Nuevo Logo
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
        ) : logos.length === 0 ? (
          <div className="table-card flex flex-col items-center justify-center py-16 gap-2">
            <ImageIcon size={40} className="text-gray-200" />
            <p className="text-sm text-gray-400">No hay logos registrados</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {logos.map(logo => (
              <div
                key={logo.id}
                className={`table-card overflow-hidden transition-all ${logo.activo ? '' : 'opacity-60'}`}
              >
                <div className="aspect-square bg-gray-50 flex items-center justify-center p-3">
                  {logo.imagenLogo ? (
                    <img
                      src={logo.imagenLogo}
                      alt={logo.nombre || 'Logo'}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <ImageIcon size={36} className="text-gray-300" />
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-800 truncate">{logo.nombre || 'Sin nombre'}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-medium ${logo.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {logo.activo ? 'Activo' : 'Inactivo'}
                  </span>
                  <div className="flex items-center gap-1 mt-2">
                    <button onClick={() => toggleActivo(logo.id)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Activar/Desactivar">
                      {logo.activo
                        ? <ToggleRight size={16} className="text-emerald-500" />
                        : <ToggleLeft size={16} className="text-gray-300" />
                      }
                    </button>
                    <button onClick={() => abrirEditar(logo)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#E8B84B] hover:bg-orange-50 transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => eliminar(logo.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Logo' : 'Nuevo Logo'} size="sm">
        <form onSubmit={guardar} className="space-y-4">
          <div>
            <label className="form-label">Nombre (opcional)</label>
            <input
              value={form.nombre || ''}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Logo UNMSM"
              className="form-input"
            />
          </div>

          <ImageUpload
            label="Imagen del Logo *"
            value={form.imagenLogo}
            onChange={base64 => setForm({ ...form, imagenLogo: base64 })}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="activoLogo"
              checked={form.activo ?? true}
              onChange={e => setForm({ ...form, activo: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="activoLogo" className="text-sm text-gray-700">Activo</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving || !form.imagenLogo} className="modal-btn-primary">
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
