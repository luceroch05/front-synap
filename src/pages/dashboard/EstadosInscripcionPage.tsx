import { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Tag, CheckCircle, Clock, AlertCircle, 
  Eye, Shield, Award, FileText, X
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { EstadosInscripcionService, EstadoInscripcion } from '@/lib/services/estados-inscripcion.service';

interface FormData { nombre: string; descripcion: string; }
const emptyForm: FormData = { nombre: '', descripcion: '' };

// Configuración de colores y iconos por estado predefinido
const getEstadoConfig = (nombre: string) => {
  const name = nombre.toLowerCase();
  if (name.includes('inscrito') || name.includes('inscrip')) {
    return { icon: Clock, color: 'bg-blue-50 border-blue-200 text-blue-700', badge: 'badge-blue' };
  }
  if (name.includes('aprob') || name.includes('complet')) {
    return { icon: CheckCircle, color: 'bg-green-50 border-green-200 text-green-700', badge: 'badge-green' };
  }
  if (name.includes('retir') || name.includes('cancel')) {
    return { icon: AlertCircle, color: 'bg-red-50 border-red-200 text-red-700', badge: 'badge-red' };
  }
  if (name.includes('egres') || name.includes('gradu')) {
    return { icon: Award, color: 'bg-purple-50 border-purple-200 text-purple-700', badge: 'badge-purple' };
  }
  return { icon: Tag, color: 'bg-orange-50 border-orange-200 text-orange-700', badge: 'badge-orange' };
};

export default function EstadosInscripcionPage() {
  const [estados, setEstados] = useState<EstadoInscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try { 
      setLoading(true); 
      setEstados(await EstadosInscripcionService.findAll()); 
    } catch (e: any) { 
      setError(e.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const abrirCrear = () => {
    setForm(emptyForm);
    setEditingId(null);
    setErrors({});
    setModalOpen(true);
  };

  const abrirEditar = (est: EstadoInscripcion) => {
    setForm({ nombre: est.nombre, descripcion: est.descripcion || '' });
    setEditingId(est.id);
    setErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.nombre?.trim()) newErrors.nombre = 'Ingresa el nombre del estado';
    if (form.nombre && form.nombre.length < 3) newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    if (form.nombre && form.nombre.length > 50) newErrors.nombre = 'El nombre no puede exceder 50 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      editingId 
        ? await EstadosInscripcionService.update(editingId, form) 
        : await EstadosInscripcionService.create(form);
      setModalOpen(false); 
      await cargar();
    } catch (e: any) { 
      setError(e.message); 
    } finally { 
      setSaving(false); 
    }
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar este estado? Esta acción podría afectar inscripciones existentes.')) return;
    try { 
      await EstadosInscripcionService.remove(id); 
      await cargar(); 
    } catch (e: any) { 
      setError(e.message); 
    }
  };

  return (
    <div className="page-root">
      <div className="page-header">
        <div>
          <h1 className="page-title">Estados de Inscripción</h1>
          <p className="page-subtitle">Configura los posibles estados para las inscripciones</p>
        </div>
        <button onClick={abrirCrear} className="btn-primary">
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
        ) : estados.length === 0 ? (
          <div className="table-card flex flex-col items-center justify-center py-16 gap-3">
            <Tag size={48} className="text-gray-200" />
            <p className="text-sm text-gray-400">No hay estados configurados</p>
            <button onClick={abrirCrear} className="btn-primary mt-2">
              <Plus size={16} /> Crear primer estado
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {estados.map((est) => {
              const config = getEstadoConfig(est.nombre);
              const Icon = config.icon;
              
              return (
                <div
                  key={est.id}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-gray-300"
                >
                  {/* Header con color dinámico */}
                  <div className={`px-5 py-4 border-b flex items-center justify-between ${config.color.replace('text-', 'bg-').replace('border-', 'border-')} bg-opacity-30`}
                    style={{ backgroundColor: `${config.color.split(' ')[0].replace('bg-', '')}10` }}>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${config.color}`}>
                        <Icon size={16} />
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${config.badge}`}>
                        {est.nombre}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => abrirEditar(est)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#F7941D] hover:bg-orange-50 transition-colors"
                        title="Editar estado"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => eliminar(est.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Eliminar estado"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Body */}
                  <div className="p-5">
                    {est.descripcion ? (
                      <div className="flex items-start gap-2">
                        <FileText size={14} className="text-gray-300 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-500 leading-relaxed">{est.descripcion}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-300 italic">Sin descripción</p>
                    )}
                    
                  
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL MEJORADO */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Estado' : 'Nuevo Estado'}
        size="md"
      >
        <form onSubmit={guardar} className="space-y-5">
          
          {/* Nombre del estado */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <Tag size={16} className="text-[#F7941D]" />
              Nombre del estado *
            </label>
            <input
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#F7941D]/20 focus:border-[#F7941D] ${
                errors.nombre ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="Ej: Aprobado, Retirado, Egresado..."
              autoComplete="off"
            />
            {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
            <p className="text-xs text-gray-400 mt-1">Nombre único que identificará el estado de inscripción</p>
          </div>

          {/* Descripción */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <FileText size={16} className="text-[#F7941D]" />
              Descripción
            </label>
            <textarea
              value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#F7941D]/20 focus:border-[#F7941D] resize-none"
              rows={3}
              placeholder="Descripción opcional del estado..."
            />
          </div>

          {/* Vista previa dinámica */}
          {form.nombre && (
            <div className="mt-2 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
              <div className="flex items-center gap-2 text-xs font-medium text-orange-600 mb-2">
                <Eye size={12} />
                Vista previa
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-orange-100 text-orange-700">
                  {form.nombre}
                </span>
                {form.descripcion && (
                  <span className="text-xs text-gray-500">{form.descripcion}</span>
                )}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#F7941D] hover:bg-[#E8850C] text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>{editingId ? 'Actualizar estado' : 'Crear estado'}</>
              )}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>

        </form>
      </Modal>
    </div>
  );
}