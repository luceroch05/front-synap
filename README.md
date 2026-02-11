# Frontend SYNAP - Proyecto de Titulación

Frontend desarrollado con **Next.js 16**, **React 19** y **TailwindCSS** para el proyecto de certificados SYNAP.

## Tecnologías Implementadas

- **Next.js 16**: Framework de React para aplicaciones web
- **React 19**: Librería para construir interfaces de usuario
- **TailwindCSS 4**: Framework de CSS utility-first
- **TypeScript**: Tipado estático para JavaScript

## Estructura del Proyecto

```
front-synap/
├── app/                 # App Router de Next.js
│   ├── page.tsx        # Página principal
│   └── layout.tsx      # Layout principal
├── lib/                # Librerías y utilidades
│   ├── api-config.ts   # Configuración del API
│   ├── services/       # Servicios para consumir el backend
│   │   └── users.service.ts
│   └── types/          # Tipos de TypeScript
│       └── user.types.ts
└── public/             # Archivos estáticos
```

## Configuración Inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Edita el archivo `.env.local`:

```env
# Desarrollo
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Ejecutar el proyecto

```bash
# Desarrollo (con hot-reload)
npm run dev

# Producción
npm run build
npm run start
```

El frontend estará corriendo en `http://localhost:3000`

## Cambiar entre Desarrollo y Producción

### En el archivo `.env.local`:

**Desarrollo:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Producción (descomenta cuando subas a producción):**
```env
NEXT_PUBLIC_API_URL=https://tu-backend-produccion.com
```

Simplemente comenta/descomenta la línea que necesites.

## Cómo Consumir el Backend

### Ejemplo 1: Obtener todos los usuarios

```typescript
import { usersService } from '@/lib/services/users.service';

// En un componente de servidor
async function UsersPage() {
  const users = await usersService.getAll();

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.nombre}</div>
      ))}
    </div>
  );
}
```

### Ejemplo 2: Crear un usuario (componente cliente)

```typescript
'use client';

import { useState } from 'react';
import { usersService } from '@/lib/services/users.service';
import type { CreateUserDto } from '@/lib/types/user.types';

export default function CreateUserForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: CreateUserDto = {
      email: formData.get('email') as string,
      nombre: formData.get('nombre') as string,
      apellido: formData.get('apellido') as string,
    };

    try {
      const newUser = await usersService.create(data);
      console.log('Usuario creado:', newUser);
      alert('Usuario creado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="nombre" type="text" required />
      <input name="apellido" type="text" required />
      <button type="submit" disabled={loading}>
        {loading ? 'Creando...' : 'Crear Usuario'}
      </button>
    </form>
  );
}
```

### Ejemplo 3: Actualizar un usuario

```typescript
'use client';

import { usersService } from '@/lib/services/users.service';

async function updateUser(id: number) {
  try {
    const updated = await usersService.update(id, {
      nombre: 'Nuevo Nombre',
    });
    console.log('Usuario actualizado:', updated);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Ejemplo 4: Eliminar un usuario

```typescript
'use client';

import { usersService } from '@/lib/services/users.service';

async function deleteUser(id: number) {
  try {
    await usersService.delete(id);
    console.log('Usuario eliminado');
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## Servicios Disponibles

### usersService

- `getAll()`: Obtiene todos los usuarios
- `getById(id)`: Obtiene un usuario por ID
- `create(data)`: Crea un nuevo usuario
- `update(id, data)`: Actualiza un usuario
- `delete(id)`: Elimina un usuario

## Cómo Crear un Nuevo Servicio

### Paso 1: Crear los tipos

`lib/types/mi-entidad.types.ts`

```typescript
export interface MiEntidad {
  id: number;
  nombre: string;
  createdAt: string;
}

export interface CreateMiEntidadDto {
  nombre: string;
}
```

### Paso 2: Crear el servicio

`lib/services/mi-entidad.service.ts`

```typescript
import { apiFetch } from '../api-config';
import type { MiEntidad, CreateMiEntidadDto } from '../types/mi-entidad.types';

export const miEntidadService = {
  async getAll(): Promise<MiEntidad[]> {
    return apiFetch<MiEntidad[]>('/mi-entidad');
  },

  async create(data: CreateMiEntidadDto): Promise<MiEntidad> {
    return apiFetch<MiEntidad>('/mi-entidad', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
```

### Paso 3: Usar el servicio

```typescript
import { miEntidadService } from '@/lib/services/mi-entidad.service';

const items = await miEntidadService.getAll();
```

## Conceptos Importantes de Next.js

### Server Components vs Client Components

**Server Components (por defecto)**
- Se renderizan en el servidor
- Pueden hacer fetch de datos directamente
- No pueden usar hooks como useState, useEffect
- Ideales para páginas que cargan datos

```typescript
// Server Component (por defecto)
async function Page() {
  const data = await usersService.getAll();
  return <div>{data}</div>;
}
```

**Client Components**
- Se renderizan en el cliente
- Pueden usar hooks de React
- Necesitan la directiva 'use client'
- Ideales para interactividad

```typescript
'use client';

import { useState } from 'react';

function InteractiveComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

## Manejo de Errores

```typescript
'use client';

import { useState } from 'react';
import { usersService } from '@/lib/services/users.service';

function Component() {
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await usersService.getAll();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  return (
    <div>
      {error && <div className="text-red-500">Error: {error}</div>}
      <button onClick={loadData}>Cargar datos</button>
    </div>
  );
}
```

## Scripts Disponibles

```bash
npm run dev       # Desarrollo con hot-reload
npm run build     # Compilar para producción
npm run start     # Ejecutar en producción
npm run lint      # Linter
```

## TailwindCSS - Ejemplos Básicos

```jsx
// Botón primario
<button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
  Click me
</button>

// Card
<div className="bg-white shadow-md rounded-lg p-6">
  <h2 className="text-xl font-bold mb-2">Título</h2>
  <p className="text-gray-600">Contenido</p>
</div>

// Grid de 3 columnas
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

## Buenas Prácticas

1. **Usa Server Components por defecto**, Client Components solo cuando necesites interactividad
2. **Centraliza las llamadas al API** en los servicios de `lib/services/`
3. **Define los tipos** en `lib/types/` para mantener consistencia con el backend
4. **Maneja errores** siempre que hagas llamadas al API
5. **Usa variables de entorno** para URLs y configuración sensible
6. **No expongas secretos** en variables que empiecen con `NEXT_PUBLIC_`

## Para Producción

1. Cambia `NEXT_PUBLIC_API_URL` a tu URL de producción en `.env.local`
2. Compila el proyecto:

```bash
npm run build
```

3. Ejecuta en modo producción:

```bash
npm run start
```

O despliega en Vercel (recomendado para Next.js):

```bash
npm install -g vercel
vercel
```

## Conectar con el Backend

Asegúrate de que:

1. El backend esté corriendo en `http://localhost:3001`
2. El backend tenga CORS habilitado (ya está configurado)
3. La base de datos MySQL esté corriendo
4. Las variables de entorno estén correctamente configuradas

---

**Proyecto desarrollado para titulación - SYNAP**
