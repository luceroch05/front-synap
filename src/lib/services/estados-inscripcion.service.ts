import { API_URL } from '../api-config';

/**
 * Servicio de API para Estados de Inscripción
 */

export interface EstadoInscripcion {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface CreateEstadoInscripcionDto {
  nombre: string;
  descripcion?: string;
}

export interface UpdateEstadoInscripcionDto {
  nombre?: string;
  descripcion?: string;
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

export const EstadosInscripcionService = {
  async findAll(): Promise<EstadoInscripcion[]> {
    const res = await fetch(`${API_URL}/estados-inscripcion`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al obtener estados de inscripción');
    }

    return res.json();
  },

  async findOne(id: number): Promise<EstadoInscripcion> {
    const res = await fetch(`${API_URL}/estados-inscripcion/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al obtener estado ${id}`);
    }

    return res.json();
  },

  async create(data: CreateEstadoInscripcionDto): Promise<EstadoInscripcion> {
    const res = await fetch(`${API_URL}/estados-inscripcion`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al crear estado de inscripción');
    }

    return res.json();
  },

  async update(id: number, data: UpdateEstadoInscripcionDto): Promise<EstadoInscripcion> {
    const res = await fetch(`${API_URL}/estados-inscripcion/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al actualizar estado ${id}`);
    }

    return res.json();
  },

  async remove(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/estados-inscripcion/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al eliminar estado ${id}`);
    }
  },
};
