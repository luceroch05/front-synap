import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/dashboard/Sidebar'

export default function DashboardLayout() {
  // Obtener usuario del localStorage si existe
  const usuarioStr = localStorage.getItem('usuario')
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : undefined

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F0F2F5' }}>
      <Sidebar usuario={usuario} />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
