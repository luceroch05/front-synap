'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Dashboard del Sistema Interno
 * Página principal después del login
 */
export default function SistemaPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    // Verificar autenticación
    const token = localStorage.getItem('token');
    const usuarioData = localStorage.getItem('usuario');

    if (!token) {
      router.push('/login');
      return;
    }

    if (usuarioData) {
      setUsuario(JSON.parse(usuarioData));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    router.push('/login');
  };

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navegación */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/30 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SYNAP Sistema
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{usuario.nombres} {usuario.apellidos}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full bg-white/40 backdrop-blur-sm border border-white/60 hover:bg-white/60 transition-all duration-300 text-gray-700 font-medium"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">
            Bienvenido, {usuario.nombres}
          </h2>
          <p className="text-gray-600">Sistema de Gestión de Certificados Académicos</p>
        </div>

        {/* Cards del Dashboard */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Programas', count: '0', icon: '📚', desc: 'Programas registrados' },
            { title: 'Participantes', count: '0', icon: '👥', desc: 'Participantes activos' },
            { title: 'Certificados', count: '0', icon: '🎓', desc: 'Certificados emitidos' },
          ].map((card, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-white/40 backdrop-blur-md border border-white/60 hover:bg-white/60 hover:shadow-xl transition-all duration-300"
            >
              <div className="text-4xl mb-3">{card.icon}</div>
              <div className="text-3xl font-bold text-gray-800 mb-1">{card.count}</div>
              <div className="text-sm font-medium text-gray-700 mb-1">{card.title}</div>
              <div className="text-xs text-gray-500">{card.desc}</div>
            </div>
          ))}
        </div>

        {/* Módulos del Sistema */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Módulos del Sistema</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Programas', icon: '📋', soon: true },
              { name: 'Participantes', icon: '👤', soon: true },
              { name: 'Inscripciones', icon: '✍️', soon: true },
              { name: 'Certificados', icon: '📜', soon: true },
              { name: 'Usuarios', icon: '⚙️', soon: true },
              { name: 'Configuración', icon: '🔧', soon: true },
            ].map((modulo, i) => (
              <button
                key={i}
                disabled={modulo.soon}
                className="p-6 rounded-2xl bg-white/40 backdrop-blur-md border border-white/60 hover:bg-white/60 transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-3xl mb-2">{modulo.icon}</div>
                <div className="font-semibold text-gray-800">{modulo.name}</div>
                {modulo.soon && (
                  <div className="text-xs text-gray-500 mt-1">Próximamente</div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
