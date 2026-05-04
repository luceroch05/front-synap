import { useState, useEffect } from 'react';
import { Save, RotateCcw, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotasService, NotaGrupalDto } from '@/lib/services/notas.service';
import { UnidadesService, Unidad } from '@/lib/services/unidades.service';
import { InscripcionesService, Inscripcion } from '@/lib/services/inscripciones.service';
import { EstadosInscripcionService, EstadoInscripcion } from '@/lib/services/estados-inscripcion.service';

interface RegistroNotasGrupalesProps {
  grupoId: number;
}

const esAprobado = (nombre?: string) => nombre?.toUpperCase() === 'APROBADO';

export default function RegistroNotasGrupales({ grupoId }: RegistroNotasGrupalesProps) {
  const navigate = useNavigate();
  const [unidades, setUnidades]               = useState<Unidad[]>([]);
  const [unidadSeleccionada, setUnidadSeleccionada] = useState<number | null>(null);
  const [inscripciones, setInscripciones]     = useState<Inscripcion[]>([]);
  const [estados, setEstados]                 = useState<EstadoInscripcion[]>([]);
  const [notas, setNotas]                     = useState<Record<number, NotaGrupalDto>>({});
  const [loading, setLoading]                 = useState(true);
  const [guardando, setGuardando]             = useState(false);
  const [autoAprobando, setAutoAprobando]     = useState(false);
  const [mensaje, setMensaje]                 = useState('');
  const [aprobadosMsg, setAprobadosMsg]       = useState('');
  const [notaMinima, setNotaMinima]           = useState(13);

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

  // Recalcula la nota final de TODAS las inscripciones del grupo
  // y aprueba automáticamente a quienes superen la nota mínima.
  const autoAprobarGrupo = async () => {
    const estadoAprobado = estados.find(e => esAprobado(e.nombre));
    if (!estadoAprobado) return 0;

    setAutoAprobando(true);
    let aprobadosCount = 0;

    await Promise.allSettled(
      inscripciones.map(async insc => {
        try {
          const resultado = await NotasService.calcularNotaFinal(insc.id);
          if (resultado.aprobado && !esAprobado(insc.estado?.nombre)) {
            await InscripcionesService.changeEstado(insc.id, estadoAprobado.id);
            aprobadosCount++;
          }
        } catch {
          // Inscripción sin notas en todas las unidades — ignorar
        }
      })
    );

    setAutoAprobando(false);
    return aprobadosCount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unidadSeleccionada) { setMensaje('Debe seleccionar una unidad'); return; }
    const notasArray = Object.values(notas).filter(n => n.nota >= 0);
    if (notasArray.length === 0) { setMensaje('Ingresa al menos una nota'); return; }

    setGuardando(true);
    setAprobadosMsg('');
    setMensaje('');
    try {
      await NotasService.registrarNotasGrupales(unidadSeleccionada, notasArray);
      setMensaje('✓ Notas guardadas exitosamente');

      // Recargar inscripciones actualizadas antes de auto-aprobar
      const inscripcionesActualizadas = await InscripcionesService.findByGrupo(grupoId);
      setInscripciones(inscripcionesActualizadas);

      const aprobadosCount = await autoAprobarGrupo();
      if (aprobadosCount > 0) {
        setAprobadosMsg(
          `${aprobadosCount} participante${aprobadosCount > 1 ? 's' : ''} aprobado${aprobadosCount > 1 ? 's' : ''} automáticamente`
        );
        // Recargar de nuevo para reflejar los nuevos estados
        const actualizadas2 = await InscripcionesService.findByGrupo(grupoId);
        setInscripciones(actualizadas2);
      }

      await cargarNotasExistentes();
      setTimeout(() => { setMensaje(''); setAprobadosMsg(''); }, 6000);
    } catch (error: any) {
      setMensaje('Error: ' + error.message);
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="spinner" />
      <p className="text-sm text-gray-400">Cargando...</p>
    </div>
  );

  if (inscripciones.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 gap-2 table-card">
      <p className="text-sm text-gray-400">No hay participantes inscritos en este grupo.</p>
    </div>
  );

  const unidadActual = unidades.find(u => u.id === unidadSeleccionada);

  return (
    <div className="page-root">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="page-title">Registro de Notas</h1>
            <p className="page-subtitle">
              {inscripciones.length} participantes · Nota mínima aprobatoria: <strong>{notaMinima}</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="page-body">
        {mensaje && (
          <div className={`p-3 rounded-xl text-sm ${mensaje.startsWith('✓') ? 'bg-green-50 border border-green-200 text-green-700' : 'error-bar'}`}>
            {mensaje}
          </div>
        )}

        {aprobadosMsg && (
          <div className="p-3 rounded-xl text-sm bg-green-50 border border-green-200 text-green-700 flex items-center gap-2">
            <CheckCircle size={16} className="shrink-0" />
            {aprobadosMsg}
          </div>
        )}

        {autoAprobando && (
          <div className="p-3 rounded-xl text-sm bg-orange-50 border border-orange-200 text-orange-700 flex items-center gap-2">
            <RefreshCw size={16} className="shrink-0 animate-spin" />
            Calculando promedios y actualizando estados...
          </div>
        )}

        {/* Selector de unidad con cards */}
        <div className="table-card p-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">Seleccionar Unidad *</p>
          {unidades.length === 0 ? (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-xl">
              Este programa no tiene unidades configuradas. Ve a Programas → Gestionar Unidades.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {unidades.map(u => {
                const selected = unidadSeleccionada === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => { setUnidadSeleccionada(u.id); setNotas({}); }}
                    className={`text-left p-3 rounded-xl border-2 transition-all ${
                      selected
                        ? 'border-[#F7941D] bg-orange-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-xs font-bold ${
                        selected ? 'bg-[#F7941D] text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {u.orden}
                      </span>
                      <span className={`text-xs font-semibold ${selected ? 'text-[#F7941D]' : 'text-gray-400'}`}>
                        {u.peso}%
                      </span>
                    </div>
                    <p className={`text-xs font-medium leading-tight ${selected ? 'text-[#F7941D]' : 'text-gray-700'}`}>
                      {u.nombre}
                    </p>
                    <div className="mt-2 h-1 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${selected ? 'bg-[#F7941D]' : 'bg-gray-300'}`}
                        style={{ width: `${u.peso}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Tabla de notas */}
        {unidadSeleccionada && (
          <form onSubmit={handleSubmit}>
            <div className="table-card">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <p className="font-semibold text-gray-900">{unidadActual?.nombre}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Verde = aprobado (≥{notaMinima}) · Rojo = desaprobado · Al guardar se calcula el promedio final automáticamente
                  </p>
                </div>
                <span className="badge-orange">{unidadActual?.peso}%</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ borderBottom: '1px solid #F0F2F5' }}>
                    <tr style={{ backgroundColor: '#FAFAFA' }}>
                      {['#', 'Participante', 'Estado actual', 'Nota (0–20)', 'Observaciones'].map(h => (
                        <th key={h} className="table-header">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {inscripciones.map((insc, idx) => {
                      const p = insc.participante;
                      const nota = notas[insc.id];
                      const tieneNota = nota?.nota !== undefined && nota.nota !== null && String(nota.nota) !== '';
                      const aprobado = tieneNota && nota.nota >= notaMinima;
                      const desaprobado = tieneNota && nota.nota < notaMinima;
                      const yaAprobado = esAprobado(insc.estado?.nombre);
                      return (
                        <tr
                          key={insc.id}
                          className={`table-row ${aprobado ? 'bg-green-50/40' : desaprobado ? 'bg-red-50/40' : ''}`}
                        >
                          <td className="table-cell text-gray-400 text-sm">{idx + 1}</td>
                          <td className="table-cell">
                            <div className="font-medium text-gray-900 text-sm">
                              {p ? `${p.apellidos}, ${p.nombres}` : `Inscripción #${insc.id}`}
                            </div>
                            {p && <div className="text-xs text-gray-400">{p.tipoDocumento}: {p.numeroDocumento}</div>}
                          </td>
                          <td className="table-cell">
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              yaAprobado ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {insc.estado?.nombre || '—'}
                            </span>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={nota?.nota ?? ''}
                                onChange={e => setNotas(prev => ({
                                  ...prev,
                                  [insc.id]: {
                                    inscripcionId: insc.id,
                                    nota: Number(e.target.value),
                                    observaciones: prev[insc.id]?.observaciones || '',
                                  }
                                }))}
                                className={`w-24 px-3 py-1.5 border rounded-xl text-sm font-medium outline-none transition-all focus:ring-2 ${
                                  aprobado ? 'border-green-300 focus:ring-green-400/20 text-green-700 bg-green-50'
                                  : desaprobado ? 'border-red-300 focus:ring-red-400/20 text-red-700 bg-red-50'
                                  : 'border-gray-200 focus:ring-[#F7941D]/20 focus:border-[#F7941D]'
                                }`}
                                min="0" max="20" step="0.01" placeholder="—"
                              />
                              {aprobado && <CheckCircle size={16} className="text-green-500 shrink-0" />}
                            </div>
                          </td>
                          <td className="table-cell">
                            <input
                              type="text"
                              value={nota?.observaciones || ''}
                              onChange={e => setNotas(prev => ({
                                ...prev,
                                [insc.id]: {
                                  inscripcionId: insc.id,
                                  nota: prev[insc.id]?.nota || 0,
                                  observaciones: e.target.value,
                                }
                              }))}
                              className="w-full px-3 py-1.5 border border-gray-200 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#F7941D]/20 focus:border-[#F7941D]"
                              placeholder="Opcional..."
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                <button
                  type="submit"
                  disabled={guardando || autoAprobando}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#F7941D] hover:bg-[#E8850C] text-white rounded-xl font-semibold shadow-sm hover:shadow-md disabled:opacity-50 transition-all"
                >
                  {guardando || autoAprobando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {autoAprobando ? 'Actualizando estados...' : 'Guardando...'}
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Guardar Notas
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setNotas({})}
                  disabled={guardando || autoAprobando}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <RotateCcw size={16} /> Limpiar
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
