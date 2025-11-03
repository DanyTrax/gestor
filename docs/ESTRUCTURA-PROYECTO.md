# Estructura del Proyecto - Gestor de Cobros

## 📁 Organización de Directorios

```
gestor-cobros/
├── current/                    ← Sistema ACTUAL (React + Firebase)
│   ├── src/
│   ├── dist/
│   ├── package.json
│   ├── send-email.php
│   ├── upload.php
│   └── .htaccess
│
├── new/                        ← Sistema NUEVO (Laravel + SQL)
│   ├── app/
│   ├── database/
│   ├── routes/
│   ├── public/
│   ├── composer.json
│   └── .env
│
├── shared/                     ← Recursos compartidos
│   ├── uploads/
│   │   ├── payments/
│   │   └── tickets/
│   └── invoices/
│
├── scripts/                    ← Scripts de utilidad
│   └── setup-laravel.sh
│
└── docs/                       ← Documentación
    ├── MIGRACION-LARAVEL-COMPLETA.md
    ├── ESTRATEGIA-MIGRACION-DATOS.md
    └── LARAVEL-API-ARCHITECTURE.md
```

## 🎯 Propósito de cada directorio

### `current/` - Sistema Actual
- React SPA con Firebase
- Sigue funcionando normalmente
- URL: `https://clients.dowgroupcol.com/`

### `new/` - Sistema Nuevo
- Laravel MVC + API
- Desarrollo en paralelo
- URL: `https://clients.dowgroupcol.com/new/` (durante desarrollo)

### `shared/` - Recursos Compartidos
- Archivos subidos (comprobantes, tickets)
- Facturas PDF generadas
- Accesible desde ambos sistemas

### `scripts/` - Scripts
- Scripts de instalación
- Scripts de migración (si se necesitan)

### `docs/` - Documentación
- Planes de migración
- Guías de instalación
- Arquitectura

