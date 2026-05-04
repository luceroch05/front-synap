import { useState, useEffect } from 'react';
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
    <div className="page-root">
      <div className="page-header">
        <div>
          <h1 className="page-title">Usuarios del Sistema</h1>
          <p className="page-subtitle">{usuarios.length} usuarios registrados</p>
        </div>
        <button onClick={abrirCrear} className="btn-primary">
          <Plus size={16} /> Nuevo Usuario
        </button>
      </div>

      <div className="page-body">
        {error && (
          <div className="error-bar">
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-bold text-lg leading-none">×</button>
          </div>
        )}

        <div className="search-wrap">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, usuario o correo..."
          />
        </div>

        <div className="table-card">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="spinner" />
              <p className="text-sm text-gray-400">Cargando...</p>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <UserCog size={40} className="text-gray-200" />
              <p className="text-sm text-gray-400">No hay registros</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ borderBottom: '1px solid #F0F2F5' }}>
                  <tr style={{ backgroundColor: '#FAFAFA' }}>
                    {['Usuario', 'Nombre completo', 'Correo', 'Rol', 'Estado', ''].map(h => (
                      <th key={h} className="table-header">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map(u => (
                    <tr key={u.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: '#F7941D' }}>
                            <span className="text-white text-xs font-semibold">{u.nombres[0]}{u.apellidos[0]}</span>
                          </div>
                          <span className="font-medium text-gray-900">@{u.usuario}</span>
                        </div>
                      </td>
                      <td className="table-cell text-gray-700">{u.nombres} {u.apellidos}</td>
                      <td className="table-cell text-sm text-gray-500">{u.correo}</td>
                      <td className="table-cell">
                        <span className="badge-orange">
                          {u.rol?.nombre || (u.rolId === 1 ? 'Administrador' : 'Admisión')}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={u.activo ? 'badge-green' : 'badge-gray'}>
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => toggleActivo(u)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                            {u.activo
                              ? <ToggleRight size={18} className="text-emerald-500" />
                              : <ToggleLeft size={18} className="text-gray-300" />
                            }
                          </button>
                          <button onClick={() => abrirEditar(u)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#F7941D] hover:bg-orange-50 transition-colors">
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => eliminar(u.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Usuario' : 'Nuevo Usuario'}>
        <form onSubmit={guardar} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Nombres *</label>
              <input value={form.nombres} onChange={e => setForm({ ...form, nombres: e.target.value })}
                className="form-input" required />
            </div>
            <div>
              <label className="form-label">Apellidos *</label>
              <input value={form.apellidos} onChange={e => setForm({ ...form, apellidos: e.target.value })}
                className="form-input" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Usuario *</label>
              <input value={form.usuario} onChange={e => setForm({ ...form, usuario: e.target.value })}
                className="form-input" placeholder="nombre_usuario" required />
            </div>
            <div>
              <label className="form-label">Correo *</label>
              <input type="email" value={form.correo} onChange={e => setForm({ ...form, correo: e.target.value })}
                className="form-input" required />
            </div>
          </div>
          <div>
            <label className="form-label">{editingId ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}</label>
            <input type="password" value={form.contrasena} onChange={e => setForm({ ...form, contrasena: e.target.value })}
              className="form-input" placeholder="••••••••" required={!editingId} />
          </div>
          <div>
            <label className="form-label">Rol *</label>
            <select value={form.rolId} onChange={e => setForm({ ...form, rolId: Number(e.target.value) })}
              className="form-input" required>
              <option value={0} disabled>Seleccionar rol...</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="modal-btn-primary">
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="modal-btn-cancel">Cancelar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
