import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '@/lib/api-config';

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
      const res = await fetch(`${API_URL}/auth/login`, {
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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#F0F2F5' }}>
      <Link
        to="/"
        className="fixed top-6 left-6 px-4 py-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700 font-medium text-sm shadow-sm"
      >
        ← Volver
      </Link>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#F7941D' }}>
              SYNAP
            </h1>
            <p className="text-gray-500 text-sm">Sistema de Certificados</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="error-bar">
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="usuario" className="form-label">
                Usuario o Correo
              </label>
              <input
                id="usuario"
                name="usuario"
                type="text"
                required
                autoComplete="username"
                disabled={loading}
                className="form-input disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="admin o tu@correo.com"
              />
            </div>

            <div>
              <label htmlFor="contrasena" className="form-label">
                Contraseña
              </label>
              <input
                id="contrasena"
                name="contrasena"
                type="password"
                required
                autoComplete="current-password"
                disabled={loading}
                className="form-input disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.99]"
              style={{ backgroundColor: '#F7941D' }}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            ¿Problemas para acceder? Contacta al administrador
          </p>
        </div>
      </div>
    </div>
  );
}
