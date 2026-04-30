import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, UserCog, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { UsuariosService, Usuario, CreateUsuarioDto, UpdateUsuarioDto } from '@/lib/services/usuarios.service';
import { RolesService, Rol } from '@/lib/services/roles.service';

const emptyForm: CreateUsuarioDto = { nombres: '', apellidos: '', usuario: '', correo: '', contrasena: '', rolId: 0 };

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateUsuarioDto>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const [u, r] = await Promise.all([UsuariosService.findAll(), RolesService.findAll()]);
      setUsuarios(u); setRoles(r);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  const abrirCrear = () => {
    setForm({ ...emptyForm, rolId: roles[0]?.id || 0 });
    setEditingId(null); setModalOpen(true);
  };

  const abrirEditar = (u: Usuario) => {
    setForm({ nombres: u.nombres, apellidos: u.apellidos, usuario: u.usuario, correo: u.correo, contrasena: '', rolId: u.rolId });
    setEditingId(u.id); setModalOpen(true);
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editingId) {
        const update: UpdateUsuarioDto = { nombres: form.nombres, apellidos: form.apellidos, usuario: form.usuario, correo: form.correo, rolId: form.rolId };
        if (form.contrasena) update.contrasena = form.contrasena;
        await UsuariosService.update(editingId, update);
      } else {
        await UsuariosService.create(form);
      }
      setModalOpen(false); await cargar();
    } catch (e: any) { setError(e.message); } finally { setSaving(false); }
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    try { await UsuariosService.remove(id); await cargar(); } catch (e: any) { setError(e.message); }
  };

  const toggleActivo = async (u: Usuario) => {
    try { await UsuariosService.update(u.id, { activo: !u.activo }); await cargar(); } catch (e: any) { setError(e.message); }
  };

  const filtrados = usuarios.filter(u => {
    const q = search.toLowerCase();
    return u.nombres.toLowerCase().includes(q) || u.apellidos.toLowerCase().includes(q) || u.usuario.toLowerCase().includes(q) || u.correo.toLowerCase().includes(q);
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios del Sistema</h1>
          <p className="text-sm text-gray-500 mt-1">{usuarios.length} usuarios registrados</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={abrirCrear}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-shadow">
          <Plus className="w-4 h-4" /> Nuevo Usuario
        </motion.button>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error} <button onClick={() => setError('')} className="float-right font-bold">×</button></div>}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, usuario o correo..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-gray-500 text-sm">Cargando...</p></div>
        ) : filtrados.length === 0 ? (
          <div className="p-12 text-center"><UserCog className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No hay usuarios registrados.</p></div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Usuario', 'Nombre completo', 'Correo', 'Rol', 'Estado', ''].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtrados.map(u => (
                <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-semibold">{u.nombres[0]}{u.apellidos[0]}</span>
                      </div>
                      <span className="font-medium text-gray-900">@{u.usuario}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{u.nombres} {u.apellidos}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.correo}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium">
                      {u.rol?.nombre || (u.rolId === 1 ? 'Administrador' : 'Admisión')}
                    </span>
                  </td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${u.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => toggleActivo(u)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">{u.activo ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}</button>
                      <button onClick={() => abrirEditar(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => eliminar(u.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Usuario' : 'Nuevo Usuario'}>
        <form onSubmit={guardar} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombres *</label>
              <input value={form.nombres} onChange={e => setForm({ ...form, nombres: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
              <input value={form.apellidos} onChange={e => setForm({ ...form, apellidos: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario *</label>
              <input value={form.usuario} onChange={e => setForm({ ...form, usuario: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="nombre_usuario" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo *</label>
              <input type="email" value={form.correo} onChange={e => setForm({ ...form, correo: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{editingId ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}</label>
            <input type="password" value={form.contrasena} onChange={e => setForm({ ...form, contrasena: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="••••••••" required={!editingId} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
            <select value={form.rolId} onChange={e => setForm({ ...form, rolId: Number(e.target.value) })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" required>
              <option value={0} disabled>Seleccionar rol...</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50">
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Usuario'}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">Cancelar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
