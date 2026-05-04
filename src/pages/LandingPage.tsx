import { Link } from 'react-router-dom'

/**
 * Landing Page Pública de SYNAP
 * Web institucional con información de servicios
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F0F2F5' }}>
      {/* Navegación */}
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold" style={{ color: '#F7941D' }}>
            SYNAP
          </h1>
          <div className="flex items-center gap-3">
            <Link
              to="/validar-certificado"
              className="px-5 py-2 rounded-xl text-white font-medium text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: '#0D1F35' }}
            >
              Validar Certificado
            </Link>
            <Link
              to="/login"
              className="px-5 py-2 rounded-xl text-white font-medium text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: '#F7941D' }}
            >
              Acceder al Sistema
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold mb-6 leading-tight" style={{ color: '#0D1F35' }}>
              Centro de Capacitación
              <br />
              <span style={{ color: '#F7941D' }}>Profesional SYNAP</span>
            </h2>
            <p className="text-lg text-gray-600 mb-12 leading-relaxed">
              Formación académica de excelencia con certificación digital verificable.
              Impulsa tu carrera profesional con nuestros programas especializados.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/validar-certificado"
                className="px-8 py-4 rounded-xl text-white font-semibold transition-all hover:opacity-90 hover:shadow-lg"
                style={{ backgroundColor: '#0D1F35' }}
              >
                Validar Certificado
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 rounded-xl text-white font-semibold transition-all hover:opacity-90 hover:shadow-lg"
                style={{ backgroundColor: '#F7941D' }}
              >
                Gestionar Certificados
              </Link>
              <a
                href="#servicios"
                className="px-8 py-4 rounded-xl bg-white border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Nuestros Servicios
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12" style={{ color: '#0D1F35' }}>
            Nuestros Servicios
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Programas Académicos',
                desc: 'Cursos y talleres especializados en diversas áreas profesionales',
                icon: '📚',
                link: null,
              },
              {
                title: 'Validar Certificado',
                desc: 'Verifica la autenticidad de cualquier certificado emitido por SYNAP',
                icon: '🔍',
                link: '/validar-certificado',
              },
              {
                title: 'Gestión Integral',
                desc: 'Sistema completo para administración de participantes y programas',
                icon: '💼',
                link: null,
              },
            ].map((servicio, i) => (
              <div
                key={i}
                className="p-7 rounded-2xl bg-white border border-gray-200 hover:shadow-md transition-all duration-300"
              >
                <div className="text-4xl mb-4">{servicio.icon}</div>
                <h4 className="text-xl font-semibold mb-3" style={{ color: '#0D1F35' }}>
                  {servicio.title}
                </h4>
                <p className="text-gray-500 leading-relaxed text-sm mb-4">{servicio.desc}</p>
                {servicio.link && (
                  <Link
                    to={servicio.link}
                    className="inline-block mt-2 text-sm font-medium transition-colors"
                    style={{ color: '#F7941D' }}
                  >
                    Ir a validación →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          <p className="font-medium" style={{ color: '#0D1F35' }}>© 2024 SYNAP. Centro de Capacitación Profesional</p>
          <p className="text-sm mt-1 text-gray-400">Sistema de Gestión de Certificados Académicos</p>
        </div>
      </footer>
    </div>
  )
}
