import { API_URL } from '../api-config';

/**
 * Servicio de API para Tipos de Programa
 */

export interface TipoPrograma {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface CreateTipoProgramaDto {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface UpdateTipoProgramaDto {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const TiposProgramaService = {
  async findAll(): Promise<TipoPrograma[]> {
    const res = await fetch(`${API_URL}/tipos-programa`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al obtener tipos de programa');
    }

    return res.json();
  },

  async findAllActive(): Promise<TipoPrograma[]> {
    const res = await fetch(`${API_URL}/tipos-programa/activos`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al obtener tipos activos');
    }

    return res.json();
  },

  async findOne(id: number): Promise<TipoPrograma> {
    const res = await fetch(`${API_URL}/tipos-programa/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al obtener tipo ${id}`);
    }

    return res.json();
  },

  async create(data: CreateTipoProgramaDto): Promise<TipoPrograma> {
    const res = await fetch(`${API_URL}/tipos-programa`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al crear tipo de programa');
    }

    return res.json();
  },

  async update(id: number, data: UpdateTipoProgramaDto): Promise<TipoPrograma> {
    const res = await fetch(`${API_URL}/tipos-programa/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al actualizar tipo ${id}`);
    }

    return res.json();
  },

  async toggleActive(id: number): Promise<TipoPrograma> {
    const res = await fetch(`${API_URL}/tipos-programa/${id}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al cambiar estado`);
    }

    return res.json();
  },

  async remove(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/tipos-programa/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al eliminar tipo ${id}`);
    }
  },
};
