import { API_URL } from '../api-config';
import { Programa } from './programas.service';
import { Logo } from './logos.service';
import { Firma } from './firmas.service';

/**
 * Servicio de API para Configuraciones de Certificado
 */

export interface ConfiguracionLogo {
  id: number;
  configuracionId: number;
  logoId: number;
  logo: Logo;
}

export interface ConfiguracionFirma {
  id: number;
  configuracionId: number;
  firmaId: number;
  firma: Firma;
}

export interface ConfiguracionCertificado {
  id: number;
  programaId: number;
  programa: Programa;
  plantillaUrl: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  userCreaId: number;
  userActualizaId: number;
  logos: ConfiguracionLogo[];
  firmas: ConfiguracionFirma[];
}

export interface CreateConfiguracionCertificadoDto {
  programaId: number;
  plantillaUrl: string;
  activo?: boolean;
  logos?: { logoId: number }[];
  firmas?: { firmaId: number }[];
}

export interface UpdateConfiguracionCertificadoDto {
  programaId?: number;
  plantillaUrl?: string;
  activo?: boolean;
  logos?: { logoId: number }[];
  firmas?: { firmaId: number }[];
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

export const ConfiguracionesCertificadoService = {
  async findAll(): Promise<ConfiguracionCertificado[]> {
    const res = await fetch(`${API_URL}/configuraciones-certificado`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al obtener configuraciones');
    }

    return res.json();
  },

  async findAllActive(): Promise<ConfiguracionCertificado[]> {
    const res = await fetch(`${API_URL}/configuraciones-certificado/activos`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al obtener configuraciones activas');
    }

    return res.json();
  },

  async findByPrograma(programaId: number): Promise<ConfiguracionCertificado> {
    const res = await fetch(
      `${API_URL}/configuraciones-certificado/programa/${programaId}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al obtener configuración del programa ${programaId}`);
    }

    return res.json();
  },

  async findOne(id: number): Promise<ConfiguracionCertificado> {
    const res = await fetch(`${API_URL}/configuraciones-certificado/${id}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al obtener configuración ${id}`);
    }

    return res.json();
  },

  async create(data: CreateConfiguracionCertificadoDto): Promise<ConfiguracionCertificado> {
    const res = await fetch(`${API_URL}/configuraciones-certificado`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al crear configuración');
    }

    return res.json();
  },

  async update(
    id: number,
    data: UpdateConfiguracionCertificadoDto
  ): Promise<ConfiguracionCertificado> {
    const res = await fetch(`${API_URL}/configuraciones-certificado/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al actualizar configuración ${id}`);
    }

    return res.json();
  },

  async toggleActive(id: number): Promise<ConfiguracionCertificado> {
    const res = await fetch(`${API_URL}/configuraciones-certificado/${id}/toggle`, {
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
    const res = await fetch(`${API_URL}/configuraciones-certificado/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || `Error al eliminar configuración ${id}`);
    }
  },
};
