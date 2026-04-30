import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logos</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona los logos institucionales para los certificados</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={abrirCrear}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-md"
        >
          <Plus className="w-4 h-4" /> Nuevo Logo
        </motion.button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          {error}
          <button onClick={() => setError('')} className="float-right font-bold">×</button>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : logos.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-200">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay logos registrados. Agrega el primero.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {logos.map(logo => (
            <motion.div
              key={logo.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${logo.activo ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}
            >
              <div className="aspect-square bg-gray-50 flex items-center justify-center p-3">
                {logo.imagenLogo ? (
                  <img
                    src={logo.imagenLogo}
                    alt={logo.nombre || 'Logo'}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <ImageIcon className="w-10 h-10 text-gray-300" />
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-800 truncate">{logo.nombre || 'Sin nombre'}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-medium ${logo.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {logo.activo ? 'Activo' : 'Inactivo'}
                </span>
                <div className="flex items-center gap-1 mt-2">
                  <button onClick={() => toggleActivo(logo.id)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Activar/Desactivar">
                    {logo.activo ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                  <button onClick={() => abrirEditar(logo)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => eliminar(logo.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Logo' : 'Nuevo Logo'} size="sm">
        <form onSubmit={guardar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre (opcional)</label>
            <input
              value={form.nombre || ''}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Logo UNMSM"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
            <button type="submit" disabled={saving || !form.imagenLogo}
              className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={() => setModalOpen(false)}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
