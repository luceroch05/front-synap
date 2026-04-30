'use client';

import { useState, useEffect } from 'react';
import { NotasService, NotaGrupalDto } from '@/lib/services/notas.service';
import { UnidadesService, Unidad } from '@/lib/services/unidades.service';
import { InscripcionesService } from '@/lib/services/inscripciones.service';

interface Inscripcion {
  id: number;
  participante: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  };
  notaActual?: number;
  observaciones?: string;
}

interface RegistroNotasGrupalesProps {
  grupoId: number;
}

export default function RegistroNotasGrupales({ grupoId }: RegistroNotasGrupalesProps) {
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [unidadSeleccionada, setUnidadSeleccionada] = useState<number | null>(null);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [notas, setNotas] = useState<Record<number, NotaGrupalDto>>({});
  const [loading, setLoading] = useState(true);
  const [programaId, setProgramaId] = useState<number | null>(null);

  useEffect(() => {
    cargarDatos();
  }, [grupoId]);

  useEffect(() => {
    if (unidadSeleccionada) {
      cargarNotasExistentes();
    }
  }, [unidadSeleccionada]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      // Cargar inscripciones del grupo
      const inscripcionesData = await InscripcionesService.findByGrupo(grupoId);
      setInscripciones(inscripcionesData);

      // Obtener el programa del grupo
      if (inscripcionesData.length > 0 && inscripcionesData[0].grupo) {
        const progId = inscripcionesData[0].grupo.programa.id;
        setProgramaId(progId);

        // Cargar unidades del programa
        const unidadesData = await UnidadesService.findByPrograma(progId);
        setUnidades(unidadesData);
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarNotasExistentes = async () => {
    if (!unidadSeleccionada) return;

    try {
      const notasExistentes = await NotasService.findByUnidad(unidadSeleccionada);

      const notasMap: Record<number, NotaGrupalDto> = {};
      notasExistentes.forEach((nota) => {
        notasMap[nota.inscripcionId] = {
          inscripcionId: nota.inscripcionId,
          nota: nota.nota,
          observaciones: nota.observaciones,
        };
      });

      setNotas(notasMap);
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const handleNotaChange = (inscripcionId: number, nota: number) => {
    setNotas((prev) => ({
      ...prev,
      [inscripcionId]: {
        inscripcionId,
        nota,
        observaciones: prev[inscripcionId]?.observaciones || '',
      },
    }));
  };

  const handleObservacionChange = (inscripcionId: number, observaciones: string) => {
    setNotas((prev) => ({
      ...prev,
      [inscripcionId]: {
        inscripcionId,
        nota: prev[inscripcionId]?.nota || 0,
        observaciones,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!unidadSeleccionada) {
      alert('Debe seleccionar una unidad');
      return;
    }

    const notasArray = Object.values(notas).filter((n) => n.nota > 0);

    if (notasArray.length === 0) {
      alert('Debe ingresar al menos una nota');
      return;
    }

    try {
      await NotasService.registrarNotasGrupales(unidadSeleccionada, notasArray);
      alert('Notas registradas exitosamente');
      await cargarNotasExistentes();
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (loading) return <div className="p-4">Cargando...</div>;

  if (inscripciones.length === 0) {
    return <div className="p-4">No hay participantes inscritos en este grupo</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Registro de Notas Grupales</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Seleccionar Unidad *</label>
          <select
            value={unidadSeleccionada || ''}
            onChange={(e) => setUnidadSeleccionada(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">-- Seleccione una unidad --</option>
            {unidades.map((unidad) => (
              <option key={unidad.id} value={unidad.id}>
                {unidad.orden}. {unidad.nombre} ({unidad.peso}%)
              </option>
            ))}
          </select>
        </div>

        {unidadSeleccionada && (
          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participante</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nota (0-20)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {inscripciones.map((inscripcion, index) => {
                    const notaActual = notas[inscripcion.id];
                    return (
                      <tr key={inscripcion.id}>
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3">
                          {inscripcion.participante.apellidoPaterno}{' '}
                          {inscripcion.participante.apellidoMaterno},{' '}
                          {inscripcion.participante.nombre}
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={notaActual?.nota || ''}
                            onChange={(e) => handleNotaChange(inscripcion.id, Number(e.target.value))}
                            className="w-24 border rounded px-3 py-2"
                            min="0"
                            max="20"
                            step="0.01"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={notaActual?.observaciones || ''}
                            onChange={(e) => handleObservacionChange(inscripcion.id, e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            placeholder="Observaciones..."
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Guardar Notas
              </button>
              <button
                type="button"
                onClick={() => setNotas({})}
                className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
              >
                Limpiar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
