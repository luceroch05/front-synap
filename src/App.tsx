import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import ValidarCertificadoPage from './pages/ValidarCertificadoPage'
import DashboardLayout from './layouts/DashboardLayout'
import HomePage from './pages/dashboard/HomePage'
import ProgramasPage from './pages/dashboard/ProgramasPage'
import UnidadesProgramaPage from './pages/dashboard/UnidadesProgramaPage'
import ParticipantesPage from './pages/dashboard/ParticipantesPage'
import GruposPage from './pages/dashboard/GruposPage'
import DetalleGrupoPage from './pages/dashboard/DetalleGrupoPage'
import NotasGrupoPage from './pages/dashboard/NotasGrupoPage'
import InscripcionesPage from './pages/dashboard/InscripcionesPage'
import CertificadosPage from './pages/dashboard/CertificadosPage'
import ConfigCertificadosPage from './pages/dashboard/ConfigCertificadosPage'
import EstadosInscripcionPage from './pages/dashboard/EstadosInscripcionPage'
import UsuariosPage from './pages/dashboard/UsuariosPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/validar-certificado" element={<ValidarCertificadoPage />} />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<HomePage />} />
        <Route path="programas" element={<ProgramasPage />} />
        <Route path="programas/:id/unidades" element={<UnidadesProgramaPage />} />
        <Route path="participantes" element={<ParticipantesPage />} />
        <Route path="grupos" element={<GruposPage />} />
        <Route path="grupos/:id" element={<DetalleGrupoPage />} />
        <Route path="grupos/:id/notas" element={<NotasGrupoPage />} />
        <Route path="inscripciones" element={<InscripcionesPage />} />
        <Route path="certificados" element={<CertificadosPage />} />
        <Route path="configuracion-certificados" element={<ConfigCertificadosPage />} />
        <Route path="estados-inscripcion" element={<EstadosInscripcionPage />} />
        <Route path="usuarios" element={<UsuariosPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
