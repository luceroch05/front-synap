import { API_URL } from '../api-config';

/**
 * Servicio de API para Inscripciones
 */

export interface Inscripcion {
  id: number;
  participanteId: number;
  grupoId: number;
  estadoId: number;
  fechaInscripcion: string;
  createdAt: string;
  updatedAt: string;
  userCreaId: number;
  userActualizaId: number;
  participante?: {
    id: number;
    nombres: string;
    apellidos: string;
    tipoDocumento: string;
    numeroDocumento: string;
    email: string;
    telefono: string;
  };
  grupo?: {
    id: number;
    nombreGrupo: string;
    fechaInicio: string;
    fechaFin: string;
    modalidad: string;
    programa?: {
      id: number;
      nombre: string;
      tipoPrograma?: {
        id: number;
        nombre: string;
      };
    };
  };
  estado?: {
    id: number;
    nombre: string;
    descripcion: string;
  };
}

export interface CreateInscripcionDto {
  participanteId: number;
  grupoId: number;
  estadoId: number;
  fechaInscripcion: string;
}

export interface UpdateInscripcionDto {
  participanteId?: number;
  grupoId?: number;
  estadoId?: number;
  fechaInscripcion?: string;
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

export const InscripcionesService = {
  async findAll(): Promise<Inscripcion[]> {
    const res = await fetch(`${API_URL}/inscripciones`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al obtener inscripciones');
    }

    return res.json();
  },

  async findByGrupo(grupoId: number): Promise<Inscripcion[]> {
    const res = await fetch(`${API_URL}/inscripciones?grupoId=${grupoId}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al obtener inscripciones del grupo');
    }

    return res.json();
  },

  async findByParticipante(participanteId: number): Promise<Inscripcion[]> {
    const res = await fetch(`${API_URL}/inscripciones?participanteId=${participanteId}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al obtener inscripciones del participante');
    }

    return res.json();
  },

  async findByEstado(estadoId: number): Promise<Inscripcion[]> {
    const res = await fetch(`${API_URL}/inscripciones?estadoId=${estadoId}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al obtener inscripciones por estado');
    }

    return res.json();
  },

  async findOne(id: number): Promise<Inscripcion> {
    const res = await fetch(`${API_URL}/inscripciones/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al obtener inscripción ${id}`);
    }

    return res.json();
  },

  async create(data: CreateInscripcionDto): Promise<Inscripcion> {
    const res = await fetch(`${API_URL}/inscripciones`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al crear inscripción');
    }

    return res.json();
  },

  async update(id: number, data: UpdateInscripcionDto): Promise<Inscripcion> {
    const res = await fetch(`${API_URL}/inscripciones/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al actualizar inscripción ${id}`);
    }

    return res.json();
  },

async changeEstado(id: number, estadoId: number): Promise<Inscripcion> {
  console.log('URL:', `${API_URL}/inscripciones/${id}/estado/${estadoId}`);
  console.log('Token:', getToken());
  
  try {
    const res = await fetch(`${API_URL}/inscripciones/${id}/estado/${estadoId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    console.log('Response status:', res.status);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al cambiar estado`);
    }

    return res.json();
  } catch (err) {
    console.error('Fetch error:', err);
    throw err;
  }
},
  async remove(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/inscripciones/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al eliminar inscripción ${id}`);
    }
  },
};
