import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, Award, Settings,
  ChevronLeft, ChevronRight, LogOut, UserCog, FolderKanban, Shield,
} from 'lucide-react';

const EXPANDED = 256;
const COLLAPSED = 80;
const EASE = 'cubic-bezier(0.4,0,0.2,1)';
const DUR = '0.25s';

const sections = [
  {
    label: 'Principal',
    items: [{ icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' }],
  },
  {
    label: 'Gestión',
    items: [
      { icon: FolderKanban, label: 'Programas',      to: '/dashboard/programas'    },
      { icon: Users,        label: 'Grupos',          to: '/dashboard/grupos'       },
      { icon: Users,        label: 'Participantes',   to: '/dashboard/participantes'},
      { icon: FileText,     label: 'Inscripciones',   to: '/dashboard/inscripciones'},
      { icon: Award,        label: 'Certificados',    to: '/dashboard/certificados' },
      { icon: Shield,       label: 'Validar Cert.',   to: '/validar-certificado'    },
    ],
  },
  {
    label: 'Admin',
    items: [
      { icon: UserCog,  label: 'Usuarios',       to: '/dashboard/usuarios'                      },
      { icon: Settings, label: 'Config. Certs.', to: '/dashboard/configuracion-certificados'    },
      { icon: FileText, label: 'Estados',         to: '/dashboard/estados-inscripcion'           },
    ],
  },
];

interface SidebarProps {
  usuario?: { nombres: string; apellidos: string; rolId: number };
}

export default function Sidebar({ usuario }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <aside
      style={{
        width: collapsed ? COLLAPSED : EXPANDED,
        minWidth: collapsed ? COLLAPSED : EXPANDED,
        transition: `width ${DUR} ${EASE}, min-width ${DUR} ${EASE}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
        background: '#0D1F35',
        borderRight: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* ── CABECERA ── */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 10px',
          flexShrink: 0,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Icono + nombre */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, overflow: 'hidden' }}>
          <div
            style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #FFA733, #F7941D, #E07B15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 14, userSelect: 'none' }}>S</span>
          </div>

          {/* Texto que desaparece */}
          <div
            style={{
              overflow: 'hidden',
              maxWidth: collapsed ? 0 : 160,
              opacity: collapsed ? 0 : 1,
              transition: `max-width ${DUR} ${EASE}, opacity 0.18s ease`,
            }}
          >
            <p style={{ color: '#fff', fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '0.04em' }}>
              SYNAP
            </p>
            <p style={{ color: '#4A6A8A', fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 3, whiteSpace: 'nowrap' }}>
              Neurodesarrollo
            </p>
          </div>
        </div>

        {/* Botón toggle — siempre visible porque está dentro del espacio de 80px */}
        <ToggleBtn collapsed={collapsed} onClick={() => setCollapsed(c => !c)} />
      </div>

      {/* ── NAVEGACIÓN ── */}
      <nav
        className="hide-scrollbar"
        style={{ flex: 1, overflowY: 'auto', padding: '14px 8px' }}
      >
        {sections.map(section => (
          <div key={section.label} style={{ marginBottom: 18 }}>
            {/* Label de sección */}
            <div
              style={{
                overflow: 'hidden',
                maxHeight: collapsed ? 0 : 22,
                opacity: collapsed ? 0 : 1,
                marginBottom: collapsed ? 0 : 4,
                transition: `max-height ${DUR} ${EASE}, opacity 0.18s ease, margin ${DUR} ${EASE}`,
              }}
            >
              <p style={{
                padding: '0 10px',
                fontSize: 9, fontWeight: 700,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: '#F7941D', opacity: 0.7, whiteSpace: 'nowrap',
              }}>
                {section.label}
              </p>
            </div>

            {section.items.map(item => (
              <NavItem
                key={item.to}
                icon={<item.icon size={17} />}
                label={item.label}
                active={pathname === item.to}
                collapsed={collapsed}
                onClick={() => navigate(item.to)}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '8px 8px 10px' }}>
        {/* Info usuario */}
        {usuario && (
          <div
            style={{
              overflow: 'hidden',
              maxHeight: collapsed ? 0 : 56,
              opacity: collapsed ? 0 : 1,
              transition: `max-height ${DUR} ${EASE}, opacity 0.18s ease`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px' }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #F7941D, #E07B15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 11, fontWeight: 700,
              }}>
                {usuario.nombres[0]}{usuario.apellidos[0]}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ color: '#fff', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {usuario.nombres} {usuario.apellidos}
                </p>
                <p style={{ color: '#4A6A8A', fontSize: 10, whiteSpace: 'nowrap' }}>
                  {usuario.rolId === 1 ? 'Administrador' : 'Admisión'}
                </p>
              </div>
            </div>
          </div>
        )}

        <NavItem
          icon={<LogOut size={17} />}
          label="Cerrar sesión"
          active={false}
          collapsed={collapsed}
          onClick={logout}
          danger
        />
      </div>
    </aside>
  );
}

/* ─── Botón de toggle ─── */
function ToggleBtn({ collapsed, onClick }: { collapsed: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flexShrink: 0,
        width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer',
        background: hovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)',
        color: hovered ? '#fff' : '#5A7A9F',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s, color 0.15s',
      }}
    >
      {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
    </button>
  );
}

/* ─── Item de navegación ─── */
function NavItem({
  icon, label, active, collapsed, onClick, danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
  danger?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  const bg = active
    ? 'rgba(247,148,29,0.13)'
    : hovered
    ? (danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.06)')
    : 'transparent';

  const color = danger
    ? (hovered ? '#F87171' : '#5A7A9F')
    : active ? '#F7941D'
    : (hovered ? '#fff' : '#7A9ABF');

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={collapsed ? label : undefined}
      style={{
        width: '100%', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: 10,
        padding: '9px 10px',
        borderRadius: 10,
        marginBottom: 2,
        background: bg,
        color,
        position: 'relative',
        transition: 'background 0.15s, color 0.15s',
      }}
    >
      {/* Indicador activo */}
      {active && (
        <span style={{
          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
          width: 3, height: 20, borderRadius: '0 3px 3px 0', background: '#F7941D',
        }} />
      )}

      <span style={{ flexShrink: 0, display: 'flex' }}>{icon}</span>

      {/* Label */}
      <span style={{
        fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
        overflow: 'hidden', textAlign: 'left',
        maxWidth: collapsed ? 0 : 150,
        opacity: collapsed ? 0 : 1,
        transition: `max-width ${DUR} ${EASE}, opacity 0.18s ease`,
      }}>
        {label}
      </span>
    </button>
  );
}
