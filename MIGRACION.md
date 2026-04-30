# Migración de Next.js a Vite + React Router

## Pasos para completar la migración:

### 1. Instalar dependencias
```bash
npm install
```

### 2. Copiar carpetas manualmente
- Copia `components/` a `src/components/`
- Copia `lib/` a `src/lib/`

### 3. Actualizar importaciones en componentes
En todos los archivos de `src/components/` y `src/lib/`:

**Cambiar:**
- `'use client'` → Eliminar
- `useRouter()` de `next/navigation` → `useNavigate()` de `react-router-dom`
- `Link` de `next/link` → `Link` de `react-router-dom`
- `router.push('/ruta')` → `navigate('/ruta')`
- `router.back()` → `navigate(-1)`

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

### 5. Build para producción
```bash
npm run build
```

### 6. Subir a cPanel
Sube el contenido de la carpeta `dist/` a tu hosting.

### Configuración de rutas en cPanel
Crea un archivo `.htaccess` en la raíz:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```
