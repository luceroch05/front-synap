import { API_URL } from '../api-config';

/**
 * Servicio de API para Participantes
 */

export interface Participante {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  userCreaId: number;
  userActualizaId: number;
}

export interface CreateParticipanteDto {
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  email?: string;
  telefono?: string;
}

export interface UpdateParticipanteDto {
  tipoDocumento?: string;
  numeroDocumento?: string;
  nombres?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
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

export const ParticipantesService = {
  async findAll(): Promise<Participante[]> {
    const res = await fetch(`${API_URL}/participantes`, { headers: getAuthHeaders() });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message || 'Error al obtener participantes');
    }
    return res.json();
  },

  async findAllActive(): Promise<Participante[]> {
    const res = await fetch(`${API_URL}/participantes/activos`, { headers: getAuthHeaders() });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message || 'Error al obtener participantes activos');
    }
    return res.json();
  },

  async findOne(id: number): Promise<Participante> {
    const res = await fetch(`${API_URL}/participantes/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message || `Error al obtener participante ${id}`);
    }
    return res.json();
  },

  async create(data: CreateParticipanteDto): Promise<Participante> {
    const res = await fetch(`${API_URL}/participantes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = Array.isArray(body.message) ? body.message.join(', ') : body.message;
      if (res.status === 409) throw new Error(msg || 'Ya existe un participante con ese número de documento');
      throw new Error(msg || 'Error al crear participante');
    }

    return res.json();
  },

  async update(id: number, data: UpdateParticipanteDto): Promise<Participante> {
    const res = await fetch(`${API_URL}/participantes/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = Array.isArray(body.message) ? body.message.join(', ') : body.message;
      if (res.status === 409) throw new Error(msg || 'Ya existe un participante con ese número de documento');
      throw new Error(msg || `Error al actualizar participante ${id}`);
    }

    return res.json();
  },

  async toggleActive(id: number): Promise<Participante> {
    const res = await fetch(`${API_URL}/participantes/${id}/toggle`, { method: 'PATCH', headers: getAuthHeaders() });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message || 'Error al cambiar estado');
    }
    return res.json();
  },

  async remove(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/participantes/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message || `Error al eliminar participante ${id}`);
    }
  },
};
