'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  Award,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCog,
  FolderKanban,
  Shield,
} from 'lucide-react';
import { clsx } from 'clsx';

/**
 * Sidebar Moderno Minimalista
 * Con animaciones suaves estilo Pinterest
 */

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: 'Principal',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { icon: FolderKanban, label: 'Programas', href: '/dashboard/programas' },
      { icon: Users, label: 'Grupos', href: '/dashboard/grupos' },
      { icon: Users, label: 'Participantes', href: '/dashboard/participantes' },
      { icon: FileText, label: 'Inscripciones', href: '/dashboard/inscripciones' },
      { icon: Award, label: 'Certificados', href: '/dashboard/certificados' },
      { icon: Shield, label: 'Validar Certificado', href: '/validar-certificado' },
    ],
  },
  {
    title: 'Administración',
    items: [
      { icon: UserCog, label: 'Usuarios', href: '/dashboard/usuarios' },
      { icon: Settings, label: 'Config. Certificados', href: '/dashboard/configuracion-certificados' },
      { icon: FileText, label: 'Estados Inscripción', href: '/dashboard/estados-inscripcion' },
    ],
  },
];

interface SidebarProps {
  usuario?: {
    nombres: string;
    apellidos: string;
    rolId: number;
  };
}

export default function Sidebar({ usuario }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    router.push('/login');
  };

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isCollapsed ? '80px' : '280px',
      }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
      className="relative h-screen bg-white border-r border-gray-200 flex flex-col"
    >
      {/* Header con Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-sm">SYNAP</h1>
                <p className="text-[10px] text-gray-500">Sistema de Certificados</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={clsx(
            'p-1.5 rounded-lg hover:bg-gray-100 transition-colors',
            isCollapsed && 'mx-auto'
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </motion.button>
      </div>

      {/* User Info */}
      {usuario && (
        <div className="p-4 border-b border-gray-200">
          <div className={clsx('flex items-center gap-3', isCollapsed && 'justify-center')}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {usuario.nombres[0]}{usuario.apellidos[0]}
              </span>
            </div>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {usuario.nombres}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {usuario.rolId === 1 ? 'Administrador' : 'Admisión'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  {section.title}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <motion.button
                    key={itemIndex}
                    onClick={() => router.push(item.href)}
                    whileHover={{ x: isCollapsed ? 0 : 4 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className={clsx(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100',
                      isCollapsed && 'justify-center'
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                          className="font-medium text-sm truncate"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {item.badge && !isCollapsed && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full"
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <motion.button
          onClick={handleLogout}
          whileHover={{ x: isCollapsed ? 0 : 4 }}
          whileTap={{ scale: 0.98 }}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200',
            isCollapsed && 'justify-center'
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="font-medium text-sm"
              >
                Cerrar Sesión
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
}
