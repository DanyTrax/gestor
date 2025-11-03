# Habilitar fileinfo desde WHM (Root)

## 🎯 Método 1: Desde WHM Interface (Recomendado)

### Opción A: MultiPHP Manager

1. **WHM** → Busca **"MultiPHP Manager"**
2. Selecciona el dominio o cuenta: `dowgroupcol` o `clients.dowgroupcol.com`
3. Selecciona versión PHP: **PHP 8.1** (o la que estés usando)
4. Click en **"Extensions"** o **"Extensiones"**
5. Busca **`fileinfo`** en la lista
6. **Marca el checkbox** para habilitarlo
7. Click en **"Save"** o **"Guardar"**

### Opción B: PHP Configuration

1. **WHM** → Busca **"PHP Configuration"**
2. Selecciona versión PHP: **ea-php81** (PHP 8.1)
3. Click en **"Extensions"**
4. Busca y habilita **`fileinfo`**
5. Guardar

## 🎯 Método 2: Desde Terminal (Root)

### Verificar php.ini actual

```bash
# Ver qué archivo php.ini se está usando
php --ini

# Verificar si fileinfo está habilitado
php -m | grep fileinfo
```

### Habilitar fileinfo manualmente

```bash
# Editar php.ini para PHP 8.1
nano /opt/cpanel/ea-php81/root/etc/php.ini
```

O usar vi:
```bash
vi /opt/cpanel/ea-php81/root/etc/php.ini
```

Buscar la línea:
```ini
;extension=fileinfo
```

Cambiar a (quitar el `;`):
```ini
extension=fileinfo
```

Guardar:
- **nano**: `Ctrl + X`, luego `Y`, luego `Enter`
- **vi**: `:wq` y `Enter`

### Reiniciar PHP-FPM

```bash
# Reiniciar PHP-FPM para PHP 8.1
systemctl restart ea-php81-php-fpm

# O si no funciona:
service ea-php81-php-fpm restart
```

### Verificar que se habilitó

```bash
php -m | grep fileinfo
```

Debería mostrar: `fileinfo`

## 🎯 Método 3: Usar EasyApache 4 (Si está disponible)

1. **WHM** → **"EasyApache 4"**
2. Click en **"Customize"** en el perfil actual
3. Busca **"PHP Extensions"**
4. Busca **`fileinfo`**
5. **Habilita** la extensión
6. **Review & Provision** → **Provision**

## 🔍 Verificar Extensión

Después de habilitar, verificar desde terminal:

```bash
# Ver todas las extensiones habilitadas
php -m

# O buscar específicamente fileinfo
php -m | grep fileinfo

# Ver información de fileinfo
php -i | grep fileinfo
```

## ⚠️ Si no aparece en la lista de extensiones

Algunas veces `fileinfo` viene compilado en PHP y solo necesita estar habilitado en php.ini:

```bash
# Ver si está compilado
php -i | grep "fileinfo support"

# Si dice "enabled", solo necesita estar en php.ini
# Si dice "disabled", necesita instalarse
```

## 🚀 Después de Habilitar

Una vez habilitado, continuar con:

```bash
cd /home/dowgroupcol/clients.dowgroupcol.com/new

# Ahora debería funcionar
composer require laravel/sanctum
composer require barryvdh/laravel-dompdf
composer require intervention/image
```

## 📋 Comandos Rápidos (Root)

```bash
# 1. Verificar php.ini
php --ini

# 2. Editar php.ini
nano /opt/cpanel/ea-php81/root/etc/php.ini

# 3. Buscar y descomentar: extension=fileinfo

# 4. Reiniciar PHP-FPM
systemctl restart ea-php81-php-fpm

# 5. Verificar
php -m | grep fileinfo
```

---

¿Quieres que te guíe paso a paso desde terminal?

