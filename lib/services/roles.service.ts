import { API_URL } from '../api-config';

/**
 * Servicio de API para Roles
 * Consumo de endpoints /roles
 */

export interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  createdAt: string;
}

export interface CreateRolDto {
  nombre: string;
  descripcion?: string;
}

export interface UpdateRolDto {
  nombre?: string;
  descripcion?: string;
}

/**
 * Obtener el token almacenado
 */
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

/**
 * Headers con autorización
 */
const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const RolesService = {
  /**
   * Listar todos los roles
   */
  async findAll(): Promise<Rol[]> {
    const res = await fetch(`${API_URL}/roles`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al obtener roles');
    }

    return res.json();
  },

  /**
   * Obtener un rol por ID
   */
  async findOne(id: number): Promise<Rol> {
    const res = await fetch(`${API_URL}/roles/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al obtener rol ${id}`);
    }

    return res.json();
  },

  /**
   * Crear un nuevo rol
   */
  async create(data: CreateRolDto): Promise<Rol> {
    const res = await fetch(`${API_URL}/roles`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al crear rol');
    }

    return res.json();
  },

  /**
   * Actualizar un rol
   */
  async update(id: number, data: UpdateRolDto): Promise<Rol> {
    const res = await fetch(`${API_URL}/roles/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al actualizar rol ${id}`);
    }

    return res.json();
  },

  /**
   * Eliminar un rol
   */
  async remove(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/roles/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al eliminar rol ${id}`);
    }
  },
};
