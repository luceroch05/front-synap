import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Search, UserCog, Edit2, Trash2, ToggleLeft, ToggleRight, 
  Mail, User, Lock, Shield, Eye, CheckCircle, Briefcase, Users, Award
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { UsuariosService, Usuario, CreateUsuarioDto, UpdateUsuarioDto } from '@/lib/services/usuarios.service';
import { RolesService, Rol } from '@/lib/services/roles.service';

const emptyForm: CreateUsuarioDto = { 
  nombres: '', 
  apellidos: '', 
  usuario: '', 
  correo: '', 
  contrasena: '', 
  rolId: 0 
};

// COMPONENTE COMBOBOX PARA ROLES
function RolCombobox({ options, value, onChange, placeholder = "Buscar rol..." }: { 
  options: Rol[]; 
  value: number; 
  onChange: (id: number) => void; 
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedRol = options.find(o => o.id === value);

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter(opt => opt.nombre.toLowerCase().includes(term));
  }, [options, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (rol: Rol) => {
    onChange(rol.id);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  const getRolIcon = (nombre: string) => {
    const name = nombre.toLowerCase();
    if (name.includes('admin')) return <Shield size={16} />;
    if (name.includes('docente')) return <Briefcase size={16} />;
    if (name.includes('estudiante')) return <Users size={16} />;
    return <Award size={16} />;
  };

  return (
    <div ref={containerRef} className="relative">
      <div className={`relative flex items-center border rounded-xl transition-all ${
        isOpen ? 'border-[#E8B84B] ring-2 ring-[#E8B84B]/20' : 'border-gray-200'
      }`}>
        <Shield className="absolute left-3 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={isOpen ? searchTerm : (selectedRol?.nombre || '')}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setSearchTerm('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setHighlightedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setHighlightedIndex(prev => Math.max(prev - 1, -1));
            } else if (e.key === 'Enter' && highlightedIndex >= 0) {
              e.preventDefault();
              handleSelect(filteredOptions[highlightedIndex]);
            } else if (e.key === 'Escape') {
              setIsOpen(false);
              setSearchTerm('');
            }
          }}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2.5 bg-transparent rounded-xl text-sm outline-none"
        />
        {selectedRol && !isOpen && (
          <div className="absolute right-3 px-1.5 py-0.5 bg-green-50 rounded text-[10px] font-medium text-green-600 flex items-center gap-1">
            <CheckCircle size={10} />
            Seleccionado
          </div>
        )}
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
          {filteredOptions.map((opt, idx) => {
            const Icon = getRolIcon(opt.nombre);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelect(opt)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  idx === highlightedIndex ? 'bg-orange-50 text-[#E8B84B]' : 'hover:bg-gray-50'
                } ${value === opt.id ? 'bg-orange-50/50 font-medium text-[#E8B84B]' : 'text-gray-700'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`${value === opt.id ? 'text-[#E8B84B]' : 'text-gray-400'}`}>
                      {Icon}
                    </span>
                    <span>{opt.nombre}</span>
                  </div>
                  {value === opt.id && <CheckCircle className="w-3.5 h-3.5 text-[#E8B84B]" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      setLoading(true);
      const [u, r] = await Promise.all([UsuariosService.findAll(), RolesService.findAll()]);
      setUsuarios(u); 
      setRoles(r);
    } catch (e: any) { 
      setError(e.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const abrirCrear = () => {
    setForm({ ...emptyForm, rolId: roles[0]?.id || 0 });
    setEditingId(null); 
    setErrors({});
    setModalOpen(true);
  };

  const abrirEditar = (u: Usuario) => {
    setForm({ 
      nombres: u.nombres, 
      apellidos: u.apellidos, 
      usuario: u.usuario, 
      correo: u.correo, 
      contrasena: '', 
      rolId: u.rolId 
    });
    setEditingId(u.id); 
    setErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.nombres?.trim()) newErrors.nombres = 'Ingresa los nombres';
    if (!form.apellidos?.trim()) newErrors.apellidos = 'Ingresa los apellidos';
    if (!form.usuario?.trim()) newErrors.usuario = 'Ingresa el nombre de usuario';
    if (!form.correo?.trim()) newErrors.correo = 'Ingresa el correo electrónico';
    if (form.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      newErrors.correo = 'Ingresa un correo válido';
    }
    if (!editingId && !form.contrasena) {
      newErrors.contrasena = 'Ingresa la contraseña';
    }
    if (form.contrasena && form.contrasena.length < 6) {
      newErrors.contrasena = 'La contraseña debe tener al menos 6 caracteres';
    }
    if (!form.rolId || form.rolId === 0) newErrors.rolId = 'Selecciona un rol';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      if (editingId) {
        const update: UpdateUsuarioDto = { 
          nombres: form.nombres, 
          apellidos: form.apellidos, 
          usuario: form.usuario, 
          correo: form.correo, 
          rolId: form.rolId 
        };
        if (form.contrasena) update.contrasena = form.contrasena;
        await UsuariosService.update(editingId, update);
      } else {
        await UsuariosService.create(form);
      }
      setModalOpen(false); 
      await cargar();
    } catch (e: any) { 
      setError(e.message); 
    } finally { 
      setSaving(false); 
    }
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    try { await UsuariosService.remove(id); await cargar(); } 
    catch (e: any) { setError(e.message); }
  };

  const toggleActivo = async (u: Usuario) => {
    try { await UsuariosService.update(u.id, { activo: !u.activo }); await cargar(); } 
    catch (e: any) { setError(e.message); }
  };

  const filtrados = usuarios.filter(u => {
    const q = search.toLowerCase();
    return u.nombres.toLowerCase().includes(q) || 
           u.apellidos.toLowerCase().includes(q) || 
           u.usuario.toLowerCase().includes(q) || 
           u.correo.toLowerCase().includes(q);
  });

  const getRolBadgeColor = (rolNombre: string) => {
    const name = rolNombre.toLowerCase();
    if (name.includes('admin')) return 'bg-red-50 text-red-700';
    if (name.includes('docente')) return 'bg-blue-50 text-blue-700';
    if (name.includes('estudiante')) return 'bg-green-50 text-green-700';
    return 'bg-orange-50 text-orange-700';
  };

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
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-[#E8B84B]">
                            <span className="text-white text-xs font-semibold">
                              {u.nombres[0]}{u.apellidos[0]}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">@{u.usuario}</span>
                        </div>
                       </td>
                      <td className="table-cell text-gray-700">{u.nombres} {u.apellidos}</td>
                      <td className="table-cell text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Mail size={12} className="text-gray-300" />
                          {u.correo}
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getRolBadgeColor(u.rol?.nombre || '')}`}>
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
                          <button onClick={() => abrirEditar(u)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#E8B84B] hover:bg-orange-50 transition-colors">
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

      {/* MODAL MEJORADO */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Editar Usuario' : 'Nuevo Usuario'}
        size="lg"
      >
        <form onSubmit={guardar} className="space-y-5">
          
          {/* Nombres y Apellidos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                <User size={16} className="text-[#E8B84B]" />
                Nombres *
              </label>
              <input
                value={form.nombres}
                onChange={e => setForm({ ...form, nombres: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#E8B84B]/20 focus:border-[#E8B84B] ${
                  errors.nombres ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                placeholder="Juan Carlos"
                autoComplete="off"
              />
              {errors.nombres && <p className="text-xs text-red-500 mt-1">{errors.nombres}</p>}
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                <User size={16} className="text-[#E8B84B]" />
                Apellidos *
              </label>
              <input
                value={form.apellidos}
                onChange={e => setForm({ ...form, apellidos: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#E8B84B]/20 focus:border-[#E8B84B] ${
                  errors.apellidos ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                placeholder="García López"
                autoComplete="off"
              />
              {errors.apellidos && <p className="text-xs text-red-500 mt-1">{errors.apellidos}</p>}
            </div>
          </div>

          {/* Usuario y Correo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                <User size={16} className="text-[#E8B84B]" />
                Nombre de usuario *
              </label>
              <input
                value={form.usuario}
                onChange={e => setForm({ ...form, usuario: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#E8B84B]/20 focus:border-[#E8B84B] ${
                  errors.usuario ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                placeholder="juan.garcia"
                autoComplete="off"
              />
              {errors.usuario && <p className="text-xs text-red-500 mt-1">{errors.usuario}</p>}
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
                <Mail size={16} className="text-[#E8B84B]" />
                Correo electrónico *
              </label>
              <input
                type="email"
                value={form.correo}
                onChange={e => setForm({ ...form, correo: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#E8B84B]/20 focus:border-[#E8B84B] ${
                  errors.correo ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                placeholder="juan@ejemplo.com"
                autoComplete="off"
              />
              {errors.correo && <p className="text-xs text-red-500 mt-1">{errors.correo}</p>}
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <Lock size={16} className="text-[#E8B84B]" />
              {editingId ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
            </label>
            <input
              type="password"
              value={form.contrasena}
              onChange={e => setForm({ ...form, contrasena: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#E8B84B]/20 focus:border-[#E8B84B] ${
                errors.contrasena ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="••••••••"
              autoComplete="off"
            />
            {errors.contrasena && <p className="text-xs text-red-500 mt-1">{errors.contrasena}</p>}
            {!editingId && (
              <p className="text-xs text-gray-400 mt-1">Mínimo 6 caracteres</p>
            )}
          </div>

          {/* Rol con combobox */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <Shield size={16} className="text-[#E8B84B]" />
              Rol *
            </label>
            <RolCombobox
              options={roles}
              value={form.rolId}
              onChange={(id) => setForm({ ...form, rolId: id })}
              placeholder="Buscar rol..."
            />
            {errors.rolId && <p className="text-xs text-red-500 mt-1">{errors.rolId}</p>}
          </div>

          {/* Vista previa dinámica */}
          {(form.nombres || form.apellidos || form.usuario) && (
            <div className="mt-2 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
              <div className="flex items-center gap-2 text-xs font-medium text-orange-600 mb-2">
                <Eye size={12} />
                Vista previa
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-white rounded-lg shadow-sm text-xs flex items-center gap-1">
                  <User size={10} className="text-[#E8B84B]" />
                  {form.nombres} {form.apellidos}
                </span>
                <span className="px-2 py-1 bg-white rounded-lg shadow-sm text-xs flex items-center gap-1">
                  @{form.usuario || 'usuario'}
                </span>
                {form.correo && (
                  <span className="px-2 py-1 bg-white rounded-lg shadow-sm text-xs flex items-center gap-1">
                    <Mail size={10} className="text-[#E8B84B]" />
                    {form.correo}
                  </span>
                )}
                {form.rolId !== 0 && (
                  <span className="px-2 py-1 bg-white rounded-lg shadow-sm text-xs flex items-center gap-1">
                    <Shield size={10} className="text-[#E8B84B]" />
                    {roles.find(r => r.id === form.rolId)?.nombre}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#E8B84B] hover:bg-[#D4A017] text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>{editingId ? 'Actualizar usuario' : 'Crear usuario'}</>
              )}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>

        </form>
      </Modal>
    </div>
  );
}