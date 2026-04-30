import { API_URL } from '../api-config';

/**
 * Servicio de API para Grupos de Programas
 */

export enum ModalidadGrupo {
  PRESENCIAL = 'PRESENCIAL',
  VIRTUAL = 'VIRTUAL',
  MIXTA = 'MIXTA',
}

export interface GrupoProgramas {
  id: number;
  programaId: number;
  nombreGrupo: string;
  fechaInicio: string;
  fechaFin: string;
  modalidad: ModalidadGrupo;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  userCreaId: number;
  userActualizaId: number;
  programa?: {
    id: number;
    nombre: string;
    tipoPrograma?: {
      id: number;
      nombre: string;
    };
  };
}

export interface CreateGrupoProgramaDto {
  programaId: number;
  nombreGrupo: string;
  fechaInicio: string;
  fechaFin: string;
  modalidad: ModalidadGrupo;
}

export interface UpdateGrupoProgramaDto {
  programaId?: number;
  nombreGrupo?: string;
  fechaInicio?: string;
  fechaFin?: string;
  modalidad?: ModalidadGrupo;
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

export const GruposProgramasService = {
  async findAll(): Promise<GrupoProgramas[]> {
    const res = await fetch(`${API_URL}/grupos-programas`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al obtener grupos de programas');
    }

    return res.json();
  },

  async findAllActive(): Promise<GrupoProgramas[]> {
    const res = await fetch(`${API_URL}/grupos-programas/activos`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al obtener grupos activos');
    }

    return res.json();
  },

  async findByPrograma(programaId: number): Promise<GrupoProgramas[]> {
    const res = await fetch(`${API_URL}/grupos-programas?programaId=${programaId}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al obtener grupos del programa');
    }

    return res.json();
  },

  async findOne(id: number): Promise<GrupoProgramas> {
    const res = await fetch(`${API_URL}/grupos-programas/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al obtener grupo ${id}`);
    }

    return res.json();
  },

  async create(data: CreateGrupoProgramaDto): Promise<GrupoProgramas> {
    const res = await fetch(`${API_URL}/grupos-programas`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al crear grupo');
    }

    return res.json();
  },

  async update(id: number, data: UpdateGrupoProgramaDto): Promise<GrupoProgramas> {
    const res = await fetch(`${API_URL}/grupos-programas/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al actualizar grupo ${id}`);
    }

    return res.json();
  },

  async toggleActive(id: number): Promise<GrupoProgramas> {
    const res = await fetch(`${API_URL}/grupos-programas/${id}/toggle`, {
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
    const res = await fetch(`${API_URL}/grupos-programas/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al eliminar grupo ${id}`);
    }
  },
};
