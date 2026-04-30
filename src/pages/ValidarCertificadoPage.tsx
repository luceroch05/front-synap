import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, Home, CheckCircle, XCircle, Award, Calendar, User, BookOpen } from 'lucide-react';
import { API_URL } from '@/lib/api-config';

interface CertificadoValidado {
  id: number;
  codigoUnico: string;
  fechaEmision: string;
  url: string;
  estado: { nombre: string };
  inscripcion: {
    participante: { nombres: string; apellidos: string; tipoDocumento: string; numeroDocumento: string };
    grupo: {
      nombreGrupo: string;
      fechaInicio: string;
      fechaFin: string;
      programa: { nombre: string; tipoPrograma?: { nombre: string }; horasAcademicas?: number };
    };
  };
}

export default function ValidarCertificadoPage() {
  const [codigo, setCodigo] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [resultado, setResultado] = useState<CertificadoValidado | null>(null);
  const [error, setError] = useState('');

  const validar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim()) return;
    setBuscando(true);
    setResultado(null);
    setError('');
    try {
      const res = await fetch(`${API_URL}/certificados/codigo/${codigo.trim()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Certificado no encontrado');
      }
      const data: CertificadoValidado = await res.json();
      setResultado(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBuscando(false);
    }
  };

  const fmtDate = (d: string) => {
    if (!d) return '—';
    const [y, m, day] = d.split('T')[0].split('-').map(Number);
    return new Date(y, m - 1, day).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const valido = resultado?.estado?.nombre === 'Emitido' || resultado?.estado?.nombre === 'Válido';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">SYNAP</h1>
              <p className="text-xs text-gray-500">Validación de Certificados</p>
            </div>
          </div>
          <Link to="/" className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm">
            <Home className="w-4 h-4" /> Inicio
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12 space-y-6">
        {/* Hero */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Validar Certificado</h1>
          <p className="text-gray-500">Ingresa el código único para verificar la autenticidad del certificado</p>
        </div>

        {/* Formulario */}
        <form onSubmit={validar} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Código del Certificado</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={codigo}
                onChange={e => setCodigo(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && validar(e as any)}
                placeholder="Ej: CERT-2026-12345678"
                className="w-full pl-12 pr-4 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono tracking-wider"
                autoFocus
              />
            </div>
          </div>
          <motion.button
            type="submit"
            disabled={buscando || !codigo.trim()}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-base hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
          >
            {buscando ? (
              <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Verificando...</>
            ) : (
              <><Shield className="w-5 h-5" /> Validar Certificado</>
            )}
          </motion.button>
        </form>

        {/* Resultado */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-lg border-2 border-red-200 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-red-700 text-lg">Certificado no válido</h3>
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          {resultado && (
            <motion.div key="resultado" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`bg-white rounded-2xl shadow-lg border-2 p-6 space-y-5 ${valido ? 'border-green-300' : 'border-orange-300'}`}>
              {/* Estado */}
              <div className={`flex items-center gap-3 p-4 rounded-xl ${valido ? 'bg-green-50' : 'bg-orange-50'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${valido ? 'bg-green-100' : 'bg-orange-100'}`}>
                  {valido
                    ? <CheckCircle className="w-7 h-7 text-green-600" />
                    : <XCircle className="w-7 h-7 text-orange-600" />}
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${valido ? 'text-green-800' : 'text-orange-800'}`}>
                    {valido ? 'Certificado Válido' : `Certificado ${resultado.estado?.nombre}`}
                  </h3>
                  <p className={`text-sm font-mono ${valido ? 'text-green-600' : 'text-orange-600'}`}>{resultado.codigoUnico}</p>
                </div>
              </div>

              {/* Datos del certificado */}
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <User className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Participante</p>
                    <p className="font-semibold text-gray-900">
                      {resultado.inscripcion?.participante?.nombres} {resultado.inscripcion?.participante?.apellidos}
                    </p>
                    <p className="text-sm text-gray-500">
                      {resultado.inscripcion?.participante?.tipoDocumento}: {resultado.inscripcion?.participante?.numeroDocumento}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <BookOpen className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Programa</p>
                    <p className="font-semibold text-gray-900">{resultado.inscripcion?.grupo?.programa?.nombre}</p>
                    {resultado.inscripcion?.grupo?.programa?.tipoPrograma && (
                      <p className="text-sm text-gray-500">{resultado.inscripcion.grupo.programa.tipoPrograma.nombre}</p>
                    )}
                    {resultado.inscripcion?.grupo?.programa?.horasAcademicas && (
                      <p className="text-sm text-gray-500">{resultado.inscripcion.grupo.programa.horasAcademicas} horas académicas</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-0.5">Fechas</p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Emisión:</span> {fmtDate(resultado.fechaEmision)}
                    </p>
                    {resultado.inscripcion?.grupo && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Período:</span> {fmtDate(resultado.inscripcion.grupo.fechaInicio)} — {fmtDate(resultado.inscripcion.grupo.fechaFin)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Ver PDF */}
              {resultado.url && (
                <a href={`${API_URL}${resultado.url}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
                  <Award className="w-5 h-5" /> Ver Certificado PDF
                </a>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
