'use client';

import { useState, useEffect } from 'react';
import { UnidadesService, Unidad, CreateUnidadDto } from '@/lib/services/unidades.service';
import { ProgramasService, Programa } from '@/lib/services/programas.service';

interface GestionUnidadesProps {
  programaId: number;
}

export default function GestionUnidades({ programaId }: GestionUnidadesProps) {
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [programa, setPrograma] = useState<Programa | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [pesoTotal, setPesoTotal] = useState(0);
  const [formData, setFormData] = useState<CreateUnidadDto>({
    programaId,
    nombre: '',
    descripcion: '',
    orden: 1,
    peso: 0,
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    cargarDatos();
  }, [programaId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [unidadesData, programaData, peso] = await Promise.all([
        UnidadesService.findByPrograma(programaId),
        ProgramasService.findOne(programaId),
        UnidadesService.calcularPesoTotal(programaId),
      ]);
      setUnidades(unidadesData);
      setPrograma(programaData);
      setPesoTotal(peso);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await UnidadesService.update(editingId, formData);
      } else {
        await UnidadesService.create(formData);
      }
      await cargarDatos();
      resetForm();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleEdit = (unidad: Unidad) => {
    setFormData({
      programaId: unidad.programaId,
      nombre: unidad.nombre,
      descripcion: unidad.descripcion,
      orden: unidad.orden,
      peso: unidad.peso,
    });
    setEditingId(unidad.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar esta unidad?')) return;
    try {
      await UnidadesService.remove(id);
      await cargarDatos();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      programaId,
      nombre: '',
      descripcion: '',
      orden: unidades.length + 1,
      peso: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <div className="p-4">Cargando...</div>;

  if (!programa) return <div className="p-4">Programa no encontrado</div>;

  const pesoRestante = 100 - pesoTotal;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Gestión de Unidades</h2>
        <p className="text-gray-600 mb-2">Programa: {programa.nombre}</p>
        <div className="flex gap-4 text-sm">
          <p className={`font-semibold ${pesoTotal === 100 ? 'text-green-600' : 'text-orange-600'}`}>
            Peso Total: {pesoTotal}%
          </p>
          <p className="text-gray-600">Peso Restante: {pesoRestante}%</p>
        </div>
      </div>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Nueva Unidad
        </button>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">
            {editingId ? 'Editar Unidad' : 'Nueva Unidad'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full border rounded px-3 py-2"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Orden *</label>
                <input
                  type="number"
                  value={formData.orden}
                  onChange={(e) => setFormData({ ...formData, orden: Number(e.target.value) })}
                  className="w-full border rounded px-3 py-2"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Peso (%) * <span className="text-xs text-gray-500">(Restante: {pesoRestante}%)</span>
                </label>
                <input
                  type="number"
                  value={formData.peso}
                  onChange={(e) => setFormData({ ...formData, peso: Number(e.target.value) })}
                  className="w-full border rounded px-3 py-2"
                  min="0"
                  max={editingId ? 100 : pesoRestante}
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orden</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Peso (%)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {unidades.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No hay unidades registradas
                </td>
              </tr>
            ) : (
              unidades.map((unidad) => (
                <tr key={unidad.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{unidad.orden}</td>
                  <td className="px-6 py-4">{unidad.nombre}</td>
                  <td className="px-6 py-4">{unidad.descripcion || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{unidad.peso}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        unidad.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {unidad.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(unidad)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(unidad.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
