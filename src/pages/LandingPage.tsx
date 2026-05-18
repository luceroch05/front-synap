import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import PublicNavbar from '../components/PublicNavbar'

// ── Keyframes inyectados una sola vez ──
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInLeft {
    from { opacity: 0; transform: translateX(-32px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes fadeInRight {
    from { opacity: 0; transform: translateX(32px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-14px); }
  }
  @keyframes floatSlow {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-20px) rotate(3deg); }
  }
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(232,184,75,0.35); }
    50%       { box-shadow: 0 0 0 12px rgba(232,184,75,0); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes countUp {
    from { opacity: 0; transform: scale(0.7); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes gradientShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  .nav-link {
    position: relative; color: #4A5568; text-decoration: none;
    font-size: 14px; font-weight: 500; padding: 4px 0;
    transition: color 0.25s;
  }
  .nav-link::after {
    content: ''; position: absolute; bottom: -2px; left: 0;
    width: 0; height: 2px; background: #E8B84B;
    border-radius: 2px; transition: width 0.3s ease;
  }
  .nav-link:hover { color: #1A2A3A; }
  .nav-link:hover::after { width: 100%; }

  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 13px 30px; border-radius: 50px;
    background: linear-gradient(135deg, #1A2A3A 0%, #263d52 100%);
    color: #fff; text-decoration: none;
    font-size: 14px; font-weight: 600; border: none; cursor: pointer;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    box-shadow: 0 6px 24px -6px rgba(26,42,58,0.45);
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px -8px rgba(26,42,58,0.55);
  }

  .btn-ghost {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 13px 26px; border-radius: 50px;
    border: 1.5px solid #D1D9E6; background: rgba(255,255,255,0.8);
    color: #1A2A3A; font-size: 14px; font-weight: 500; cursor: pointer;
    transition: all 0.25s ease; text-decoration: none;
    backdrop-filter: blur(6px);
  }
  .btn-ghost:hover {
    border-color: #1A2A3A; background: #1A2A3A; color: #fff;
    box-shadow: 0 6px 20px -6px rgba(26,42,58,0.35);
  }

  .program-card {
    background: #fff; border-radius: 22px; padding: 28px;
    border: 1px solid #E8EDF2; cursor: pointer;
    transition: transform 0.35s cubic-bezier(.34,1.56,.64,1),
                box-shadow 0.35s ease, border-color 0.25s;
  }
  .program-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 24px 48px -16px rgba(0,0,0,0.14);
    border-color: #E8B84B;
  }

  .step-circle {
    transition: transform 0.3s ease, background 0.3s ease;
  }
  .step-item:hover .step-circle {
    transform: scale(1.1);
    background: #E8B84B !important;
    color: #fff !important;
  }

  .stat-card {
    transition: transform 0.3s ease;
  }
  .stat-card:hover { transform: translateY(-4px); }

  .visible { animation-play-state: running !important; }

  .logo-img { height: 42px; object-fit: contain; }
  .logo-img-footer { height: 36px; object-fit: contain; }

  @media (max-width: 900px) {
    .hero-split-left  { flex: unset !important; width: 100% !important; padding: 120px 28px 60px !important; }
    .hero-split-right { display: none !important; }
    .hero-right { display: none !important; }
    .steps-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
    .programs-grid { grid-template-columns: 1fr !important; }
    .footer-grid { flex-direction: column !important; align-items: flex-start !important; }
    .nav-links-desktop { display: none !important; }
    .nav-mobile-btn { display: flex !important; }
  }
`

// ── SVG Icons ──
const IconArrowRight = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const IconPlay = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
)
const IconBrain = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 4a4 4 0 0 1 3.5 6A4 4 0 0 1 12 18a4 4 0 0 1-3.5-6A4 4 0 0 1 12 4z" />
    <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M19.07 4.93l-1.41 1.41M17.66 17.66l1.41 1.41M6.34 17.66l-1.41 1.41M6.34 6.34L4.93 4.93" />
  </svg>
)
const IconHeart = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)
const IconTarget = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
)
const IconBuilding = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="9" y1="6" x2="15" y2="6" /><line x1="9" y1="10" x2="15" y2="10" />
    <line x1="9" y1="14" x2="15" y2="14" /><line x1="9" y1="18" x2="12" y2="18" />
  </svg>
)
const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#E8B84B" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)
const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

// ── Data ──
const programs = [
  { icon: <IconBrain />, title: 'Terapia de Lenguaje', desc: 'Evaluación, diagnóstico e intervención de trastornos de comunicación y habla.', tag: 'Alta demanda', duration: '120 h', color: '#E8B84B', bg: 'rgba(232,184,75,0.08)' },
  { icon: <IconHeart />, title: 'Terapia Ocupacional', desc: 'Rehabilitación funcional y desarrollo de habilidades para la vida diaria.', tag: 'Certificado', duration: '100 h', color: '#3B82F6', bg: 'rgba(59,130,246,0.08)' },
  { icon: <IconTarget />, title: 'Psicología Clínica', desc: 'Intervención psicológica, manejo emocional y técnicas basadas en evidencia.', tag: 'Nuevo', duration: '150 h', color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
  { icon: <IconBuilding />, title: 'Administración de Centros', desc: 'Gestión integral de centros terapéuticos y coordinación de equipos.', tag: 'Ejecutivo', duration: '80 h', color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' },
]
const stats = [
  { value: '1,200+', label: 'Profesionales' },
  { value: '48', label: 'Programas' },
  { value: '98%', label: 'Satisfacción' },
  { value: '15+', label: 'Años exp.' },
]
const steps = [
  { num: '01', title: 'Elige tu programa', desc: 'Selecciona la especialidad que mejor se adapte a tu carrera profesional.' },
  { num: '02', title: 'Capacítate online', desc: 'Accede a módulos actualizados con expertos en activo cuando quieras.' },
  { num: '03', title: 'Certifícate', desc: 'Obtén tu certificado digital con código de verificación verificable.' },
]
const testimonials = [
  { quote: 'La certificación SYNAP transformó mi carrera. Los conocimientos son aplicables desde el primer día.', name: 'Dra. Andrea Quispe', role: 'Terapeuta de Lenguaje', init: 'AQ' },
  { quote: 'Excelente plataforma, el contenido está actualizado y los instructores son de primer nivel.', name: 'Lic. Carlos Romero', role: 'Terapeuta Ocupacional', init: 'CR' },
]

// ── Hook: IntersectionObserver para animar al scroll ──
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

// Inyección síncrona — evita FOUC en el logo del footer y otros elementos
if (typeof document !== 'undefined') {
  const _id = 'landing-styles'
  if (!document.getElementById(_id)) {
    const _tag = document.createElement('style')
    _tag.id = _id
    _tag.textContent = STYLES
    document.head.appendChild(_tag)
  }
}

// ── Componente ──
export default function LandingPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setActiveTestimonial(p => (p + 1) % testimonials.length), 5000)
    return () => clearInterval(timer)
  }, [])


  const hero = useReveal()
  const howSection = useReveal()
  const programsSection = useReveal()
  const testimonialSection = useReveal()
  const ctaSection = useReveal()

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", backgroundColor: '#FFFFFF', minHeight: '100vh', overflowX: 'hidden' }}>

      <PublicNavbar />

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'stretch',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* LEFT panel — dark */}
        <div className="hero-split-left" style={{
          flex: '0 0 52%', background: 'linear-gradient(160deg, #0a1520 0%, #1A2A3A 60%, #0f2236 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '140px 72px 80px 80px', position: 'relative', overflow: 'hidden',
        }}>
          {/* Noise overlay */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
            opacity: 0.6,
          }} />
          {/* Gold glow */}
          <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,184,75,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />

          <div ref={hero.ref} style={{ position: 'relative', zIndex: 1 }}>
            {/* Kicker label */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 32,
              animation: hero.visible ? 'fadeInUp 0.7s ease both' : 'none',
              animationDelay: '0.05s',
            }}>
              <div style={{ width: 32, height: 1, background: '#E8B84B' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#E8B84B', letterSpacing: 3 }}>
                PLATAFORMA DE CERTIFICACIÓN PROFESIONAL
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(2.8rem, 4vw, 4.6rem)',
              lineHeight: 1.08, color: '#fff',
              fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 28,
              animation: hero.visible ? 'fadeInUp 0.8s ease both' : 'none',
              animationDelay: '0.15s',
            }}>
              Certifica tu{' '}
              <br />
              <span style={{
                background: 'linear-gradient(90deg, #E8B84B 0%, #f5d080 50%, #E8B84B 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradientShift 4s linear infinite',
              }}>
                excelencia
              </span>
              <br />
              clínica
            </h1>

            <p style={{
              color: 'rgba(255,255,255,0.55)', fontSize: 16, lineHeight: 1.75,
              marginBottom: 42, maxWidth: 440,
              animation: hero.visible ? 'fadeInUp 0.8s ease both' : 'none',
              animationDelay: '0.25s',
            }}>
              Formación especializada con respaldo institucional y certificado digital verificable en tiempo real. Diseñado para profesionales de la salud que no se conforman.
            </p>

            {/* CTA */}
            <div style={{
              display: 'flex', gap: 14, flexWrap: 'wrap',
              animation: hero.visible ? 'fadeInUp 0.8s ease both' : 'none',
              animationDelay: '0.35s',
            }}>
              <Link to="/login" className="btn-primary" style={{ background: 'linear-gradient(135deg, #E8B84B, #D4A017)', color: '#1A2A3A', boxShadow: '0 8px 32px -8px rgba(232,184,75,0.6)', fontWeight: 700 }}>
                Comenzar ahora <IconArrowRight />
              </Link>
              <button className="btn-ghost" style={{ border: '1.5px solid rgba(255,255,255,0.18)', color: '#fff', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}>
                <IconPlay /> Ver demo
              </button>
            </div>

            {/* Stats strip */}
            <div style={{
              display: 'flex', gap: 0, marginTop: 56,
              paddingTop: 36, borderTop: '1px solid rgba(255,255,255,0.1)',
              animation: hero.visible ? 'fadeInUp 0.8s ease both' : 'none',
              animationDelay: '0.45s',
            }}>
              {stats.map((s, i) => (
                <div key={i} style={{
                  flex: 1, paddingRight: 24,
                  borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  paddingLeft: i > 0 ? 24 : 0,
                }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -1 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', fontWeight: 500, marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT panel — light with card mockup */}
        <div className="hero-split-right" style={{
          flex: '1 1 0', background: '#F0F4F8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '120px 48px 80px',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Subtle grid */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'linear-gradient(#d8e0ea 1px, transparent 1px), linear-gradient(90deg, #d8e0ea 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.4,
          }} />
          {/* Gradient fade over grid */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 60% 50%, rgba(240,244,248,0) 30%, #F0F4F8 80%)', pointerEvents: 'none' }} />

          {/* Dashboard mockup */}
          <div className="hero-right" style={{
            position: 'relative', zIndex: 1, width: '100%', maxWidth: 440,
            animation: hero.visible ? 'fadeInRight 0.9s ease both' : 'none',
            animationDelay: '0.2s',
          }}>
            {/* Main terminal card */}
            <div style={{
              background: 'linear-gradient(160deg, #13253a 0%, #0a1929 100%)',
              borderRadius: 24, padding: '24px',
              boxShadow: '0 40px 90px -20px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05)',
              animation: 'floatSlow 7s ease-in-out infinite',
            }}>
              {/* Titlebar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['#FF5F57', '#E8B84B', '#28C840'].map((c, i) => <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: c }} />)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: '4px 12px' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#28C840', boxShadow: '0 0 6px #28C840' }} />
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>synap.certificados.pe</span>
                </div>
              </div>

              {/* White cert area */}
              <div style={{ background: '#fff', borderRadius: 16, padding: '22px 22px 18px' }}>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 9, color: '#8E9EAE', letterSpacing: 2.5, fontWeight: 700, marginBottom: 5 }}>CERTIFICADO OFICIAL · SYNAP</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#1A2A3A', lineHeight: 1.2 }}>Terapia de Lenguaje</div>
                    <div style={{ fontSize: 12, color: '#8E9EAE', marginTop: 4 }}>Módulo Avanzado · 120 horas</div>
                  </div>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(135deg, #fff8e7, #ffe8a0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4A017', flexShrink: 0 }}>
                    <IconBrain />
                  </div>
                </div>

                <div style={{ height: 1, background: '#F0F4F8', marginBottom: 16 }} />

                {/* Recipient */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 9, color: '#8E9EAE', fontWeight: 700, letterSpacing: 1.5 }}>OTORGADO A</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2A3A', marginTop: 4 }}>Dra. Andrea Quispe</div>
                  </div>
                  <div style={{ background: '#E8F5E9', padding: '5px 10px', borderRadius: 30, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <IconCheck /><span style={{ fontSize: 10, fontWeight: 700, color: '#2E7D32' }}>VERIFICADO</span>
                  </div>
                </div>

                {/* Code + mini QR */}
                <div style={{ background: '#F8FAFE', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 2.5, width: 44, height: 44, flexShrink: 0 }}>
                    {[1,1,1,1,1,1,0,0,0,1,1,0,1,0,1,1,0,0,0,1,1,1,1,1,1].map((v, i) => (
                      <div key={i} style={{ borderRadius: 1.5, background: v ? '#1A2A3A' : 'transparent' }} />
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: '#8E9EAE', fontWeight: 600 }}>CÓDIGO DE VERIFICACIÓN</div>
                    <div style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: '#1A2A3A', marginTop: 3 }}>SYN-2024-8841-LT</div>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div style={{ marginTop: 18, padding: '0 2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Progreso del módulo</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#E8B84B' }}>87%</span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
                  <div style={{ height: '100%', width: '87%', borderRadius: 3, background: 'linear-gradient(90deg, #E8B84B, #f5d080)', boxShadow: '0 0 12px rgba(232,184,75,0.5)' }} />
                </div>
              </div>
            </div>

            {/* Floating — verified badge */}
            <div style={{
              position: 'absolute', bottom: -10, left: -30,
              background: '#fff', borderRadius: 16, padding: '12px 16px',
              boxShadow: '0 20px 50px -12px rgba(0,0,0,0.2), 0 0 0 1px rgba(232,184,75,0.15)',
              display: 'flex', alignItems: 'center', gap: 11,
              animation: 'float 4.5s ease-in-out infinite', animationDelay: '1s',
              minWidth: 200,
            }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg, #E8B84B, #D4A017)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                <IconShield />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1A2A3A' }}>Verificación instantánea</div>
                <div style={{ fontSize: 11, color: '#8E9EAE', marginTop: 1 }}>Certificado en blockchain</div>
              </div>
            </div>

            {/* Floating — activity */}
            <div style={{
              position: 'absolute', top: -12, right: -28,
              background: 'linear-gradient(135deg, #1A2A3A, #0d1f2d)',
              borderRadius: 16, padding: '12px 16px',
              boxShadow: '0 16px 40px -10px rgba(0,0,0,0.4)',
              animation: 'float 5s ease-in-out infinite', animationDelay: '0.4s',
            }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600, letterSpacing: 0.5 }}>INSCRITOS HOY</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex' }}>
                  {[
                    { c: '#E8B84B', l: 'AQ' }, { c: '#3B82F6', l: 'CR' }, { c: '#10B981', l: 'MP' }
                  ].map((av, i) => (
                    <div key={i} style={{
                      width: 26, height: 26, borderRadius: '50%', background: av.c,
                      border: '2.5px solid #1A2A3A', marginLeft: i > 0 ? -8 : 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 700, color: '#1A2A3A',
                    }}>{av.l}</div>
                  ))}
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>+24</span>
              </div>
            </div>

            {/* Floating — rating */}
            <div style={{
              position: 'absolute', top: '50%', right: -32,
              background: '#fff', borderRadius: 14, padding: '10px 14px',
              boxShadow: '0 10px 30px -8px rgba(0,0,0,0.15)',
              animation: 'float 6s ease-in-out infinite', animationDelay: '2s',
            }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
                {[...Array(5)].map((_, i) => <IconStar key={i} />)}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#1A2A3A' }}>4.9 / 5.0</div>
              <div style={{ fontSize: 10, color: '#8E9EAE' }}>1,200 reseñas</div>
            </div>
          </div>
        </div>

        {/* Diagonal divider overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0, zIndex: 2, pointerEvents: 'none' }}>
          <svg viewBox="0 0 1440 50" preserveAspectRatio="none" style={{ width: '100%', height: 50, display: 'block' }}>
            <path d="M0 50L1440 0V50H0Z" fill="#F8FAFE" />
          </svg>
        </div>
      </section>

      {/* ── TRUSTED BY ── */}
      <section style={{ backgroundColor: '#F8FAFE', padding: '40px 2rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: '#8E9EAE', letterSpacing: 2, fontWeight: 600, marginBottom: 24 }}>CONFIADO POR INSTITUCIONES LÍDERES</p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 48, flexWrap: 'wrap' }}>
            {['Centro de Terapias Crecemos', 'Clínica San Pablo', 'Centro Médico Nacional', 'Fundación Salud Total', 'Red de Terapeutas'].map((inst, i) => (
              <span key={i} style={{
                fontSize: 13, fontWeight: 600, color: '#A0ADB8',
                padding: '8px 20px', borderRadius: 8,
                border: '1px solid #E8EDF2', background: '#fff',
                transition: 'all 0.25s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#1A2A3A'; (e.currentTarget as HTMLElement).style.borderColor = '#1A2A3A' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#A0ADB8'; (e.currentTarget as HTMLElement).style.borderColor = '#E8EDF2' }}
              >{inst}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section id="como-funciona" style={{ backgroundColor: '#F8FAFE', padding: '100px 2rem 120px' }}>
        <div ref={howSection.ref} style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{
            textAlign: 'center', marginBottom: 72,
            animation: howSection.visible ? 'fadeInUp 0.7s ease both' : 'none',
          }}>
            <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, color: '#E8B84B', letterSpacing: 3, padding: '5px 16px', background: 'rgba(232,184,75,0.1)', borderRadius: 100, marginBottom: 16 }}>
              CÓMO FUNCIONA
            </div>
            <h2 style={{ fontSize: 'clamp(1.7rem, 2.8vw, 2.5rem)', fontWeight: 800, color: '#1A2A3A', marginBottom: 16, letterSpacing: -0.5 }}>
              Tu camino a la certificación
            </h2>
            <p style={{ fontSize: 16, color: '#6B7A8A', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              Un proceso simple, diseñado para profesionales con agendas exigentes
            </p>
          </div>

          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, position: 'relative' }}>
            {/* Connector line */}
            <div style={{ position: 'absolute', top: 35, left: '18%', right: '18%', height: 2, background: 'linear-gradient(90deg, #E8B84B, rgba(232,184,75,0.3))', zIndex: 0, display: 'none' }} />

            {steps.map((step, i) => (
              <div key={i} className="step-item" style={{
                textAlign: 'center', position: 'relative', zIndex: 1,
                animation: howSection.visible ? 'fadeInUp 0.7s ease both' : 'none',
                animationDelay: `${0.15 + i * 0.15}s`,
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: '#fff', border: '2.5px solid #E8B84B',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: '0 8px 24px -8px rgba(232,184,75,0.35)',
                  position: 'relative',
                }} className="step-circle">
                  <span style={{ fontSize: 22, fontWeight: 800, color: '#E8B84B', fontVariantNumeric: 'tabular-nums' }}>{step.num}</span>
                </div>
                <div style={{
                  background: '#fff', borderRadius: 18, padding: '24px 22px',
                  border: '1px solid #E8EDF2',
                  boxShadow: '0 4px 16px -4px rgba(0,0,0,0.06)',
                  transition: 'box-shadow 0.3s, transform 0.3s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px -8px rgba(232,184,75,0.2)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px -4px rgba(0,0,0,0.06)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}
                >
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1A2A3A', marginBottom: 10 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: '#6B7A8A', lineHeight: 1.7 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROGRAMAS ── */}
      <section id="programas" style={{ padding: '110px 2rem', backgroundColor: '#FFFFFF' }}>
        <div ref={programsSection.ref} style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{
            marginBottom: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20,
            animation: programsSection.visible ? 'fadeInUp 0.7s ease both' : 'none',
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#E8B84B', letterSpacing: 3, padding: '5px 16px', background: 'rgba(232,184,75,0.1)', borderRadius: 100, display: 'inline-block', marginBottom: 16 }}>ESPECIALIDADES</div>
              <h2 style={{ fontSize: 'clamp(1.7rem, 2.8vw, 2.5rem)', fontWeight: 800, color: '#1A2A3A', margin: 0, letterSpacing: -0.5 }}>
                Programas de Capacitación
              </h2>
            </div>
            <Link to="/programas" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: '#E8B84B', textDecoration: 'none' }}>
              Ver todos <IconArrowRight />
            </Link>
          </div>

          <div className="programs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 24 }}>
            {programs.map((p, i) => (
              <div key={i} className="program-card" style={{
                animation: programsSection.visible ? 'fadeInUp 0.7s ease both' : 'none',
                animationDelay: `${0.1 + i * 0.12}s`,
              }}>
                {/* Icon */}
                <div style={{
                  width: 54, height: 54, borderRadius: 14,
                  background: p.bg, color: p.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20, transition: 'transform 0.3s',
                }}>
                  {p.icon}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: p.color,
                    background: p.bg, padding: '3px 10px', borderRadius: 100,
                    letterSpacing: 0.5,
                  }}>{p.tag}</span>
                  <span style={{ fontSize: 11, color: '#8E9EAE', fontWeight: 500 }}>{p.duration}</span>
                </div>

                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1A2A3A', marginBottom: 10 }}>{p.title}</h3>
                <p style={{ fontSize: 13.5, color: '#6B7A8A', lineHeight: 1.7, marginBottom: 22 }}>{p.desc}</p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: p.color }}>
                  Ver programa <IconArrowRight />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section id="nosotros" style={{
        background: 'linear-gradient(145deg, #0d1f2d 0%, #1A2A3A 50%, #1e3448 100%)',
        padding: '110px 2rem', color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,184,75,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div ref={testimonialSection.ref} style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700, color: '#E8B84B', letterSpacing: 3,
            padding: '5px 16px', background: 'rgba(232,184,75,0.1)', borderRadius: 100, marginBottom: 40,
            border: '1px solid rgba(232,184,75,0.2)',
            animation: testimonialSection.visible ? 'fadeInUp 0.7s ease both' : 'none',
          }}>
            TESTIMONIOS
          </div>

          {/* Quote rotator */}
          {testimonials.map((t, i) => (
            <div key={i} style={{
              display: i === activeTestimonial ? 'block' : 'none',
              animation: 'fadeInUp 0.6s ease both',
            }}>
              <div style={{ fontSize: 72, color: 'rgba(232,184,75,0.2)', fontFamily: 'Georgia', lineHeight: 0.7, marginBottom: 28 }}>"</div>
              <p style={{ fontSize: 'clamp(1.1rem, 2vw, 1.45rem)', lineHeight: 1.7, marginBottom: 40, fontStyle: 'italic', color: 'rgba(255,255,255,0.9)', maxWidth: 700, margin: '0 auto 40px' }}>
                "{t.quote}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <div style={{
                  width: 54, height: 54, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #E8B84B, #D4A017)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 700, color: '#1A2A3A',
                  boxShadow: '0 6px 20px rgba(232,184,75,0.4)',
                }}>{t.init}</div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}

          {/* Dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 36 }}>
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)} style={{
                width: i === activeTestimonial ? 24 : 8, height: 8, borderRadius: 4,
                background: i === activeTestimonial ? '#E8B84B' : 'rgba(255,255,255,0.25)',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(.4,0,.2,1)',
              }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: '110px 2rem', backgroundColor: '#fff', textAlign: 'center' }}>
        <div ref={ctaSection.ref} style={{
          maxWidth: 740, margin: '0 auto',
          animation: ctaSection.visible ? 'fadeInUp 0.7s ease both' : 'none',
        }}>
          {/* Glow card */}
          <div style={{
            background: 'linear-gradient(135deg, #f8f9ff 0%, #fffbf2 100%)',
            border: '1px solid rgba(232,184,75,0.2)',
            borderRadius: 28, padding: '60px 48px',
            boxShadow: '0 30px 80px -20px rgba(232,184,75,0.15)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,184,75,0.12), transparent)', pointerEvents: 'none' }} />

            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: 'linear-gradient(135deg, #1A2A3A, #263d52)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 12px 30px -8px rgba(26,42,58,0.4)',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E8B84B" strokeWidth="1.8">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>

            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, color: '#1A2A3A', marginBottom: 16, letterSpacing: -0.5 }}>
              ¿Listo para el siguiente nivel?
            </h2>
            <p style={{ fontSize: 16, color: '#6B7A8A', marginBottom: 40, lineHeight: 1.7 }}>
              Únete a más de <strong style={{ color: '#1A2A3A' }}>1,200 profesionales</strong> que ya confían en SYNAP para su formación continua.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/inscripcion" className="btn-primary" style={{ padding: '14px 36px' }}>
                Inscribirme ahora <IconArrowRight />
              </Link>
              <Link to="/validar-certificado" className="btn-ghost" style={{ padding: '14px 30px' }}>
                Validar certificado
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: 'linear-gradient(180deg, #0d1f2d 0%, #0a1520 100%)',
        padding: '64px 2rem 32px', color: '#fff',
      }}>
        <div className="footer-grid" style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 48, marginBottom: 48 }}>

          {/* Brand */}
          <div style={{ maxWidth: 280 }}>
            <div style={{ marginBottom: 20, display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '8px 14px' }}>
              <img
                src="/convenio-1770145665324-723494311.png"
                alt="SYNAP Logo"
                className="logo-img-footer"
                style={{ height: 36, objectFit: 'contain' }}
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement
                  el.style.display = 'none'
                  const fb = el.nextSibling as HTMLElement
                  if (fb) fb.style.display = 'flex'
                }}
              />
              {/* Fallback */}
              <div style={{ display: 'none', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #E8B84B, #D4A017)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#1A2A3A', fontWeight: 800, fontSize: 18 }}>S</span>
                </div>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>SYNAP</span>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
              Centro de Capacitación Profesional especializado en salud y gestión terapéutica.
            </p>
            {/* Social icons placeholder */}
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              {['in', 'tw', 'fb'].map((s, i) => (
                <div key={i} style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)',
                  cursor: 'pointer', transition: 'all 0.25s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(232,184,75,0.15)'; (e.currentTarget as HTMLElement).style.color = '#E8B84B'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,184,75,0.3)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)' }}
                >{s}</div>
              ))}
            </div>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
            {[
              { title: 'Programas', links: ['Terapia de Lenguaje', 'Terapia Ocupacional', 'Psicología Clínica', 'Administración'] },
              { title: 'Sistema', links: ['Validar Certificado', 'Acceder al Sistema', 'Soporte técnico', 'API Docs'] },
              { title: 'Contacto', links: ['info@synap.edu', '+51 1 234 5678', 'Lima, Perú', 'Lun–Vie 9–18h'] },
            ].map((col, ci) => (
              <div key={ci}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#E8B84B', letterSpacing: 2, marginBottom: 20 }}>{col.title.toUpperCase()}</div>
                {col.links.map((link, li) => (
                  <div key={li} style={{
                    fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 12,
                    cursor: 'pointer', transition: 'color 0.2s',
                  }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)'}
                  >{link}</div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ maxWidth: 1280, margin: '0 auto', paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            © 2024 SYNAP · Sistema de Gestión de Certificados Académicos
          </span>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacidad', 'Términos', 'Cookies'].map((item, i) => (
              <span key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'}
              >{item}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
