import Link from 'next/link';

/**
 * Landing Page Pública de SYNAP
 * Web institucional con información de servicios
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navegación */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/30 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SYNAP
          </h1>
          <Link
            href="/login"
            className="px-6 py-2 rounded-full bg-white/40 backdrop-blur-sm border border-white/60 hover:bg-white/60 transition-all duration-300 font-medium text-gray-700"
          >
            Acceder al Sistema
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Centro de Capacitación
              <br />
              Profesional SYNAP
            </h2>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              Formación académica de excelencia con certificación digital verificable.
              Impulsa tu carrera profesional con nuestros programas especializados.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/login"
                className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Gestionar Certificados
              </Link>
              <a
                href="#servicios"
                className="px-8 py-4 rounded-full bg-white/40 backdrop-blur-sm border border-white/60 hover:bg-white/60 transition-all duration-300 font-semibold text-gray-700"
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
          <h3 className="text-4xl font-bold text-center mb-16 text-gray-800">
            Nuestros Servicios
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Programas Académicos',
                desc: 'Cursos y talleres especializados en diversas áreas profesionales',
                icon: '📚',
              },
              {
                title: 'Certificación Digital',
                desc: 'Certificados verificables con código único de autenticidad',
                icon: '🎓',
              },
              {
                title: 'Gestión Integral',
                desc: 'Sistema completo para administración de participantes y programas',
                icon: '💼',
              },
            ].map((servicio, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl bg-white/40 backdrop-blur-md border border-white/60 hover:bg-white/60 hover:shadow-xl transition-all duration-300"
              >
                <div className="text-5xl mb-4">{servicio.icon}</div>
                <h4 className="text-2xl font-semibold mb-3 text-gray-800">
                  {servicio.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">{servicio.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-white/20 backdrop-blur-sm border-t border-white/20">
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          <p className="font-medium">© 2024 SYNAP. Centro de Capacitación Profesional</p>
          <p className="text-sm mt-2">Sistema de Gestión de Certificados Académicos</p>
        </div>
      </footer>
    </div>
  );
}
