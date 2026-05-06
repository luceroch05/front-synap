import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Layers, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { UnidadesService, Unidad, CreateUnidadDto } from '@/lib/services/unidades.service';
import { ProgramasService, Programa } from '@/lib/services/programas.service';

interface GestionUnidadesProps {
  programaId: number;
}

const emptyForm: Omit<CreateUnidadDto, 'programaId'> = { nombre: '', descripcion: '', orden: 1, peso: 0 };

export default function GestionUnidades({ programaId }: GestionUnidadesProps) {
  const navigate = useNavigate();
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [programa, setPrograma] = useState<Programa | null>(null);
  const [loading, setLoading] = useState(true);
  const [pesoTotal, setPesoTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<CreateUnidadDto, 'programaId'>>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activandoEval, setActivandoEval] = useState(false);

  useEffect(() => { cargar(); }, [programaId]);

  const cargar = async () => {
    try {
      setLoading(true);
      const [unidadesData, programaData] = await Promise.all([
        UnidadesService.findByPrograma(programaId),
        ProgramasService.findOne(programaId),
      ]);
      setUnidades(unidadesData);
      setPrograma(programaData);
      setPesoTotal(unidadesData.reduce((s, u) => s + Number(u.peso), 0));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const activarEvaluacion = async () => {
    setActivandoEval(true);
    try {
      await ProgramasService.update(programaId, { tieneEvaluacion: true });
      await cargar();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActivandoEval(false);
    }
  };

  const abrirCrear = () => {
    setForm({ ...emptyForm, orden: unidades.length + 1 });
    setEditingId(null);
    setModalOpen(true);
  };

  const abrirEditar = (u: Unidad) => {
    setForm({ nombre: u.nombre, descripcion: u.descripcion || '', orden: u.orden, peso: u.peso });
    setEditingId(u.id);
    setModalOpen(true);
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      editingId
        ? await UnidadesService.update(editingId, form)
        : await UnidadesService.create({ ...form, programaId });
      setModalOpen(false);
      await cargar();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar esta unidad?')) return;
    try {
      await UnidadesService.remove(id);
      await cargar();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const pesoRestante = 100 - pesoTotal;
  const pesoMaxEdit = editingId
    ? 100 - (pesoTotal - Number(unidades.find(u => u.id === editingId)?.peso || 0))
    : pesoRestante;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="spinner" />
        <p className="text-sm text-gray-400">Cargando...</p>
      </div>
    );
  }

  if (!programa) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Programa no encontrado</p>
        <button onClick={() => navigate('/dashboard/programas')} className="text-[#E8B84B] hover:underline text-sm">
          Volver a programas
        </button>
      </div>
    );
  }

  return (
    <div className="page-root">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/programas')}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="page-title">Unidades</h1>
            <p className="page-subtitle">
              {programa.nombre}
              {programa.tipoPrograma && (
                <span className="ml-2 badge-orange">{programa.tipoPrograma.nombre}</span>
              )}
            </p>
          </div>
        </div>
        {programa.tieneEvaluacion && (
          <button onClick={abrirCrear} className="btn-primary">
            <Plus size={16} /> Nueva Unidad
          </button>
        )}
      </div>

      <div className="page-body">
        {error && (
          <div className="error-bar">
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-bold text-lg leading-none">×</button>
          </div>
        )}

        {/* Banner evaluación no activada */}
        {!programa.tieneEvaluacion && (
          <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4">
            <div className="p-2 bg-amber-100 rounded-xl shrink-0">
              <AlertTriangle size={20} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 mb-1">
                Este programa no tiene evaluación activada
              </h3>
              <p className="text-sm text-amber-700 mb-3">
                Para gestionar unidades necesitas activar la evaluación. Las unidades organizan el contenido
                y definen los pesos de calificación del programa.
              </p>
              <button
                onClick={activarEvaluacion}
                disabled={activandoEval}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
              >
                {activandoEval ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Activando...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Activar evaluación
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Stats de peso */}
        {programa.tieneEvaluacion && (
          <div className="grid grid-cols-3 gap-4">
            <div className="table-card p-4">
              <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Unidades</p>
              <p className="text-2xl font-bold text-gray-900">{unidades.length}</p>
            </div>
            <div className={`table-card p-4 ${pesoTotal === 100 ? 'border-green-200 bg-green-50' : ''}`}>
              <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Peso asignado</p>
              <p className={`text-2xl font-bold ${pesoTotal === 100 ? 'text-green-600' : 'text-gray-900'}`}>
                {pesoTotal}%
              </p>
              {pesoTotal > 0 && (
                <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${pesoTotal === 100 ? 'bg-green-500' : 'bg-[#E8B84B]'}`}
                    style={{ width: `${Math.min(pesoTotal, 100)}%` }}
                  />
                </div>
              )}
            </div>
            <div className={`table-card p-4 ${pesoRestante === 0 ? '' : 'border-orange-200 bg-orange-50'}`}>
              <p className="text-xs text-gray-400 uppercase font-semibold mb-1">Peso restante</p>
              <p className={`text-2xl font-bold ${pesoRestante === 0 ? 'text-gray-400' : 'text-[#E8B84B]'}`}>
                {pesoRestante}%
              </p>
            </div>
          </div>
        )}

        {/* Tabla unidades */}
        {programa.tieneEvaluacion && (
          <div className="table-card">
            {unidades.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <Layers size={40} className="text-gray-200" />
                <p className="text-sm text-gray-400">No hay unidades aún</p>
                <p className="text-xs text-gray-300">Crea la primera unidad para este programa</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ borderBottom: '1px solid #F0F2F5' }}>
                    <tr style={{ backgroundColor: '#FAFAFA' }}>
                      {['#', 'Nombre', 'Descripción', 'Peso', 'Estado', ''].map(h => (
                        <th key={h} className="table-header">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {unidades.map(u => (
                      <tr key={u.id} className="table-row">
                        <td className="table-cell">
                          <span className="w-7 h-7 flex items-center justify-center bg-orange-50 text-[#E8B84B] rounded-lg text-xs font-bold">
                            {u.orden}
                          </span>
                        </td>
                        <td className="table-cell font-medium text-gray-900">{u.nombre}</td>
                        <td className="table-cell text-gray-500 text-sm max-w-xs truncate">{u.descripcion || '—'}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-orange-50 text-[#E8B84B] rounded-lg text-xs font-semibold">
                              {u.peso}%
                            </span>
                            <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#E8B84B]"
                                style={{ width: `${u.peso}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className={u.activo ? 'badge-green' : 'badge-gray'}>
                            {u.activo ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => abrirEditar(u)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-[#E8B84B] hover:bg-orange-50 transition-colors"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => eliminar(u.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
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
        )}
      </div>

      {/* Modal crear/editar */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Unidad' : 'Nueva Unidad'}>
        <form onSubmit={guardar} className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <Layers size={16} className="text-[#E8B84B]" />
              Nombre *
            </label>
            <input
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#E8B84B]/20 focus:border-[#E8B84B]"
              placeholder="Ej: Unidad 1 - Introducción"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#E8B84B]/20 focus:border-[#E8B84B] resize-none"
              rows={2}
              placeholder="Descripción opcional..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Orden *</label>
              <input
                type="number"
                value={form.orden}
                onChange={e => setForm({ ...form, orden: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#E8B84B]/20 focus:border-[#E8B84B]"
                min={1}
                required
              />
            </div>
            <div>
              <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-1.5">
                <span>Peso (%) *</span>
                <span className="text-xs text-gray-400 font-normal">máx. {pesoMaxEdit}%</span>
              </label>
              <input
                type="number"
                value={form.peso}
                onChange={e => setForm({ ...form, peso: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#E8B84B]/20 focus:border-[#E8B84B]"
                min={0}
                max={pesoMaxEdit}
                step={0.01}
                required
              />
            </div>
          </div>

          {/* Barra de peso en tiempo real */}
          <div className="p-3 bg-gray-50 rounded-xl">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Distribución de peso</span>
              <span className={pesoTotal === 100 ? 'text-green-600 font-semibold' : 'text-[#E8B84B] font-semibold'}>
                {pesoTotal}% / 100%
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${pesoTotal >= 100 ? 'bg-green-500' : 'bg-[#E8B84B]'}`}
                style={{ width: `${Math.min(pesoTotal, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#E8B84B] hover:bg-[#D4A017] text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                editingId ? 'Actualizar Unidad' : 'Crear Unidad'
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
