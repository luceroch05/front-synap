import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const NAV_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  .nav-link {
    position: relative; color: #4A5568; text-decoration: none;
    font-size: 14px; font-weight: 500; padding: 4px 0;
    transition: color 0.25s; font-family: 'Inter', sans-serif;
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
    font-family: 'Inter', sans-serif;
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
    backdrop-filter: blur(6px); font-family: 'Inter', sans-serif;
  }
  .btn-ghost:hover {
    border-color: #1A2A3A; background: #1A2A3A; color: #fff;
    box-shadow: 0 6px 20px -6px rgba(26,42,58,0.35);
  }

  .logo-img { height: 42px; object-fit: contain; }

  .nav-links-desktop { display: flex !important; }
  .nav-mobile-btn    { display: none  !important; }

  @media (max-width: 900px) {
    .nav-links-desktop { display: none  !important; }
    .nav-mobile-btn    { display: flex  !important; }
  }
`

const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6"  x2="21" y2="6"  />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)
const IconX = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <line x1="18" y1="6"  x2="6"  y2="18" />
    <line x1="6"  y1="6"  x2="18" y2="18" />
  </svg>
)
const IconArrowRight = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)

// Inyección síncrona al importar el módulo — evita FOUC en primer render
if (typeof document !== 'undefined') {
  const _id = 'pub-nav-styles'
  if (!document.getElementById(_id)) {
    const _tag = document.createElement('style')
    _tag.id = _id
    _tag.textContent = NAV_STYLES
    document.head.appendChild(_tag)
  }
}

export default function PublicNavbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const font = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      padding: '0 2rem', fontFamily: font,
      backgroundColor: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(14px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(232,237,242,0.8)' : 'none',
      boxShadow: scrolled ? '0 2px 24px rgba(0,0,0,0.06)' : 'none',
      transition: 'all 0.4s cubic-bezier(.4,0,.2,1)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 76 }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img
            src="/convenio-1770145665324-723494311.png"
            alt="SYNAP Logo"
            className="logo-img"
            style={{ height: 42, objectFit: 'contain' }}
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement
              el.style.display = 'none'
              const fb = el.nextSibling as HTMLElement
              if (fb) fb.style.display = 'flex'
            }}
          />
          {/* Fallback */}
          <div style={{ display: 'none', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #1A2A3A, #2d4a63)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#E8B84B', fontWeight: 800, fontSize: 18 }}>S</span>
            </div>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#1A2A3A', letterSpacing: -0.5 }}>SYNAP</span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="nav-links-desktop" style={{ gap: 36, alignItems: 'center' }}>
          <a href="/#programas"      className="nav-link">Programas</a>
          <a href="/#como-funciona"  className="nav-link">Cómo funciona</a>
          <a href="/#nosotros"       className="nav-link">Nosotros</a>
          <Link to="/inscripcion"         className="btn-ghost"   style={{ padding: '8px 20px', fontSize: 13 }}>Inscribirme</Link>
          <Link to="/validar-certificado" className="btn-ghost"   style={{ padding: '8px 20px', fontSize: 13 }}>Validar Certificado</Link>
          <Link to="/login"               className="btn-primary" style={{ padding: '9px 24px', fontSize: 13 }}>
            Ingresar <IconArrowRight />
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="nav-mobile-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#1A2A3A' }}
        >
          {menuOpen ? <IconX /> : <IconMenu />}
        </button>
      </div>

      {/* Mobile menu */}
      <div style={{
        maxHeight: menuOpen ? 320 : 0, overflow: 'hidden',
        transition: 'max-height 0.4s cubic-bezier(.4,0,.2,1)',
        backgroundColor: 'rgba(255,255,255,0.98)',
        backdropFilter: 'blur(14px)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 0 24px', gap: 4 }}>
          {[
            ['/#programas', 'Programas'],
            ['/#como-funciona', 'Cómo funciona'],
            ['/#nosotros', 'Nosotros'],
          ].map(([href, label]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}
              style={{ padding: '12px 24px', color: '#1A2A3A', textDecoration: 'none', fontSize: 15, fontWeight: 500 }}>
              {label}
            </a>
          ))}
          <div style={{ padding: '8px 24px', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            <Link to="/inscripcion"         className="btn-primary" style={{ justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>Inscribirme</Link>
            <Link to="/validar-certificado" className="btn-ghost"   style={{ justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>Validar Certificado</Link>
            <Link to="/login"               className="btn-primary" style={{ justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>Ingresar</Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
