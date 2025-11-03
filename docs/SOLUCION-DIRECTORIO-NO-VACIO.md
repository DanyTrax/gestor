# Solución: Directorio "new/" no está vacío

## 🔴 Problema

El directorio `new/` ya contiene archivos que creamos (app/, database/, routes/), por lo que Composer no puede instalar Laravel allí.

## ✅ Solución: Instalar Laravel en temporal y mover archivos

### Opción 1: Instalar Laravel en temporal y copiar nuestros archivos

```bash
# Ir al directorio padre
cd /home/dowgroupcol/clients.dowgroupcol.com

# Instalar Laravel en un directorio temporal
composer create-project laravel/laravel temp-laravel --prefer-dist

# Mover archivos de Laravel a new/
mv temp-laravel/* new/
mv temp-laravel/.* new/ 2>/dev/null || true

# Eliminar directorio temporal
rmdir temp-laravel

# Ahora copiar nuestros archivos sobre Laravel
# (Los archivos que creamos ya están en new/, solo necesitamos asegurarnos)
```

### Opción 2: Mover nuestros archivos temporalmente (Recomendado)

```bash
cd /home/dowgroupcol/clients.dowgroupcol.com

# Crear directorio temporal para nuestros archivos
mkdir temp-our-files

# Mover nuestros archivos creados a temporal
mv new/app temp-our-files/
mv new/database temp-our-files/
mv new/routes temp-our-files/
mv new/bootstrap temp-our-files/
mv new/composer.json temp-our-files/composer-our.json

# Ahora instalar Laravel
cd new
composer create-project laravel/laravel . --prefer-dist

# Copiar nuestros archivos de vuelta
cd ..
cp -r temp-our-files/app/* new/app/
cp -r temp-our-files/database/* new/database/migrations/
cp -r temp-our-files/routes/* new/routes/
cp temp-our-files/composer-our.json new/composer.json

# Eliminar temporal
rm -rf temp-our-files
```

### Opción 3: Instalar Laravel en otro directorio y renombrar (Más simple)

```bash
cd /home/dowgroupcol/clients.dowgroupcol.com

# Instalar Laravel en un directorio nuevo
composer create-project laravel/laravel laravel-new --prefer-dist

# Mover nuestros archivos a Laravel
cp -r new/app/* laravel-new/app/
cp -r new/database/migrations/* laravel-new/database/migrations/
cp -r new/routes/* laravel-new/routes/
cp new/bootstrap/app.php laravel-new/bootstrap/app.php

# Reemplazar new/ con Laravel
rm -rf new
mv laravel-new new
```

## 🎯 Recomendación: Opción 3 (Más simple)

Esta es la más sencilla y limpia. Ejecuta estos comandos:

```bash
cd /home/dowgroupcol/clients.dowgroupcol.com

# Instalar Laravel en directorio temporal
composer create-project laravel/laravel laravel-new --prefer-dist

# Copiar nuestros archivos creados
cp -r new/app/* laravel-new/app/
cp -r new/database/migrations/* laravel-new/database/migrations/
cp -r new/routes/* laravel-new/routes/
cp new/bootstrap/app.php laravel-new/bootstrap/app.php 2>/dev/null || true

# Reemplazar directorio
rm -rf new
mv laravel-new new

# Ahora instalar dependencias adicionales
cd new
composer require laravel/sanctum
composer require barryvdh/laravel-dompdf
composer require intervention/image
```

## ✅ Después de esto, continuar con:

1. Configurar `.env`
2. Ejecutar migraciones
3. Crear usuario inicial
4. Configurar permisos

