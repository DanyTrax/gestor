# Instalación Manual de Laravel - Paso a Paso

Si no tienes Composer instalado, puedes hacerlo manualmente:

## 📋 Pasos Manuales

### 1. Preparar directorio new/

```bash
cd new

# Mover archivos existentes a temporal
mkdir -p ../temp-our-files
[ -d "app" ] && mv app ../temp-our-files/
[ -d "database" ] && mv database ../temp-our-files/
[ -d "routes" ] && mv routes ../temp-our-files/
[ -d "bootstrap" ] && mv bootstrap ../temp-our-files/
[ -f "composer.json" ] && mv composer.json ../temp-our-files/composer-our.json
```

### 2. Instalar Laravel

```bash
# Instalar Laravel (requiere Composer)
composer create-project laravel/laravel . --prefer-dist

# O si no tienes Composer, descargar manualmente desde:
# https://github.com/laravel/laravel/archive/refs/heads/10.x.zip
# Y extraer en new/
```

### 3. Copiar nuestros archivos

```bash
# Desde la raíz del proyecto
cp -r temp-our-files/app/* new/app/
cp -r temp-our-files/database/migrations/* new/database/migrations/
cp -r temp-our-files/routes/* new/routes/
[ -f temp-our-files/bootstrap/app.php ] && cp temp-our-files/bootstrap/app.php new/bootstrap/app.php

# Limpiar
rm -rf temp-our-files
```

### 4. Instalar dependencias

```bash
cd new
composer require laravel/sanctum
composer require barryvdh/laravel-dompdf
composer require intervention/image
```

### 5. Configurar .env

```bash
cp .env.example .env
php artisan key:generate
```

---

**Recomendación:** Instalar Composer primero para facilitar el proceso.

