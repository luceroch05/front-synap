import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RotateCcw, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotasService, NotaGrupalDto } from '@/lib/services/notas.service';
import { UnidadesService, Unidad } from '@/lib/services/unidades.service';
import { InscripcionesService, Inscripcion } from '@/lib/services/inscripciones.service';
import { EstadosInscripcionService, EstadoInscripcion } from '@/lib/services/estados-inscripcion.service';

interface RegistroNotasGrupalesProps {
  grupoId: number;
}

export default function RegistroNotasGrupales({ grupoId }: RegistroNotasGrupalesProps) {
  const navigate = useNavigate();
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [unidadSeleccionada, setUnidadSeleccionada] = useState<number | null>(null);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [estados, setEstados] = useState<EstadoInscripcion[]>([]);
  const [notas, setNotas] = useState<Record<number, NotaGrupalDto>>({});
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [aprobadosMsg, setAprobadosMsg] = useState('');
  const [notaMinima, setNotaMinima] = useState(13);

  useEffect(() => { cargarDatos(); }, [grupoId]);
  useEffect(() => { if (unidadSeleccionada) cargarNotasExistentes(); }, [unidadSeleccionada]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [inscripcionesData, estadosData] = await Promise.all([
        InscripcionesService.findByGrupo(grupoId),
        EstadosInscripcionService.findAll(),
      ]);
      setInscripciones(inscripcionesData);
      setEstados(estadosData);

      if (inscripcionesData.length > 0 && inscripcionesData[0].grupo?.programa?.id) {
        const prog = inscripcionesData[0].grupo.programa;
        if (prog.notaMinimaAprobatoria) setNotaMinima(prog.notaMinimaAprobatoria);
        const unidadesData = await UnidadesService.findByPrograma(prog.id);
        setUnidades(unidadesData);
      }
    } catch (error: any) {
      setMensaje('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarNotasExistentes = async () => {
    if (!unidadSeleccionada) return;
    try {
      const notasExistentes = await NotasService.findByUnidad(unidadSeleccionada);
      const notasMap: Record<number, NotaGrupalDto> = {};
      notasExistentes.forEach(nota => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unidadSeleccionada) { setMensaje('Debe seleccionar una unidad'); return; }
    const notasArray = Object.values(notas).filter(n => n.nota >= 0);
    if (notasArray.length === 0) { setMensaje('Ingresa al menos una nota'); return; }

    setGuardando(true);
    setAprobadosMsg('');
    try {
      await NotasService.registrarNotasGrupales(unidadSeleccionada, notasArray);

      // Auto-aprobar: calcular nota final por cada inscripción con nota registrada
      const estadoAprobado = estados.find(e => e.nombre === 'APROBADO');
      if (estadoAprobado) {
        let aprobadosCount = 0;
        const inscripcionesConNota = notasArray.map(n => n.inscripcionId);

        await Promise.allSettled(
          inscripcionesConNota.map(async (inscripcionId) => {
            try {
              const resultado = await NotasService.calcularNotaFinal(inscripcionId);
              if (resultado.aprobado) {
                const insc = inscripciones.find(i => i.id === inscripcionId);
                // Solo cambiar si no está ya aprobado
                if (insc?.estado?.nombre !== 'APROBADO') {
                  await InscripcionesService.changeEstado(inscripcionId, estadoAprobado.id);
                  aprobadosCount++;
                }
              }
            } catch {
              // No todas las unidades tienen nota aún — ignorar
            }
          })
        );

        if (aprobadosCount > 0) {
          setAprobadosMsg(`${aprobadosCount} participante${aprobadosCount > 1 ? 's' : ''} aprobado${aprobadosCount > 1 ? 's' : ''} automáticamente`);
        }
      }

      setMensaje('✓ Notas guardadas exitosamente');
      await cargarNotasExistentes();
      setTimeout(() => { setMensaje(''); setAprobadosMsg(''); }, 5000);
    } catch (error: any) {
      setMensaje('Error: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return (
    <div className="p-12 text-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p className="text-gray-500">Cargando...</p>
    </div>
  );

  if (inscripciones.length === 0) return (
    <div className="p-12 text-center bg-white rounded-2xl border border-gray-200">
      <p className="text-gray-500">No hay participantes inscritos en este grupo.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Registro de Notas</h2>
          <p className="text-sm text-gray-500">
            {inscripciones.length} participantes · Nota mínima aprobatoria:{' '}
            <span className="font-semibold text-gray-700">{notaMinima}</span>
          </p>
        </div>
      </div>

      {mensaje && (
        <div className={`p-3 rounded-xl text-sm ${mensaje.startsWith('✓') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>
          {mensaje}
        </div>
      )}

      {aprobadosMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl text-sm bg-green-50 border border-green-200 text-green-700 flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4 shrink-0" />
          {aprobadosMsg}
        </motion.div>
      )}

      {/* Selector unidad */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Unidad *</label>
        {unidades.length === 0 ? (
          <p className="text-sm text-orange-600 bg-orange-50 border border-orange-200 p-3 rounded-xl">
            Este programa no tiene unidades configuradas. Ve a Programas → Gestionar Unidades.
          </p>
        ) : (
          <select
            value={unidadSeleccionada || ''}
            onChange={e => { setUnidadSeleccionada(Number(e.target.value)); setNotas({}); }}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">— Seleccionar unidad —</option>
            {unidades.map(u => (
              <option key={u.id} value={u.id}>{u.orden}. {u.nombre} ({u.peso}%)</option>
            ))}
          </select>
        )}
      </div>

      {/* Tabla de notas */}
      {unidadSeleccionada && (
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">
                Unidad: <strong>{unidades.find(u => u.id === unidadSeleccionada)?.nombre}</strong>
              </p>
              <span className="text-xs text-gray-400">Verde = aprobado (≥{notaMinima}) · Rojo = desaprobado</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Participante</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nota (0–20)</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {inscripciones.map((insc, idx) => {
                    const p = insc.participante;
                    const nota = notas[insc.id];
                    const tieneNota = nota?.nota !== undefined && nota.nota !== null && String(nota.nota) !== '';
                    const aprobado = tieneNota && nota.nota >= notaMinima;
                    const desaprobado = tieneNota && nota.nota < notaMinima;
                    return (
                      <motion.tr key={insc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className={`transition-colors ${aprobado ? 'bg-green-50/40' : desaprobado ? 'bg-red-50/40' : 'hover:bg-gray-50'}`}>
                        <td className="px-6 py-3 text-gray-500 text-sm">{idx + 1}</td>
                        <td className="px-6 py-3">
                          <div className="font-medium text-gray-900 text-sm">{p ? `${p.apellidos}, ${p.nombres}` : `Inscripción #${insc.id}`}</div>
                          {p && <div className="text-xs text-gray-400">{p.tipoDocumento}: {p.numeroDocumento}</div>}
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={nota?.nota ?? ''}
                              onChange={e => setNotas(prev => ({
                                ...prev,
                                [insc.id]: { inscripcionId: insc.id, nota: Number(e.target.value), observaciones: prev[insc.id]?.observaciones || '' }
                              }))}
                              className={`w-24 px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 text-sm font-medium ${
                                aprobado ? 'border-green-300 focus:ring-green-400 text-green-700 bg-green-50'
                                : desaprobado ? 'border-red-300 focus:ring-red-400 text-red-700 bg-red-50'
                                : 'border-gray-200 focus:ring-blue-500'
                              }`}
                              min="0" max="20" step="0.01" placeholder="—"
                            />
                            {aprobado && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <input
                            type="text"
                            value={nota?.observaciones || ''}
                            onChange={e => setNotas(prev => ({
                              ...prev,
                              [insc.id]: { inscripcionId: insc.id, nota: prev[insc.id]?.nota || 0, observaciones: e.target.value }
                            }))}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Opcional..."
                          />
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <motion.button type="submit" disabled={guardando} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50">
                <Save className="w-4 h-4" />
                {guardando ? 'Guardando...' : 'Guardar Notas'}
              </motion.button>
              <button type="button" onClick={() => setNotas({})}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                <RotateCcw className="w-4 h-4" /> Limpiar
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
