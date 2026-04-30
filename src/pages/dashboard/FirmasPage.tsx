import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Firmas</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona las firmas de autoridades para los certificados</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={abrirCrear}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-md"
        >
          <Plus className="w-4 h-4" /> Nueva Firma
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
      ) : firmas.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-gray-200">
          <PenLine className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay firmas registradas. Agrega la primera.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Firma', 'Autoridad', 'Cargo', 'Estado', ''].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {firmas.map(firma => (
                <motion.tr key={firma.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    {firma.imagenFirma ? (
                      <img
                        src={firma.imagenFirma}
                        alt={firma.nombreAutoridad}
                        className="h-12 max-w-[120px] object-contain bg-gray-50 rounded-lg border border-gray-100 p-1"
                      />
                    ) : (
                      <div className="h-12 w-24 bg-gray-100 rounded-lg flex items-center justify-center">
                        <PenLine className="w-5 h-5 text-gray-300" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{firma.nombreAutoridad}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{firma.cargo}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${firma.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {firma.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => toggleActivo(firma.id)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                        {firma.activo ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button onClick={() => abrirEditar(firma)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => eliminar(firma.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Firma' : 'Nueva Firma'} size="sm">
        <form onSubmit={guardar} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Autoridad *</label>
            <input
              value={form.nombreAutoridad}
              onChange={e => setForm({ ...form, nombreAutoridad: e.target.value })}
              placeholder="Ej: Dr. Juan Pérez García"
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo *</label>
            <input
              value={form.cargo}
              onChange={e => setForm({ ...form, cargo: e.target.value })}
              placeholder="Ej: Director de Posgrado"
              required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
            <button type="submit" disabled={saving || !form.imagenFirma}
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
