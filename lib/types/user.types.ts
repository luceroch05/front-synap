/**
 * Tipos de TypeScript para Users
 * Deben coincidir con los del backend
 */

export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  nombre: string;
  apellido: string;
}

export interface UpdateUserDto {
  email?: string;
  nombre?: string;
  apellido?: string;
  isActive?: boolean;
}
