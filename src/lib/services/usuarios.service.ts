import { API_URL } from '../api-config';

export interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  usuario: string;
  correo: string;
  rolId: number;
  rol?: { id: number; nombre: string };
  activo: boolean;
}

export interface CreateUsuarioDto {
  nombres: string;
  apellidos: string;
  usuario: string;
  correo: string;
  contrasena: string;
  rolId: number;
}

export interface UpdateUsuarioDto {
  nombres?: string;
  apellidos?: string;
  usuario?: string;
  correo?: string;
  contrasena?: string;
  rolId?: number;
  activo?: boolean;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const UsuariosService = {
  async findAll(): Promise<Usuario[]> {
    const res = await fetch(`${API_URL}/usuarios`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error((await res.json()).message || 'Error al obtener usuarios');
    return res.json();
  },

  async findOne(id: number): Promise<Usuario> {
    const res = await fetch(`${API_URL}/usuarios/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error((await res.json()).message || 'Error al obtener usuario');
    return res.json();
  },

  async create(data: CreateUsuarioDto): Promise<Usuario> {
    const res = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Error al crear usuario');
    return res.json();
  },

  async update(id: number, data: UpdateUsuarioDto): Promise<Usuario> {
    const res = await fetch(`${API_URL}/usuarios/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Error al actualizar usuario');
    return res.json();
  },

  async remove(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/usuarios/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Error al eliminar usuario');
  },
};
