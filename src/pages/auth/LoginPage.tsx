import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const usuario = formData.get('usuario') as string;
    const contrasena = formData.get('contrasena') as string;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, contrasena }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
      <Link
        to="/"
        className="fixed top-6 left-6 px-4 py-2 rounded-full bg-white/40 backdrop-blur-sm border border-white/60 hover:bg-white/60 transition-all duration-300 text-gray-700 font-medium"
      >
        ← Volver
      </Link>

      <div className="w-full max-w-md">
        <div className="bg-white/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              SYNAP
            </h1>
            <p className="text-gray-600">Sistema de Certificados</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="usuario" className="block text-sm font-medium text-gray-700 mb-2">
                Usuario o Correo
              </label>
              <input
                id="usuario"
                name="usuario"
                type="text"
                required
                autoComplete="username"
                disabled={loading}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="admin o tu@correo.com"
              />
            </div>

            <div>
              <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                id="contrasena"
                name="contrasena"
                type="password"
                required
                autoComplete="current-password"
                disabled={loading}
                className="w-full px-4 py-3 rounded-2xl bg-white border border-gray-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Problemas para acceder? Contacta al administrador
          </p>
        </div>
      </div>
    </div>
  );
}
