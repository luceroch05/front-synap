import { API_URL } from '../api-config';

/**
 * Servicio de API para Programas
 */

export interface Programa {
  id: number;
  tipoProgramaId: number;
  tipoPrograma?: {
    id: number;
    nombre: string;
    descripcion: string;
  };
  nombre: string;
  descripcion: string;
  horasAcademicas: number;
  tieneEvaluacion: boolean;
  notaMinimaAprobatoria: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  userCreaId: number;
  userActualizaId: number;
}

export interface CreateProgramaDto {
  tipoProgramaId: number;
  nombre: string;
  descripcion?: string;
  horasAcademicas: number;
  tieneEvaluacion?: boolean;
  notaMinimaAprobatoria?: number;
}

export interface UpdateProgramaDto {
  tipoProgramaId?: number;
  nombre?: string;
  descripcion?: string;
  horasAcademicas?: number;
  tieneEvaluacion?: boolean;
  notaMinimaAprobatoria?: number;
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

export const ProgramasService = {
  async findAll(): Promise<Programa[]> {
    const res = await fetch(`${API_URL}/programas`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al obtener programas');
    }

    return res.json();
  },

  async findAllActive(): Promise<Programa[]> {
    const res = await fetch(`${API_URL}/programas/activos`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al obtener programas activos');
    }

    return res.json();
  },

  async findOne(id: number): Promise<Programa> {
    const res = await fetch(`${API_URL}/programas/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al obtener programa ${id}`);
    }

    return res.json();
  },

  async create(data: CreateProgramaDto): Promise<Programa> {
    const res = await fetch(`${API_URL}/programas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al crear programa');
    }

    return res.json();
  },

  async update(id: number, data: UpdateProgramaDto): Promise<Programa> {
    const res = await fetch(`${API_URL}/programas/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al actualizar programa ${id}`);
    }

    return res.json();
  },

  async toggleActive(id: number): Promise<Programa> {
    const res = await fetch(`${API_URL}/programas/${id}/toggle`, {
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
    const res = await fetch(`${API_URL}/programas/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al eliminar programa ${id}`);
    }
  },
};
