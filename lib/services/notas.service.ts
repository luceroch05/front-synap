import { API_URL } from '../api-config';

/**
 * Servicio de API para Notas
 */

export interface Nota {
  id: number;
  inscripcionId: number;
  unidadId: number;
  inscripcion?: {
    id: number;
    participante: {
      id: number;
      nombre: string;
      apellidoPaterno: string;
      apellidoMaterno: string;
    };
  };
  unidad?: {
    id: number;
    nombre: string;
    peso: number;
    orden: number;
  };
  nota: number;
  observaciones: string;
  createdAt: string;
  updatedAt: string;
  userCreaId: number;
  userActualizaId: number;
}

export interface CreateNotaDto {
  inscripcionId: number;
  unidadId: number;
  nota: number;
  observaciones?: string;
  userCreaId?: number;
}

export interface UpdateNotaDto {
  nota?: number;
  observaciones?: string;
  userActualizaId?: number;
}

export interface NotaFinal {
  notaFinal: number;
  notasDetalle: Array<{
    unidad: string;
    nota: number;
    peso: number;
    aporte: number;
  }>;
  aprobado: boolean;
  notaMinimaAprobatoria: number;
}

export interface NotaGrupalDto {
  inscripcionId: number;
  nota: number;
  observaciones?: string;
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

export const NotasService = {
  async findAll(): Promise<Nota[]> {
    const res = await fetch(`${API_URL}/notas`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al obtener notas');
    }

    return res.json();
  },

  async findOne(id: number): Promise<Nota> {
    const res = await fetch(`${API_URL}/notas/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al obtener nota ${id}`);
    }

    return res.json();
  },

  async findByInscripcion(inscripcionId: number): Promise<Nota[]> {
    const res = await fetch(`${API_URL}/notas/inscripcion/${inscripcionId}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al obtener notas de inscripción ${inscripcionId}`);
    }

    return res.json();
  },

  async findByUnidad(unidadId: number): Promise<Nota[]> {
    const res = await fetch(`${API_URL}/notas/unidad/${unidadId}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al obtener notas de unidad ${unidadId}`);
    }

    return res.json();
  },

  async calcularNotaFinal(inscripcionId: number): Promise<NotaFinal> {
    const res = await fetch(`${API_URL}/notas/inscripcion/${inscripcionId}/nota-final`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al calcular nota final');
    }

    return res.json();
  },

  async create(data: CreateNotaDto): Promise<Nota> {
    const res = await fetch(`${API_URL}/notas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al crear nota');
    }

    return res.json();
  },

  async registrarNotasGrupales(
    unidadId: number,
    notas: NotaGrupalDto[],
    userCreaId?: number
  ): Promise<Nota[]> {
    const res = await fetch(`${API_URL}/notas/grupales`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ unidadId, notas, userCreaId }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al registrar notas grupales');
    }

    return res.json();
  },

  async update(id: number, data: UpdateNotaDto): Promise<Nota> {
    const res = await fetch(`${API_URL}/notas/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al actualizar nota ${id}`);
    }

    return res.json();
  },

  async remove(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/notas/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al eliminar nota ${id}`);
    }
  },
};
