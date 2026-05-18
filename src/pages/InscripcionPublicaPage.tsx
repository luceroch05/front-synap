import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_URL } from '@/lib/api-config';
import PublicNavbar from '@/components/PublicNavbar';

interface GrupoPublico {
  id: number;
  nombreGrupo: string;
  fechaInicio: string;
  fechaFin: string;
  modalidad: string;
  programa?: {
    id: number;
    nombre: string;
    tipoPrograma?: { id: number; nombre: string };
  };
}

interface FormData {
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
}

const emptyForm: FormData = {
  tipoDocumento: 'DNI',
  numeroDocumento: '',
  nombres: '',
  apellidos: '',
  email: '',
  telefono: '',
};

const STYLES = `
  @keyframes insc-fadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes insc-float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-10px); }
  }
  @keyframes insc-gradientShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes insc-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .insc-course-card {
    background: #fff; border-radius: 22px;
    border: 1px solid #E8EDF2; cursor: pointer; overflow: hidden;
    transition: transform 0.35s cubic-bezier(.34,1.56,.64,1),
                box-shadow 0.35s ease, border-color 0.25s;
    text-decoration: none; display: block; color: inherit;
  }
  .insc-course-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 24px 48px -16px rgba(0,0,0,0.14);
    border-color: #E8B84B;
  }

  .insc-input {
    width: 100%; border: 1.5px solid #E8EDF2; border-radius: 12px;
    padding: 11px 16px; font-size: 14px; color: #1A2A3A;
    font-family: 'Inter', sans-serif; background: #fff;
    transition: border-color 0.2s, box-shadow 0.2s; outline: none;
  }
  .insc-input:focus {
    border-color: #E8B84B;
    box-shadow: 0 0 0 3px rgba(232,184,75,0.12);
  }
  .insc-input-error  { border-color: #EF4444 !important; }
  .insc-input-error:focus { box-shadow: 0 0 0 3px rgba(239,68,68,0.1) !important; }

  .insc-select {
    border: 1.5px solid #E8EDF2; border-radius: 12px;
    padding: 11px 16px; font-size: 14px; color: #1A2A3A;
    font-family: 'Inter', sans-serif; background: #fff;
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none; cursor: pointer;
  }
  .insc-select:focus {
    border-color: #E8B84B;
    box-shadow: 0 0 0 3px rgba(232,184,75,0.12);
  }

  .insc-btn-gold {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 14px 28px; border-radius: 50px;
    background: linear-gradient(135deg, #E8B84B, #D4A017);
    color: #1A2A3A; font-size: 15px; font-weight: 700; border: none; cursor: pointer;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    box-shadow: 0 8px 28px -8px rgba(232,184,75,0.6);
    font-family: 'Inter', sans-serif;
  }
  .insc-btn-gold:hover { transform: translateY(-2px); box-shadow: 0 14px 36px -8px rgba(232,184,75,0.7); }
  .insc-btn-gold:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .insc-label {
    display: block; font-size: 12px; font-weight: 600;
    color: #6B7A8A; letter-spacing: 0.3px; margin-bottom: 7px;
    font-family: 'Inter', sans-serif;
  }

  @media (max-width: 768px) {
    .insc-grid-3 { grid-template-columns: 1fr !important; }
    .insc-grid-2 { grid-template-columns: 1fr !important; }
    .insc-hero-title { font-size: 2rem !important; }
    .insc-form-body { padding: 24px 20px !important; }
    .insc-success-card { padding: 40px 24px !important; }
  }
  @media (min-width: 640px) and (max-width: 1024px) {
    .insc-grid-3 { grid-template-columns: repeat(2, 1fr) !important; }
  }
`;

const modalidadCfg: Record<string, { label: string; color: string; bg: string }> = {
  PRESENCIAL: { label: 'Presencial', color: '#D4A017', bg: 'rgba(232,184,75,0.12)' },
  VIRTUAL:    { label: 'Virtual',    color: '#3B82F6', bg: 'rgba(59,130,246,0.1)'  },
  MIXTA:      { label: 'Mixta',      color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)'  },
};

// ── SVG Icons ──
const IcoArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);
const IcoArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const IcoSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IcoCalendar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IcoPin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const IcoUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IcoGrad = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);
const IcoBook = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);
const IcoCheck = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IcoCheckSm = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IcoSpin = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    style={{ animation: 'insc-spin 0.9s linear infinite', display: 'inline-block' }}>
    <path d="M21 12a9 9 0 1 1-18 0" />
  </svg>
);
const IcoAlert = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

// ── Reveal hook ──
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function formatFecha(fecha: string) {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// Inyección síncrona al importar
if (typeof document !== 'undefined') {
  const _id = 'insc-styles'
  if (!document.getElementById(_id)) {
    const _tag = document.createElement('style')
    _tag.id = _id
    _tag.textContent = STYLES
    document.head.appendChild(_tag)
  }
}

// ── Component ──
export default function InscripcionPublicaPage() {
  const navigate = useNavigate();
  const { cursoSlug } = useParams<{ cursoSlug?: string }>();

  const [step, setStep] = useState<'cursos' | 'formulario' | 'exito'>('cursos');
  const [grupos, setGrupos] = useState<GrupoPublico[]>([]);
  const [loadingGrupos, setLoadingGrupos] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<GrupoPublico | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [buscandoDoc, setBuscandoDoc] = useState(false);
  const [docEncontrado, setDocEncontrado] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmacion, setConfirmacion] = useState<{ nombres: string; apellidos: string; grupo: string } | null>(null);

  const cursosRef = useReveal();
  const formRef   = useReveal();


  // Fetch groups — if grupoId in URL, auto-select after load
  useEffect(() => {
    fetch(`${API_URL}/grupos-programas/publicos`)
      .then((r) => r.json())
      .then((data) => {
        const list: GrupoPublico[] = Array.isArray(data) ? data : [];
        setGrupos(list);
        if (cursoSlug) {
          const parts = cursoSlug.split('-');
          const id = parseInt(parts[parts.length - 1]);
          const found = !isNaN(id) ? list.find((g) => g.id === id) : undefined;
          if (found) {
            setGrupoSeleccionado(found);
            setStep('formulario');
          } else {
            navigate('/inscripcion', { replace: true });
          }
        }
      })
      .catch(() => setGrupos([]))
      .finally(() => setLoadingGrupos(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gruposFiltrados = grupos.filter((g) => {
    const q = busqueda.toLowerCase();
    return (
      g.nombreGrupo.toLowerCase().includes(q) ||
      g.programa?.nombre.toLowerCase().includes(q) ||
      g.programa?.tipoPrograma?.nombre.toLowerCase().includes(q)
    );
  });

  const irAlFormulario = (grupo: GrupoPublico) => {
    setGrupoSeleccionado(grupo);
    setForm(emptyForm);
    setDocEncontrado(false);
    setError('');
    setErrors({});
    const nombre = grupo.programa?.nombre || grupo.nombreGrupo;
    navigate(`/inscripcion/${slugify(nombre)}-${grupo.id}`);
    setStep('formulario');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBuscarDocumento = async () => {
    if (!form.numeroDocumento.trim()) return;
    setBuscandoDoc(true);
    setDocEncontrado(false);
    try {
      const res = await fetch(
        `${API_URL}/participantes/buscar?tipoDocumento=${form.tipoDocumento}&numeroDocumento=${form.numeroDocumento}`,
        { headers: { 'Content-Type': 'application/json' } },
      );
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setForm((prev) => ({
            ...prev,
            nombres: data.nombres || '',
            apellidos: data.apellidos || '',
            email: data.email || '',
            telefono: data.telefono || '',
          }));
          setDocEncontrado(true);
        }
      }
    } catch {
      // silencioso
    } finally {
      setBuscandoDoc(false);
    }
  };

  const validar = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.tipoDocumento) e.tipoDocumento = 'Requerido';
    if (!form.numeroDocumento.trim()) e.numeroDocumento = 'Requerido';
    if (!form.nombres.trim()) e.nombres = 'Requerido';
    if (!form.apellidos.trim()) e.apellidos = 'Requerido';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Correo inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grupoSeleccionado || !validar()) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/inscripciones/publica`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoDocumento: form.tipoDocumento,
          numeroDocumento: form.numeroDocumento.trim(),
          nombres: form.nombres.trim(),
          apellidos: form.apellidos.trim(),
          email: form.email.trim() || undefined,
          telefono: form.telefono.trim() || undefined,
          grupoId: grupoSeleccionado.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al procesar la inscripción');
      setConfirmacion({
        nombres: data.participante.nombres,
        apellidos: data.participante.apellidos,
        grupo: grupoSeleccionado.programa?.nombre || grupoSeleccionado.nombreGrupo,
      });
      setStep('exito');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al procesar la inscripción');
    } finally {
      setSaving(false);
    }
  };

  const font = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

  return (
    <div style={{ fontFamily: font, backgroundColor: '#F8FAFE', minHeight: '100vh' }}>

      {/* Navbar idéntico al de la landing */}
      <PublicNavbar />

      {/* Spacer igual que la landing */}
      <div style={{ height: 76 }} />

      {/* ══════════════════════════════════════════
          STEP 1 — LISTA DE CURSOS
      ══════════════════════════════════════════ */}
      {step === 'cursos' && (
        <>
          {/* Hero oscuro — igual que las secciones dark de la landing */}
          <section style={{
            background: 'linear-gradient(160deg, #0a1520 0%, #1A2A3A 60%, #0f2236 100%)',
            padding: '64px 2rem 88px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '-30%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,184,75,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-20%', right: '5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />

            <div style={{ maxWidth: 740, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
              {/* Kicker — mismo estilo que la landing */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 22, animation: 'insc-fadeInUp 0.6s ease both' }}>
                <div style={{ width: 26, height: 1, background: '#E8B84B' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#E8B84B', letterSpacing: 3 }}>
                  PROGRAMAS DISPONIBLES
                </span>
                <div style={{ width: 26, height: 1, background: '#E8B84B' }} />
              </div>

              <h1
                className="insc-hero-title"
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3.4rem)',
                  lineHeight: 1.1, color: '#fff',
                  fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 18,
                  animation: 'insc-fadeInUp 0.7s ease both', animationDelay: '0.1s',
                }}
              >
                Elige tu{' '}
                <span style={{
                  background: 'linear-gradient(90deg, #E8B84B 0%, #f5d080 50%, #E8B84B 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  animation: 'insc-gradientShift 4s linear infinite',
                }}>
                  programa
                </span>
              </h1>

              <p style={{
                color: 'rgba(255,255,255,0.5)', fontSize: 15, lineHeight: 1.75,
                maxWidth: 480, margin: '0 auto 36px',
                animation: 'insc-fadeInUp 0.7s ease both', animationDelay: '0.18s',
              }}>
                Selecciona el curso en el que deseas inscribirte y completa tu registro en minutos.
              </p>

              {/* Search */}
              <div style={{ position: 'relative', maxWidth: 500, margin: '0 auto', animation: 'insc-fadeInUp 0.7s ease both', animationDelay: '0.26s' }}>
                <div style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }}>
                  <IcoSearch />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por nombre del curso o programa..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  style={{
                    width: '100%', padding: '14px 20px 14px 48px',
                    borderRadius: 50, border: '2px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)',
                    color: '#fff', fontSize: 14, fontFamily: font, outline: 'none',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(232,184,75,0.45)'; e.currentTarget.style.background = 'rgba(255,255,255,0.11)'; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';  e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                />
              </div>
            </div>

            {/* Wave — misma que usa la landing para transición entre secciones */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0, pointerEvents: 'none' }}>
              <svg viewBox="0 0 1440 44" preserveAspectRatio="none" style={{ width: '100%', height: 44, display: 'block' }}>
                <path d="M0 44L1440 0V44H0Z" fill="#F8FAFE" />
              </svg>
            </div>
          </section>

          {/* Grid de tarjetas */}
          <section style={{ padding: '56px 2rem 88px' }}>
            <div ref={cursosRef.ref} style={{ maxWidth: 1280, margin: '0 auto' }}>

              {loadingGrupos ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '80px 0', gap: 12 }}>
                  <IcoSpin size={26} />
                  <span style={{ color: '#6B7A8A', fontSize: 14, fontWeight: 500 }}>Cargando programas...</span>
                </div>
              ) : gruposFiltrados.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                  <div style={{ width: 68, height: 68, borderRadius: 20, background: 'rgba(232,184,75,0.08)', border: '1px solid rgba(232,184,75,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#E8B84B' }}>
                    <IcoBook />
                  </div>
                  <p style={{ fontSize: 18, fontWeight: 700, color: '#1A2A3A', marginBottom: 8 }}>No hay programas disponibles</p>
                  <p style={{ fontSize: 14, color: '#8E9EAE' }}>
                    {busqueda ? 'Intenta con otra búsqueda.' : 'Vuelve más tarde para ver los programas disponibles.'}
                  </p>
                </div>
              ) : (
                <div className="insc-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                  {gruposFiltrados.map((grupo, i) => {
                    const mod = modalidadCfg[grupo.modalidad] || { label: grupo.modalidad, color: '#6B7A8A', bg: 'rgba(107,122,138,0.1)' };
                    return (
                      <div
                        key={grupo.id}
                        className="insc-course-card"
                        onClick={() => irAlFormulario(grupo)}
                        style={{
                          animation: cursosRef.visible ? 'insc-fadeInUp 0.6s ease both' : 'none',
                          animationDelay: `${0.04 + (i % 6) * 0.07}s`,
                        }}
                      >
                        <div style={{ padding: '24px 24px 18px' }}>
                          {grupo.programa?.tipoPrograma && (
                            <div style={{
                              display: 'inline-block', fontSize: 10, fontWeight: 700,
                              color: '#E8B84B', background: 'rgba(232,184,75,0.1)',
                              padding: '3px 12px', borderRadius: 100,
                              letterSpacing: 0.4, marginBottom: 14,
                            }}>
                              {grupo.programa.tipoPrograma.nombre}
                            </div>
                          )}
                          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A2A3A', marginBottom: 5, lineHeight: 1.35 }}>
                            {grupo.programa?.nombre || grupo.nombreGrupo}
                          </h3>
                          <p style={{ fontSize: 13, color: '#8E9EAE', marginBottom: 18, lineHeight: 1.5 }}>
                            {grupo.nombreGrupo}
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#6B7A8A' }}>
                              <IcoCalendar />
                              {formatFecha(grupo.fechaInicio)} – {formatFecha(grupo.fechaFin)}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              <IcoPin />
                              <span style={{ fontSize: 10, fontWeight: 700, color: mod.color, background: mod.bg, padding: '3px 10px', borderRadius: 100 }}>
                                {mod.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Footer de la tarjeta — igual que program-card de la landing */}
                        <div style={{ borderTop: '1px solid #F0F4F8', padding: '13px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#E8B84B' }}>Inscribirme</span>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(232,184,75,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8B84B' }}>
                            <IcoArrowRight />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* ══════════════════════════════════════════
          STEP 2 — FORMULARIO  (/inscripcion/:grupoId)
      ══════════════════════════════════════════ */}
      {step === 'formulario' && grupoSeleccionado && (
        <section style={{ padding: '40px 2rem 88px' }}>
          <div style={{ maxWidth: 660, margin: '0 auto' }}>

            {/* Volver */}
            <button
              onClick={() => { navigate('/inscripcion'); setStep('cursos'); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32,
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 14, color: '#6B7A8A', fontFamily: font, padding: 0,
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#1A2A3A'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#6B7A8A'}
            >
              <IcoArrowLeft /> Volver a programas
            </button>

            {/* Resumen del curso — dark card igual que el hero */}
            <div style={{
              background: 'linear-gradient(135deg, #1A2A3A 0%, #0f2236 100%)',
              borderRadius: 22, padding: '24px 28px', marginBottom: 24,
              position: 'relative', overflow: 'hidden',
              animation: 'insc-fadeInUp 0.5s ease both',
            }}>
              <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,184,75,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
                <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#E8B84B', letterSpacing: 2, marginBottom: 10 }}>
                    PROGRAMA SELECCIONADO
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 5, letterSpacing: -0.3 }}>
                    {grupoSeleccionado.programa?.nombre || grupoSeleccionado.nombreGrupo}
                  </h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 16 }}>
                    {grupoSeleccionado.nombreGrupo}
                  </p>
                  <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                      <IcoCalendar />
                      {formatFecha(grupoSeleccionado.fechaInicio)} – {formatFecha(grupoSeleccionado.fechaFin)}
                    </div>
                    {(() => {
                      const mod = modalidadCfg[grupoSeleccionado.modalidad] || { label: grupoSeleccionado.modalidad, color: '#fff', bg: 'rgba(255,255,255,0.12)' };
                      return <span style={{ fontSize: 10, fontWeight: 700, color: mod.color, background: mod.bg, padding: '3px 12px', borderRadius: 100 }}>{mod.label}</span>;
                    })()}
                  </div>
                </div>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(232,184,75,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8B84B', flexShrink: 0 }}>
                  <IcoGrad />
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div
              ref={formRef.ref}
              style={{
                background: '#fff', borderRadius: 22,
                border: '1px solid #E8EDF2',
                boxShadow: '0 12px 40px -12px rgba(0,0,0,0.08)',
                overflow: 'hidden',
                animation: formRef.visible ? 'insc-fadeInUp 0.6s ease both' : 'none',
                animationDelay: '0.1s',
              }}
            >
              {/* Header del form */}
              <div style={{ padding: '20px 28px', borderBottom: '1px solid #F0F4F8', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(26,42,58,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A2A3A' }}>
                  <IcoUser />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2A3A' }}>Datos personales</div>
                  <div style={{ fontSize: 12, color: '#8E9EAE', marginTop: 2 }}>Completa tu información para inscribirte</div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="insc-form-body" style={{ padding: '28px' }}>

                {/* Documento */}
                <div style={{ marginBottom: 20 }}>
                  <label className="insc-label">Tipo y número de documento</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <select
                      value={form.tipoDocumento}
                      onChange={(e) => setForm({ ...form, tipoDocumento: e.target.value })}
                      className="insc-select"
                      style={{ width: 108, flexShrink: 0 }}
                    >
                      <option value="DNI">DNI</option>
                      <option value="CE">C.E.</option>
                      <option value="PASAPORTE">Pasaporte</option>
                      <option value="RUC">RUC</option>
                    </select>
                    <div style={{ display: 'flex', flex: 1, gap: 8 }}>
                      <input
                        type="text"
                        placeholder="Número de documento"
                        value={form.numeroDocumento}
                        onChange={(e) => { setForm({ ...form, numeroDocumento: e.target.value }); setDocEncontrado(false); }}
                        className={`insc-input${errors.numeroDocumento ? ' insc-input-error' : ''}`}
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={handleBuscarDocumento}
                        disabled={buscandoDoc || !form.numeroDocumento.trim()}
                        title="Buscar si ya estás registrado"
                        style={{
                          padding: '0 15px', borderRadius: 12, flexShrink: 0,
                          background: 'rgba(26,42,58,0.05)', border: '1.5px solid #E8EDF2',
                          color: '#1A2A3A', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s', fontFamily: font,
                        }}
                        onMouseEnter={e => { if (!(e.currentTarget as HTMLButtonElement).disabled) { (e.currentTarget as HTMLElement).style.background = '#1A2A3A'; (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = '#1A2A3A'; } }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(26,42,58,0.05)'; (e.currentTarget as HTMLElement).style.color = '#1A2A3A'; (e.currentTarget as HTMLElement).style.borderColor = '#E8EDF2'; }}
                      >
                        {buscandoDoc ? <IcoSpin /> : <IcoSearch />}
                      </button>
                    </div>
                  </div>
                  {errors.numeroDocumento && <p style={{ fontSize: 11.5, color: '#EF4444', marginTop: 5 }}>{errors.numeroDocumento}</p>}
                  {docEncontrado && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: '#059669', fontWeight: 500 }}>
                      <div style={{ width: 17, height: 17, borderRadius: '50%', background: 'rgba(5,150,105,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IcoCheckSm />
                      </div>
                      Datos encontrados y precargados automáticamente
                    </div>
                  )}
                </div>

                {/* Nombres + Apellidos */}
                <div className="insc-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  <div>
                    <label className="insc-label">Nombres <span style={{ color: '#E8B84B' }}>*</span></label>
                    <input
                      type="text" placeholder="Tus nombres" value={form.nombres}
                      onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                      className={`insc-input${errors.nombres ? ' insc-input-error' : ''}`}
                    />
                    {errors.nombres && <p style={{ fontSize: 11.5, color: '#EF4444', marginTop: 5 }}>{errors.nombres}</p>}
                  </div>
                  <div>
                    <label className="insc-label">Apellidos <span style={{ color: '#E8B84B' }}>*</span></label>
                    <input
                      type="text" placeholder="Tus apellidos" value={form.apellidos}
                      onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                      className={`insc-input${errors.apellidos ? ' insc-input-error' : ''}`}
                    />
                    {errors.apellidos && <p style={{ fontSize: 11.5, color: '#EF4444', marginTop: 5 }}>{errors.apellidos}</p>}
                  </div>
                </div>

                {/* Email + Teléfono */}
                <div className="insc-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
                  <div>
                    <label className="insc-label">Correo electrónico</label>
                    <input
                      type="email" placeholder="correo@ejemplo.com" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={`insc-input${errors.email ? ' insc-input-error' : ''}`}
                    />
                    {errors.email && <p style={{ fontSize: 11.5, color: '#EF4444', marginTop: 5 }}>{errors.email}</p>}
                  </div>
                  <div>
                    <label className="insc-label">Teléfono</label>
                    <input
                      type="tel" placeholder="999 999 999" value={form.telefono}
                      onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                      className="insc-input"
                    />
                  </div>
                </div>

                {error && (
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20,
                    background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)',
                    borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#DC2626',
                  }}>
                    <IcoAlert />
                    <span style={{ marginTop: 1 }}>{error}</span>
                  </div>
                )}

                <button type="submit" disabled={saving} className="insc-btn-gold">
                  {saving ? <><IcoSpin /> Procesando...</> : <>Confirmar inscripción <IcoArrowRight /></>}
                </button>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          STEP 3 — ÉXITO
      ══════════════════════════════════════════ */}
      {step === 'exito' && confirmacion && (
        <section style={{ padding: '60px 2rem 100px', display: 'flex', alignItems: 'center', minHeight: 'calc(100vh - 76px)' }}>
          <div style={{ maxWidth: 560, margin: '0 auto', width: '100%' }}>
            <div
              className="insc-success-card"
              style={{
                background: 'linear-gradient(135deg, #f8f9ff 0%, #fffbf2 100%)',
                border: '1px solid rgba(232,184,75,0.2)',
                borderRadius: 28, padding: '60px 48px',
                boxShadow: '0 32px 80px -20px rgba(232,184,75,0.15)',
                position: 'relative', overflow: 'hidden', textAlign: 'center',
                animation: 'insc-fadeInUp 0.6s ease both',
              }}
            >
              <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,184,75,0.12), transparent)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,42,58,0.04), transparent)', pointerEvents: 'none' }} />

              {/* Check dorado flotante */}
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, #E8B84B, #D4A017)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 28px', position: 'relative', zIndex: 1, color: '#1A2A3A',
                boxShadow: '0 16px 40px -8px rgba(232,184,75,0.55)',
                animation: 'insc-float 3.5s ease-in-out infinite',
              }}>
                <IcoCheck />
              </div>

              <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: '#1A2A3A', marginBottom: 12, letterSpacing: -0.5, position: 'relative', zIndex: 1 }}>
                ¡Inscripción exitosa!
              </h2>
              <p style={{ fontSize: 15, color: '#6B7A8A', marginBottom: 28, lineHeight: 1.75, position: 'relative', zIndex: 1 }}>
                <strong style={{ color: '#1A2A3A' }}>{confirmacion.nombres} {confirmacion.apellidos}</strong>,<br />
                has sido inscrito correctamente en:
              </p>

              <div style={{
                background: 'linear-gradient(135deg, #1A2A3A, #0f2236)',
                borderRadius: 16, padding: '18px 24px', marginBottom: 36,
                display: 'flex', alignItems: 'center', gap: 14,
                position: 'relative', zIndex: 1,
              }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(232,184,75,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8B84B', flexShrink: 0 }}>
                  <IcoBook />
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', textAlign: 'left', lineHeight: 1.35 }}>
                  {confirmacion.grupo}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                <button
                  onClick={() => { setStep('cursos'); setGrupoSeleccionado(null); setForm(emptyForm); setConfirmacion(null); navigate('/inscripcion'); }}
                  className="btn-ghost"
                >
                  Inscribir a otro programa
                </button>
                <button onClick={() => navigate('/')} className="btn-primary">
                  Ir al inicio <IcoArrowRight />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
