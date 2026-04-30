import { API_URL } from '../api-config';

/**
 * Servicio de API para Logos
 */

export interface Logo {
  id: number;
  nombre: string;
  imagenLogo: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  userCreaId: number;
  userActualizaId: number;
}

export interface CreateLogoDto {
  nombre?: string;
  imagenLogo: string;
  activo?: boolean;
}

export interface UpdateLogoDto {
  nombre?: string;
  imagenLogo?: string;
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

export const LogosService = {
  async findAll(): Promise<Logo[]> {
    const res = await fetch(`${API_URL}/logos`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al obtener logos');
    }

    return res.json();
  },

  async findAllActive(): Promise<Logo[]> {
    const res = await fetch(`${API_URL}/logos/activos`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al obtener logos activos');
    }

    return res.json();
  },

  async findOne(id: number): Promise<Logo> {
    const res = await fetch(`${API_URL}/logos/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al obtener logo ${id}`);
    }

    return res.json();
  },

  async create(data: CreateLogoDto): Promise<Logo> {
    const res = await fetch(`${API_URL}/logos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al crear logo');
    }

    return res.json();
  },

  async update(id: number, data: UpdateLogoDto): Promise<Logo> {
    const res = await fetch(`${API_URL}/logos/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al actualizar logo ${id}`);
    }

    return res.json();
  },

  async toggleActive(id: number): Promise<Logo> {
    const res = await fetch(`${API_URL}/logos/${id}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al cambiar estado');
    }

    return res.json();
  },

  async remove(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/logos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al eliminar logo ${id}`);
    }
  },
};
