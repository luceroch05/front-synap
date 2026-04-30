import { API_URL } from '../api-config';

/**
 * Servicio de API para Firmas
 */

export interface Firma {
  id: number;
  nombreAutoridad: string;
  cargo: string;
  imagenFirma: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  userCreaId: number;
  userActualizaId: number;
}

export interface CreateFirmaDto {
  nombreAutoridad: string;
  cargo: string;
  imagenFirma: string;
  activo?: boolean;
}

export interface UpdateFirmaDto {
  nombreAutoridad?: string;
  cargo?: string;
  imagenFirma?: string;
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

export const FirmasService = {
  async findAll(): Promise<Firma[]> {
    const res = await fetch(`${API_URL}/firmas`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al obtener firmas');
    }

    return res.json();
  },

  async findAllActive(): Promise<Firma[]> {
    const res = await fetch(`${API_URL}/firmas/activos`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al obtener firmas activas');
    }

    return res.json();
  },

  async findOne(id: number): Promise<Firma> {
    const res = await fetch(`${API_URL}/firmas/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al obtener firma ${id}`);
    }

    return res.json();
  },

  async create(data: CreateFirmaDto): Promise<Firma> {
    const res = await fetch(`${API_URL}/firmas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al crear firma');
    }

    return res.json();
  },

  async update(id: number, data: UpdateFirmaDto): Promise<Firma> {
    const res = await fetch(`${API_URL}/firmas/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al actualizar firma ${id}`);
    }

    return res.json();
  },

  async toggleActive(id: number): Promise<Firma> {
    const res = await fetch(`${API_URL}/firmas/${id}/toggle`, {
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
    const res = await fetch(`${API_URL}/firmas/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al eliminar firma ${id}`);
    }
  },
};
