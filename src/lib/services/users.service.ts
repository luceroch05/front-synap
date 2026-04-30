import { apiFetch } from '../api-config';
import type { User, CreateUserDto, UpdateUserDto } from '../types/user.types';

/**
 * Servicio de Users
 * Contiene todas las funciones para interactuar con el API de usuarios
 */
export const usersService = {
  /**
   * Obtener todos los usuarios
   */
  async getAll(): Promise<User[]> {
    return apiFetch<User[]>('/users');
  },

  /**
   * Obtener un usuario por ID
   */
  async getById(id: number): Promise<User> {
    return apiFetch<User>(`/users/${id}`);
  },

  /**
   * Crear un nuevo usuario
   */
  async create(data: CreateUserDto): Promise<User> {
    return apiFetch<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Actualizar un usuario
   */
  async update(id: number, data: UpdateUserDto): Promise<User> {
    return apiFetch<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Eliminar un usuario
   */
  async delete(id: number): Promise<void> {
    return apiFetch<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};
