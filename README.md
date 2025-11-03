# Gestor de Cobros

Sistema de gestión de cobros y pagos con dos versiones:

## 📁 Estructura del Proyecto

```
gestor-cobros/
├── current/          ← Sistema ACTUAL (React + Firebase)
├── new/              ← Sistema NUEVO (Laravel + SQL)
├── shared/           ← Recursos compartidos (uploads, invoices)
├── scripts/          ← Scripts de utilidad
└── docs/             ← Documentación
```

## 🚀 Sistema Actual (React + Firebase)

**Ubicación:** `current/`

- React SPA con Vite
- Firebase (Firestore + Auth)
- PHP para emails y uploads
- URL: `https://clients.dowgroupcol.com/`

### Instalación:
```bash
cd current
npm install
npm run build
```

## 🆕 Sistema Nuevo (Laravel + SQL)

**Ubicación:** `new/`

- Laravel MVC (sin compilación)
- API REST para móviles
- MySQL/PostgreSQL
- URL: `https://clients.dowgroupcol.com/new/` (durante desarrollo)

### Instalación:
```bash
cd new
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
```

## 📚 Documentación

Toda la documentación está en el directorio `docs/`:

- `ESTRUCTURA-PROYECTO.md` - Estructura de directorios
- `MIGRACION-LARAVEL-COMPLETA.md` - Plan de migración completo
- `LARAVEL-API-ARCHITECTURE.md` - Arquitectura MVC + API
- `README-LARAVEL.md` - Guía de Laravel

## 🔄 Recursos Compartidos

El directorio `shared/` contiene:
- `uploads/payments/` - Comprobantes de pago
- `uploads/tickets/` - Adjuntos de tickets
- `invoices/` - Facturas PDF generadas

Ambos sistemas pueden acceder a estos recursos.

## 📝 Notas

- El sistema actual sigue funcionando normalmente
- El sistema nuevo se desarrolla en paralelo
- Ambos sistemas pueden coexistir durante la migración
- Los datos se crearán desde cero en el sistema nuevo

## 🚀 Próximos Pasos

1. Ejecutar `./organize-structure.sh` para organizar archivos
2. Instalar Laravel en `new/`
3. Copiar archivos de Laravel a `new/`
4. Configurar base de datos
5. Crear vistas Blade según necesidad
