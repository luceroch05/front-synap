import { API_URL } from '../api-config';

/**
 * Servicio de API para Unidades
 */

export interface Unidad {
  id: number;
  programaId: number;
  programa?: {
    id: number;
    nombre: string;
  };
  nombre: string;
  descripcion: string;
  orden: number;
  peso: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  userCreaId: number;
  userActualizaId: number;
}

export interface CreateUnidadDto {
  programaId: number;
  nombre: string;
  descripcion?: string;
  orden: number;
  peso: number;
  userCreaId?: number;
}

export interface UpdateUnidadDto {
  nombre?: string;
  descripcion?: string;
  orden?: number;
  peso?: number;
  activo?: boolean;
  userActualizaId?: number;
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

export const UnidadesService = {
  async findAll(): Promise<Unidad[]> {
    const res = await fetch(`${API_URL}/unidades`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al obtener unidades');
    }

    return res.json();
  },

  async findOne(id: number): Promise<Unidad> {
    const res = await fetch(`${API_URL}/unidades/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al obtener unidad ${id}`);
    }

    return res.json();
  },

  async findByPrograma(programaId: number): Promise<Unidad[]> {
    const res = await fetch(`${API_URL}/unidades/programa/${programaId}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al obtener unidades del programa ${programaId}`);
    }

    return res.json();
  },

  async calcularPesoTotal(programaId: number): Promise<number> {
    const res = await fetch(`${API_URL}/unidades/programa/${programaId}/peso-total`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al calcular peso total');
    }

    return res.json();
  },

  async create(data: CreateUnidadDto): Promise<Unidad> {
    const res = await fetch(`${API_URL}/unidades`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al crear unidad');
    }

    return res.json();
  },

  async update(id: number, data: UpdateUnidadDto): Promise<Unidad> {
    const res = await fetch(`${API_URL}/unidades/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al actualizar unidad ${id}`);
    }

    return res.json();
  },

  async remove(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/unidades/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al eliminar unidad ${id}`);
    }
  },
};
