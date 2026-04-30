import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Award, TrendingUp, Calendar, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProgramasService } from '@/lib/services/programas.service';

/**
 * Dashboard Principal
 * Vista de estadísticas y métricas del sistema
 */

interface StatCard {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  icon: React.ElementType;
  color: string;
  link?: string;
}


export default function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatCard[]>([
    {
      title: 'Programas Activos',
      value: 0,
      change: '+0%',
      trend: 'up',
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      link: '/dashboard/programas',
    },
    {
      title: 'Participantes',
      value: 0,
      change: '+0%',
      trend: 'up',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      link: '/dashboard/participantes',
    },
    {
      title: 'Certificados Emitidos',
      value: 0,
      change: '+0%',
      trend: 'up',
      icon: Award,
      color: 'from-green-500 to-green-600',
      link: '/dashboard/certificados',
    },
    {
      title: 'Inscripciones',
      value: 0,
      change: '+0%',
      trend: 'up',
      icon: FileText,
      color: 'from-orange-500 to-orange-600',
      link: '/dashboard/inscripciones',
    },
  ]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Verificar si hay token
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const programas = await ProgramasService.findAll();
      const programasActivos = programas.filter((p) => p.activo);

      setStats((prev) => [
        { ...prev[0], value: programasActivos.length },
        prev[1],
        prev[2],
        prev[3],
      ]);
    } catch (error: any) {
      console.error('Error loading stats:', error);
      // Si el error es de autenticación, redirigir al login
      if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                onClick={() => stat.link && navigate(stat.link)}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      stat.trend === 'up'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-500">{stat.title}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard/programas')}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Gestionar Programas</p>
                <p className="text-xs text-gray-500">Ver y crear programas</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard/participantes')}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Registrar Participante</p>
                <p className="text-xs text-gray-500">Añadir nuevo participante</p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard/certificados')}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Emitir Certificado</p>
                <p className="text-xs text-gray-500">Generar certificados</p>
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Activity Timeline */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Actividad Reciente</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Ver todo
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Sistema iniciado</p>
                <p className="text-sm text-gray-500">Comienza a crear programas</p>
              </div>
              <span className="text-xs text-gray-400">Ahora</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
