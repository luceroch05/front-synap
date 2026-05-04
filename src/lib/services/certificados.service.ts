import { API_URL } from '../api-config';
import { Inscripcion } from './inscripciones.service';

/**
 * Servicio de API para Certificados
 */

export interface EstadoCertificado {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface Certificado {
  id: number;
  inscripcionId: number;
  inscripcion: Inscripcion;
  codigoUnico: string;
  url: string;
  fechaEmision: string;
  estadoId: number;
  estado: EstadoCertificado;
  createdAt: string;
  updatedAt: string;
  userCreaId: number;
  userActualizaId: number;
}

export interface CreateCertificadoDto {
  inscripcionId: number;
  codigoUnico?: string;
  fechaEmision: string;
  estadoId: number;
}

export interface UpdateCertificadoDto {
  inscripcionId?: number;
  fechaEmision?: string;
  estadoId?: number;
}

export interface GenerarCertificadoDto {
  inscripcionId: number;
  programaId: number;
  estadoId?: number;
}

export interface GenerarCertificadosMasivosDto {
  inscripcionesIds: number[];
  programaId: number;
  estadoId?: number;
}

export interface ResultadoGeneracionMasiva {
  exitosos: Certificado[];
  fallidos: { inscripcionId: number; error: string }[];
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

export const CertificadosService = {
  async findEstados(): Promise<EstadoCertificado[]> {
    const res = await fetch(`${API_URL}/estado-certificado`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || 'Error al obtener estados de certificado');
    }
    return res.json();
  },

  async findAll(params?: {
    estadoId?: number;
    participanteId?: number;
    programaId?: number;
  }): Promise<Certificado[]> {
    let url = `${API_URL}/certificados`;
    const queryParams = new URLSearchParams();

    if (params?.estadoId) queryParams.append('estadoId', params.estadoId.toString());
    if (params?.participanteId) queryParams.append('participanteId', params.participanteId.toString());
    if (params?.programaId) queryParams.append('programaId', params.programaId.toString());

    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al obtener certificados');
    }

    return res.json();
  },

  async findByCodigoUnico(codigoUnico: string): Promise<Certificado> {
    const res = await fetch(`${API_URL}/certificados/codigo/${codigoUnico}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al obtener certificado ${codigoUnico}`);
    }

    return res.json();
  },

  async findOne(id: number): Promise<Certificado> {
    const res = await fetch(`${API_URL}/certificados/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al obtener certificado ${id}`);
    }

    return res.json();
  },

  async create(data: CreateCertificadoDto): Promise<Certificado> {
    const res = await fetch(`${API_URL}/certificados`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al crear certificado');
    }

    return res.json();
  },

  async update(id: number, data: UpdateCertificadoDto): Promise<Certificado> {
    const res = await fetch(`${API_URL}/certificados/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al actualizar certificado ${id}`);
    }

    return res.json();
  },

  async anular(id: number, motivo: string): Promise<Certificado> {
    const res = await fetch(`${API_URL}/certificados/${id}/anular`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ motivo }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = Array.isArray(body.message) ? body.message.join(', ') : body.message;
      throw new Error(msg || 'Error al anular certificado');
    }

    return res.json();
  },

  async remove(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/certificados/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = Array.isArray(body.message) ? body.message.join(', ') : body.message;
      throw new Error(msg || `Error al eliminar certificado (${res.status})`);
    }
  },

  /**
   * Generar un certificado individual con PDF
   */
  async generar(data: GenerarCertificadoDto): Promise<Certificado> {
    const res = await fetch(`${API_URL}/certificados/generar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al generar certificado');
    }

    return res.json();
  },

  /**
   * Generar certificados masivos
   */
  async generarMasivo(
    data: GenerarCertificadosMasivosDto
  ): Promise<ResultadoGeneracionMasiva> {
    const res = await fetch(`${API_URL}/certificados/generar-masivo`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al generar certificados masivos');
    }

    return res.json();
  },
};
