import { useState, useEffect } from 'react';
import { NotasService, NotaFinal } from '@/lib/services/notas.service';

interface VisualizadorNotaFinalProps {
  inscripcionId: number;
  nombreParticipante?: string;
}

export default function VisualizadorNotaFinal({
  inscripcionId,
  nombreParticipante,
}: VisualizadorNotaFinalProps) {
  const [notaFinal, setNotaFinal] = useState<NotaFinal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarNotaFinal();
  }, [inscripcionId]);

  const cargarNotaFinal = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await NotasService.calcularNotaFinal(inscripcionId);
      setNotaFinal(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-500">Cargando nota final...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!notaFinal) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-500">No se pudo cargar la nota final</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      {nombreParticipante && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-2">Reporte de Notas</h2>
          <p className="text-gray-600">Participante: {nombreParticipante}</p>
        </div>
      )}

      {/* Tabla de notas por unidad */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Notas por Unidad</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Unidad
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Nota
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Peso (%)
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Aporte
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {notaFinal.notasDetalle.map((detalle, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{detalle.unidad}</td>
                  <td className="px-4 py-3 text-center font-medium">{detalle.nota.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">{detalle.peso}%</td>
                  <td className="px-4 py-3 text-center text-blue-600 font-medium">
                    {detalle.aporte.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-semibold">
              <tr>
                <td className="px-4 py-3" colSpan={3}>
                  NOTA FINAL
                </td>
                <td className="px-4 py-3 text-center text-lg">
                  <span
                    className={`px-3 py-1 rounded ${
                      notaFinal.aprobado
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {notaFinal.notaFinal.toFixed(2)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Resultado Final */}
      <div
        className={`p-6 rounded-lg shadow ${
          notaFinal.aprobado ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'
        }`}
      >
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">
            {notaFinal.aprobado ? '✓ APROBADO' : '✗ DESAPROBADO'}
          </h3>
          <p className="text-lg">
            Nota Final: <span className="font-bold">{notaFinal.notaFinal.toFixed(2)}</span>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Nota mínima aprobatoria: {notaFinal.notaMinimaAprobatoria.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Botón para imprimir */}
      <div className="text-center">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 print:hidden"
        >
          Imprimir Reporte
        </button>
      </div>
    </div>
  );
}
