import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Users, Award, FileText,
  ArrowUpRight, FolderKanban, UserPlus, BadgeCheck, TrendingUp,
} from 'lucide-react';
import { ProgramasService } from '@/lib/services/programas.service';

interface Stat {
  icon: React.ElementType;
  label: string;
  key: string;
  value: number;
  accentColor: string;
  href: string;
}

const STATS: Stat[] = [
  { icon: BookOpen,  label: 'Programas Activos', key: 'programas',    value: 0, accentColor: '#E8B84B', href: '/dashboard/programas'    },
  { icon: Users,     label: 'Participantes',      key: 'participantes', value: 0, accentColor: '#1A3254', href: '/dashboard/participantes' },
  { icon: Award,     label: 'Certificados',       key: 'certificados',  value: 0, accentColor: '#0D9488', href: '/dashboard/certificados'  },
  { icon: FileText,  label: 'Inscripciones',      key: 'inscripciones', value: 0, accentColor: '#7C3AED', href: '/dashboard/inscripciones' },
];

const ACTIONS = [
  { icon: FolderKanban, label: 'Programas',     desc: 'Gestionar programas académicos',  href: '/dashboard/programas',    color: '#E8B84B' },
  { icon: UserPlus,     label: 'Participantes', desc: 'Registrar nuevos participantes',   href: '/dashboard/participantes', color: '#1A3254' },
  { icon: BadgeCheck,   label: 'Certificados',  desc: 'Emitir y administrar certificados', href: '/dashboard/certificados', color: '#0D9488' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stat[]>(STATS);
  const [loading, setLoading] = useState(true);

  const raw = localStorage.getItem('usuario');
  const usuario = raw ? JSON.parse(raw) : null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  const today = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    ProgramasService.findAll()
      .then(data =>
        setStats(prev =>
          prev.map(s => s.key === 'programas' ? { ...s, value: data.filter(p => p.activo).length } : s)
        )
      )
      .catch(err => {
        if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          navigate('/login');
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F0F2F5' }}>

      {/* ── Cabecera de página ── */}
      <div className="bg-white px-8 py-6" style={{ borderBottom: '1px solid #E5E7EB' }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: '#E8B84B' }}>
              {greeting}{usuario ? `, ${usuario.nombres}` : ''}
            </p>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#0D1F35' }}>
              Panel de Control
            </h1>
            <p className="text-sm text-gray-400 mt-0.5 capitalize">{today}</p>
          </div>

          <div
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ backgroundColor: '#FEF3E2', color: '#E8B84B' }}
          >
            <TrendingUp size={15} />
            Sistema activo
          </div>
        </div>
      </div>

      <div className="px-8 py-8 space-y-8 max-w-7xl mx-auto">

        {/* ── KPIs ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.35 }}
                onClick={() => navigate(stat.href)}
                className="bg-white rounded-2xl p-6 cursor-pointer group relative overflow-hidden"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)' }}
              >
                {/* Barra superior de color */}
                <div
                  className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl"
                  style={{ backgroundColor: stat.accentColor }}
                />

                <div className="flex items-start justify-between mb-6 pt-1">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.accentColor}18` }}
                  >
                    <Icon size={19} style={{ color: stat.accentColor }} />
                  </div>
                  <ArrowUpRight
                    size={15}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ color: stat.accentColor }}
                  />
                </div>

                <p
                  className="text-[2rem] font-extrabold leading-none mb-1 tabular-nums"
                  style={{ color: loading ? '#E5E7EB' : '#0D1F35' }}
                >
                  {loading ? '—' : stat.value}
                </p>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* ── Acciones rápidas ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-gray-400">
              Acciones rápidas
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ACTIONS.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.07, duration: 0.35 }}
                  onClick={() => navigate(action.href)}
                  className="bg-white rounded-2xl p-5 text-left flex items-center gap-4 group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                    style={{ backgroundColor: `${action.color}18` }}
                  >
                    <Icon size={20} style={{ color: action.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-tight" style={{ color: '#0D1F35' }}>
                      {action.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
                  </div>
                  <ArrowUpRight
                    size={15}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: action.color }}
                  />
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Actividad reciente ── */}
        <div>
          <h2 className="text-xs font-bold tracking-[0.15em] uppercase text-gray-400 mb-4">
            Actividad reciente
          </h2>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.35 }}
            className="bg-white rounded-2xl"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}
          >
            <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: '#FEF3E2' }}
              >
                <Award size={22} style={{ color: '#E8B84B' }} />
              </div>
              <p className="text-sm font-semibold text-gray-700">Sin actividad reciente</p>
              <p className="text-xs text-gray-400 mt-1.5 max-w-xs leading-relaxed">
                Las acciones del sistema aparecerán aquí. Comienza creando un programa o registrando participantes.
              </p>
              <button
                onClick={() => navigate('/dashboard/programas')}
                className="mt-5 text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors hover:opacity-90"
                style={{ backgroundColor: '#FEF3E2', color: '#E8B84B' }}
              >
                Ir a Programas →
              </button>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
