import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/dashboard/Sidebar'

export default function DashboardLayout() {
  // Obtener usuario del localStorage si existe
  const usuarioStr = localStorage.getItem('usuario')
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : undefined

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar usuario={usuario} />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  )
}
