import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, ArrowLeft, CheckCircle, XCircle, Award, Calendar, User, BookOpen, Hash } from 'lucide-react';
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

const STYLES = `
  @keyframes fadeInUp   { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeInLeft { from { opacity:0; transform:translateX(-24px); } to { opacity:1; transform:translateX(0); } }
  @keyframes float      { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
  @keyframes gradientShift { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
  @keyframes pulse      { 0%,100% { box-shadow:0 0 0 0 rgba(232,184,75,0.35); } 50% { box-shadow:0 0 0 10px rgba(232,184,75,0); } }
  @keyframes spin       { to { transform:rotate(360deg); } }

  .val-input:focus {
    outline: none;
    border-color: #E8B84B !important;
    box-shadow: 0 0 0 4px rgba(232,184,75,0.15) !important;
  }
  .val-btn {
    width: 100%; padding: 15px;
    background: linear-gradient(135deg, #E8B84B, #D4A017);
    color: #1A2A3A; font-size: 15px; font-weight: 700;
    border: none; border-radius: 14px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    box-shadow: 0 8px 28px -8px rgba(232,184,75,0.55);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .val-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 14px 36px -8px rgba(232,184,75,0.65);
  }
  .val-btn:disabled { opacity: 0.55; cursor: not-allowed; }

  .info-row {
    display: flex; align-items: flex-start; gap: 14px;
    padding: 16px 18px; background: #F8FAFE;
    border-radius: 14px; border: 1px solid #EEF2F8;
    transition: border-color 0.2s;
  }
  .info-row:hover { border-color: rgba(232,184,75,0.35); }

  @media (max-width: 768px) {
    .val-split-left  { display: none !important; }
    .val-split-right { padding: 24px 20px !important; min-height: 100vh; }
  }
`

export default function ValidarCertificadoPage() {
  const { codigo: codigoParam } = useParams<{ codigo: string }>();
  const [searchParams] = useSearchParams();
  const codigoUrl = codigoParam || searchParams.get('codigo') || searchParams.get('code') || '';

  const [codigo, setCodigo] = useState(codigoUrl);
  const [buscando, setBuscando] = useState(false);
  const [resultado, setResultado] = useState<CertificadoValidado | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = 'val-styles';
    if (!document.getElementById(id)) {
      const tag = document.createElement('style');
      tag.id = id; tag.textContent = STYLES;
      document.head.appendChild(tag);
    }
  }, []);

  const buscarCodigo = async (cod: string) => {
    if (!cod.trim()) return;
    setBuscando(true); setResultado(null); setError('');
    try {
      const res = await fetch(`${API_URL}/certificados/codigo/${cod.trim()}`);
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Certificado no encontrado'); }
      setResultado(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setBuscando(false); }
  };

  // Auto-validar si viene código por URL
  useEffect(() => {
    if (codigoUrl) buscarCodigo(codigoUrl);
  }, [codigoUrl]);

  const validar = async (e: React.FormEvent) => {
    e.preventDefault();
    buscarCodigo(codigo);
  };

  const fmtDate = (d: string) => {
    if (!d) return '—';
    const [y, m, day] = d.split('T')[0].split('-').map(Number);
    return new Date(y, m - 1, day).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const valido = ['emitido', 'válido', 'valido', 'admitido', 'aprobado', 'activo'].includes(
    (resultado?.estado?.nombre ?? '').toLowerCase()
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* ── PANEL IZQUIERDO (mismo estilo landing) ── */}
      <div className="val-split-left" style={{
        flex: '0 0 42%',
        background: 'linear-gradient(160deg, #0a1520 0%, #1A2A3A 60%, #0f2236 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 52px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Glow */}
        <div style={{ position:'absolute', top:'-15%', left:'-10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(232,184,75,0.07) 0%, transparent 65%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-10%', right:'-5%', width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 65%)', pointerEvents:'none' }} />
        {/* Grid */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize:'36px 36px', pointerEvents:'none' }} />

        {/* Logo */}
        <div style={{ position:'relative', zIndex:1 }}>
          <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:10, textDecoration:'none' }}>
            <img src="/convenio-1770145665324-723494311.png" alt="SYNAP" style={{ height:38, objectFit:'contain' }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.display='none' }} />
          </Link>
        </div>

        {/* Copy central */}
        <div style={{ position:'relative', zIndex:1 }}>
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1, duration:0.6 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:24 }}>
              <div style={{ width:28, height:1, background:'#E8B84B' }} />
              <span style={{ fontSize:11, fontWeight:700, color:'#E8B84B', letterSpacing:3 }}>VERIFICACIÓN OFICIAL</span>
            </div>
            <h2 style={{
              fontSize:'clamp(1.8rem, 2.5vw, 2.8rem)', fontWeight:800, color:'#fff',
              lineHeight:1.1, letterSpacing:'-0.03em', marginBottom:20,
            }}>
              Comprueba la{' '}
              <span style={{
                background:'linear-gradient(90deg,#E8B84B 0%,#f5d080 50%,#E8B84B 100%)',
                backgroundSize:'200% auto',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
                backgroundClip:'text',
                animation:'gradientShift 4s linear infinite',
              }}>autenticidad</span>
              <br />de tu certificado
            </h2>
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:14, lineHeight:1.75, maxWidth:340 }}>
              Cada certificado emitido por SYNAP tiene un código único e irrepetible verificable en tiempo real.
            </p>
          </motion.div>

          {/* Feature pills */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25, duration:0.6 }}
            style={{ display:'flex', flexDirection:'column', gap:12, marginTop:40 }}>
            {[
              { icon: <Shield size={15} />, text: 'Validación instantánea y segura' },
              { icon: <CheckCircle size={15} />, text: 'Certificados con respaldo institucional' },
              { icon: <Award size={15} />, text: 'Código único por participante' },
            ].map((item, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:12,
                background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)',
                borderRadius:12, padding:'12px 16px', color:'rgba(255,255,255,0.7)', fontSize:13,
              }}>
                <span style={{ color:'#E8B84B', flexShrink:0 }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom mini-cert decorativo */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
          style={{ position:'relative', zIndex:1, animation:'float 5s ease-in-out infinite' }}>
          <div style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, padding:'16px 18px' }}>
            <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)', letterSpacing:2, marginBottom:8 }}>EJEMPLO DE CÓDIGO</div>
            <div style={{ fontFamily:'monospace', fontSize:15, fontWeight:700, color:'#E8B84B', letterSpacing:1 }}>CERT-2025-00001</div>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:8 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#10B981', boxShadow:'0 0 6px #10B981' }} />
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>Certificado verificado · SYNAP</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── PANEL DERECHO ── */}
      <div className="val-split-right" style={{
        flex:'1 1 0', background:'#F0F4F8',
        display:'flex', flexDirection:'column',
        padding:'48px 52px', overflowY:'auto',
        position:'relative',
      }}>
        {/* Subtle grid bg */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(#d8e0ea 1px,transparent 1px),linear-gradient(90deg,#d8e0ea 1px,transparent 1px)', backgroundSize:'36px 36px', opacity:0.35, pointerEvents:'none' }} />
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 70% 30%, rgba(240,244,248,0) 30%, #F0F4F8 75%)', pointerEvents:'none' }} />

        {/* Back link */}
        <motion.div initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.4 }}
          style={{ position:'relative', zIndex:1, marginBottom:40 }}>
          <Link to="/" style={{
            display:'inline-flex', alignItems:'center', gap:8, textDecoration:'none',
            fontSize:13, fontWeight:600, color:'#6B7A8A',
            padding:'8px 16px', background:'rgba(255,255,255,0.8)', borderRadius:10,
            border:'1px solid #E8EDF2', backdropFilter:'blur(8px)',
            transition:'all 0.2s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='#1A2A3A'; (e.currentTarget as HTMLElement).style.borderColor='#1A2A3A' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='#6B7A8A'; (e.currentTarget as HTMLElement).style.borderColor='#E8EDF2' }}
          >
            <ArrowLeft size={14} /> Volver al inicio
          </Link>
        </motion.div>

        {/* Form card */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.1 }}
          style={{ position:'relative', zIndex:1, maxWidth:520, width:'100%', margin:'0 auto' }}>

          {/* Header del form */}
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{
              width:64, height:64, borderRadius:18, margin:'0 auto 20px',
              background:'linear-gradient(135deg, #E8B84B, #D4A017)',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 12px 32px -8px rgba(232,184,75,0.5)',
              animation:'pulse 2.5s infinite',
            }}>
              <Shield size={28} color="#1A2A3A" />
            </div>
            <h1 style={{ fontSize:'clamp(1.5rem, 2.5vw, 2rem)', fontWeight:800, color:'#1A2A3A', marginBottom:8, letterSpacing:'-0.03em' }}>
              Validar Certificado
            </h1>
            <p style={{ fontSize:14, color:'#6B7A8A', lineHeight:1.6 }}>
              Ingresa el código único para verificar la autenticidad
            </p>
          </div>

          {/* Form */}
          <form onSubmit={validar} style={{
            background:'#fff', borderRadius:22, padding:28,
            boxShadow:'0 8px 40px -12px rgba(0,0,0,0.12), 0 0 0 1px rgba(232,184,75,0.1)',
            border:'1px solid rgba(232,184,75,0.15)',
          }}>
            <label style={{ fontSize:12, fontWeight:700, color:'#1A2A3A', letterSpacing:0.5, display:'block', marginBottom:10 }}>
              CÓDIGO DEL CERTIFICADO
            </label>
            <div style={{ position:'relative', marginBottom:18 }}>
              <Hash size={18} style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'#8E9EAE' }} />
              <input
                type="text"
                value={codigo}
                onChange={e => setCodigo(e.target.value.toUpperCase())}
                placeholder="Ej: CERT-2025-00001"
                className="val-input"
                style={{
                  width:'100%', paddingLeft:48, paddingRight:20, paddingTop:14, paddingBottom:14,
                  fontSize:15, fontFamily:'monospace', fontWeight:600, letterSpacing:1.5,
                  border:'2px solid #E8EDF2', borderRadius:12,
                  color:'#1A2A3A', background:'#F8FAFE',
                  transition:'border-color 0.2s, box-shadow 0.2s',
                }}
                autoFocus
              />
            </div>
            <button type="submit" className="val-btn" disabled={buscando || !codigo.trim()}>
              {buscando ? (
                <><span style={{ width:18, height:18, border:'2.5px solid #1A2A3A', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.7s linear infinite', display:'inline-block' }} /> Verificando...</>
              ) : (
                <><Search size={18} /> Validar Certificado</>
              )}
            </button>

            <p style={{ fontSize:11, color:'#8E9EAE', textAlign:'center', marginTop:14, lineHeight:1.6 }}>
              El código está impreso en tu certificado o fue enviado a tu correo
            </p>
          </form>

          {/* Resultado */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div key="error"
                initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
                transition={{ duration:0.35 }}
                style={{
                  marginTop:20, background:'#fff', borderRadius:18,
                  border:'2px solid #FCA5A5', padding:'22px 24px',
                  boxShadow:'0 8px 32px -8px rgba(239,68,68,0.15)',
                }}>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:44, height:44, borderRadius:14, background:'#FEF2F2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <XCircle size={22} color="#DC2626" />
                  </div>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700, color:'#991B1B', marginBottom:3 }}>Certificado no encontrado</div>
                    <div style={{ fontSize:13, color:'#B91C1C' }}>{error}</div>
                  </div>
                </div>
              </motion.div>
            )}

            {resultado && (
              <motion.div key="resultado"
                initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
                transition={{ duration:0.4 }}
                style={{
                  marginTop:20, background:'#fff', borderRadius:22,
                  border:`2px solid ${valido ? '#6EE7B7' : '#FCA5A5'}`,
                  padding:'24px', overflow:'hidden',
                  boxShadow:`0 12px 40px -12px ${valido ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)'}`,
                }}>

                {/* Estado badge */}
                <div style={{
                  display:'flex', alignItems:'center', gap:14, marginBottom:22,
                  padding:'14px 18px', borderRadius:14,
                  background: valido ? 'linear-gradient(135deg, #ECFDF5, #D1FAE5)' : 'linear-gradient(135deg, #FEF2F2, #FEE2E2)',
                }}>
                  <div style={{ width:46, height:46, borderRadius:14, background: valido ? '#10B981' : '#EF4444', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:`0 6px 16px -4px ${valido ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}` }}>
                    {valido ? <CheckCircle size={24} color="#fff" /> : <XCircle size={24} color="#fff" />}
                  </div>
                  <div>
                    <div style={{ fontSize:16, fontWeight:800, color: valido ? '#065F46' : '#991B1B' }}>
                      {valido ? 'Certificado Válido' : `Estado: ${resultado.estado?.nombre}`}
                    </div>
                    <div style={{ fontFamily:'monospace', fontSize:12, fontWeight:600, color: valido ? '#059669' : '#DC2626', marginTop:2 }}>
                      {resultado.codigoUnico}
                    </div>
                  </div>
                </div>

                {/* Info rows */}
                <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
                  <div className="info-row">
                    <User size={18} style={{ color:'#E8B84B', flexShrink:0, marginTop:2 }} />
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:'#8E9EAE', letterSpacing:1.5, marginBottom:4 }}>PARTICIPANTE</div>
                      <div style={{ fontSize:15, fontWeight:700, color:'#1A2A3A' }}>
                        {resultado.inscripcion?.participante?.nombres} {resultado.inscripcion?.participante?.apellidos}
                      </div>
                      <div style={{ fontSize:12, color:'#6B7A8A', marginTop:2 }}>
                        {resultado.inscripcion?.participante?.tipoDocumento}: {resultado.inscripcion?.participante?.numeroDocumento}
                      </div>
                    </div>
                  </div>

                  <div className="info-row">
                    <BookOpen size={18} style={{ color:'#1A2A3A', flexShrink:0, marginTop:2 }} />
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:'#8E9EAE', letterSpacing:1.5, marginBottom:4 }}>PROGRAMA</div>
                      <div style={{ fontSize:15, fontWeight:700, color:'#1A2A3A' }}>{resultado.inscripcion?.grupo?.programa?.nombre}</div>
                      {resultado.inscripcion?.grupo?.programa?.tipoPrograma && (
                        <div style={{ fontSize:12, color:'#6B7A8A', marginTop:2 }}>{resultado.inscripcion.grupo.programa.tipoPrograma.nombre}</div>
                      )}
                      {resultado.inscripcion?.grupo?.programa?.horasAcademicas && (
                        <div style={{ display:'inline-flex', alignItems:'center', gap:5, marginTop:6, background:'rgba(232,184,75,0.1)', borderRadius:8, padding:'3px 10px' }}>
                          <span style={{ fontSize:11, fontWeight:700, color:'#D4A017' }}>{resultado.inscripcion.grupo.programa.horasAcademicas} horas académicas</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="info-row">
                    <Calendar size={18} style={{ color:'#10B981', flexShrink:0, marginTop:2 }} />
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:'#8E9EAE', letterSpacing:1.5, marginBottom:4 }}>FECHAS</div>
                      <div style={{ fontSize:13, color:'#4A5568', marginBottom:3 }}>
                        <span style={{ fontWeight:600 }}>Emisión: </span>{fmtDate(resultado.fechaEmision)}
                      </div>
                      {resultado.inscripcion?.grupo && (
                        <div style={{ fontSize:13, color:'#4A5568' }}>
                          <span style={{ fontWeight:600 }}>Período: </span>
                          {fmtDate(resultado.inscripcion.grupo.fechaInicio)} — {fmtDate(resultado.inscripcion.grupo.fechaFin)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* PDF button */}
                {resultado.url && (
                  <a href={`${API_URL}${resultado.url}`} target="_blank" rel="noopener noreferrer"
                    style={{
                      display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                      width:'100%', padding:'14px', borderRadius:14,
                      background:'linear-gradient(135deg, #E8B84B, #D4A017)',
                      color:'#1A2A3A', fontWeight:700, fontSize:14,
                      textDecoration:'none', boxShadow:'0 8px 24px -8px rgba(232,184,75,0.5)',
                      transition:'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow='0 14px 32px -8px rgba(232,184,75,0.65)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform='translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow='0 8px 24px -8px rgba(232,184,75,0.5)' }}
                  >
                    <Award size={18} /> Ver Certificado PDF
                  </a>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer mini */}
        <div style={{ position:'relative', zIndex:1, textAlign:'center', marginTop:'auto', paddingTop:40 }}>
          <p style={{ fontSize:11, color:'#A0ADB8' }}>© 2025 SYNAP · Sistema de Gestión de Certificados Académicos</p>
        </div>
      </div>
    </div>
  );
}
