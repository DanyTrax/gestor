# 🔧 Solución: Directorio vendor/ Faltante

## ❌ Problema

Error: `vendor/autoload.php: No such file or directory`

Esto significa que **las dependencias de Composer no están instaladas**.

## ✅ Solución

### Opción 1: Instalar desde SSH (Recomendado)

```bash
cd ~/clients.dowgroupcol.com/new
composer install --no-dev --optimize-autoloader
```

**Si no tienes Composer instalado:**

```bash
# Instalar Composer
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
chmod +x /usr/local/bin/composer

# Luego instalar dependencias
cd ~/clients.dowgroupcol.com/new
composer install --no-dev --optimize-autoloader
```

### Opción 2: Desde cPanel Terminal

1. Ir a cPanel → **Terminal**
2. Ejecutar:
   ```bash
   cd ~/clients.dowgroupcol.com/new
   composer install --no-dev --optimize-autoloader
   ```

### Opción 3: Verificar si Composer existe

```bash
which composer
composer --version
```

Si no existe, instalar como en Opción 1.

## ⚠️ Importante

**El directorio `vendor/` contiene todas las dependencias de Laravel.** Sin él, Laravel no puede funcionar.

## 📋 Después de Instalar

1. Verificar que vendor/ existe:
   ```bash
   ls -la vendor/ | head -10
   ```

2. Verificar autoload:
   ```bash
   ls -la vendor/autoload.php
   ```

3. Probar Laravel:
   ```bash
   php artisan --version
   ```

4. Acceder al login:
   ```
   https://clients.dowgroupcol.com/new/public/login
   ```

## 🔍 Verificar Instalación

```bash
cd ~/clients.dowgroupcol.com/new

# Verificar que vendor existe
ls vendor/

# Verificar que composer.json está
ls composer.json

# Verificar que composer.lock existe
ls composer.lock

# Si todo existe, instalar:
composer install --no-dev --optimize-autoloader
```

## ⏱️ Tiempo Estimado

La instalación puede tardar 2-5 minutos dependiendo de la conexión.

## ✅ Checklist

- [ ] Composer instalado (`composer --version`)
- [ ] En directorio correcto (`cd ~/clients.dowgroupcol.com/new`)
- [ ] Ejecutar `composer install --no-dev --optimize-autoloader`
- [ ] Verificar que `vendor/` existe
- [ ] Probar `php artisan --version`
- [ ] Acceder a `/login`

