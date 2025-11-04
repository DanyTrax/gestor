# 🔄 Restaurar Estructura Original

## 🎯 Objetivo

Restaurar el proyecto a su estructura original, con React + Firebase en la raíz y eliminando todo lo relacionado con Laravel.

## 📋 Pasos

### Opción 1: Usar el Script (Recomendado)

```bash
cd ~/clients.dowgroupcol.com

# Hacer backup por si acaso
cp -r current current-backup-$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# Ejecutar script
bash scripts/restaurar-estructura-original.sh
```

### Opción 2: Manual

```bash
cd ~/clients.dowgroupcol.com

# 1. Mover archivos de current/ a la raíz
cd current
mv src ../
mv dist ../
mv package.json ../
mv package-lock.json ../
mv node_modules ../
mv vite.config.js ../
mv tailwind.config.js ../
mv postcss.config.js ../
mv index.html ../
mv send-email.php ../
mv upload.php ../
mv uploads ../
mv firebase.json ../
mv firebase-rules.txt ../
mv functions ../
mv Dockerfile ../
mv docker-compose.yml ../
mv .htaccess ../

cd ..

# 2. Eliminar directorios
rm -rf current
rm -rf new  # Laravel (opcional, puedes conservarlo)

# 3. Verificar
ls -la
```

## ✅ Verificación

Después de restaurar:

```bash
# Verificar estructura
ls -la

# Deberías ver:
# - src/
# - dist/
# - package.json
# - vite.config.js
# - etc.

# Hacer build para verificar
npm install
npm run build
```

## 🗑️ Limpieza Opcional

Si quieres eliminar también la documentación y scripts de Laravel:

```bash
# Eliminar docs de Laravel (opcional)
rm -f docs/*LARAVEL*.md
rm -f docs/*Laravel*.md
rm -f docs/*MIGRACION*.md

# Eliminar scripts de Laravel (opcional)
rm -f scripts/*laravel*.sh
rm -f scripts/*Laravel*.sh
```

## 📝 Nota

- El directorio `shared/` puede conservarse (no interfiere)
- Los scripts y docs de Laravel son solo información, no afectan el funcionamiento
- Si quieres mantenerlos para referencia, puedes dejarlos

## 🎯 Estructura Final

```
gestor-cobros/
├── src/              ← React source
├── dist/             ← Build compilado
├── node_modules/     ← Dependencias
├── package.json      ← Configuración npm
├── vite.config.js    ← Configuración Vite
├── send-email.php    ← Endpoint PHP
├── upload.php        ← Endpoint PHP
├── uploads/          ← Archivos subidos
├── firebase.json     ← Config Firebase
└── functions/        ← Firebase Functions
```

## ✅ Listo!

Después de restaurar, tu proyecto estará como estaba originalmente.

