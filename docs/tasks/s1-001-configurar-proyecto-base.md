# S1-001: Configurar Proyecto Base

**Sprint**: 1 | **Día**: 1-2 | **Duración**: 2 días  
**Prioridad**: Crítica | **Dependencias**: Ninguna

## Objetivo
Configurar la estructura base del proyecto con Next.js 14, TypeScript y Tailwind CSS siguiendo las convenciones establecidas.

## Criterios de Aceptación
- [ ] Repositorio GitHub creado y configurado
- [ ] Next.js 14 con App Router funcionando
- [ ] TypeScript configurado estrictamente
- [ ] Tailwind CSS instalado y funcionando
- [ ] ESLint + Prettier configurados
- [ ] Estructura de carpetas según convenciones
- [ ] Primer commit realizado

## Pasos de Implementación

### 1. Crear Repositorio GitHub
```bash
# Crear repositorio en GitHub con nombre: app-anime-conexion
# Inicializar localmente
git init
git remote add origin [URL_REPO]
```

### 2. Setup Next.js 14 con TypeScript
```bash
# Crear proyecto Next.js con TypeScript
npx create-next-app@latest app-anime-conexion --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Navegar al directorio
cd app-anime-conexion

# Instalar dependencias adicionales
npm install @types/node
```

### 3. Configurar Tailwind CSS
```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        'primary-dark': '#4f46e5',
        'primary-light': '#a5b4fc',
        secondary: '#10b981',
        'secondary-dark': '#059669',
        'secondary-light': '#6ee7b7',
      },
    },
  },
  plugins: [],
}
```

### 4. Configurar ESLint
```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error"
  }
}
```

### 5. Configurar Prettier
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false
}
```

### 6. Configurar TypeScript
```json
// tsconfig.json (modificar extend existente)
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 7. Crear Estructura de Carpetas
```bash
# Dentro de src/
mkdir -p src/components
mkdir -p src/hooks  
mkdir -p src/services
mkdir -p src/types
mkdir -p src/utils
mkdir -p src/constants

# Crear archivos índice
touch src/components/index.ts
touch src/hooks/index.ts
touch src/services/index.ts
touch src/types/index.ts
touch src/utils/index.ts
touch src/constants/index.ts
```

### 8. Configurar Scripts Package.json
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit"
  }
}
```

### 9. Crear .gitignore
```
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.tsbuildinfo
next-env.d.ts

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

### 10. Limpiar Archivos Default
```bash
# Remover archivos no necesarios de Next.js
rm src/app/globals.css # Lo recrearemos
rm src/app/page.module.css
```

### 11. Crear globals.css básico
```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: Inter, system-ui, sans-serif;
  }
}
```

## Validación
- [ ] `npm run dev` inicia servidor sin errores
- [ ] `npm run build` compila exitosamente  
- [ ] `npm run lint` no muestra errores
- [ ] `npm run type-check` pasa sin errores
- [ ] Tailwind classes funcionan en página básica

## Archivos a Crear/Modificar
- `package.json` (dependencias y scripts)
- `tailwind.config.js` (configuración de colores)
- `.eslintrc.json` (reglas de linting)
- `.prettierrc` (formato de código)
- `tsconfig.json` (configuración TypeScript)
- `.gitignore` (archivos a ignorar)
- `src/app/globals.css` (estilos base)
- Estructura de carpetas en `src/`

## Commit Final
```bash
git add .
git commit -m "feat: initial project setup with Next.js, TypeScript, and Tailwind

- Setup Next.js 14 with App Router
- Configure TypeScript strict mode
- Install and configure Tailwind CSS with custom colors
- Setup ESLint + Prettier with custom rules
- Create project folder structure following conventions
- Configure build and development scripts"
```

## Notas Técnicas
- **Next.js App Router**: Usar nueva estructura de app/ en lugar de pages/
- **TypeScript Strict**: Modo estricto habilitado para mejor type safety
- **Tailwind Custom**: Colores personalizados según design system
- **Import Alias**: `@/*` configurado para imports limpios