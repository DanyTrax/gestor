# Habilitar Extensión fileinfo en cPanel

## 🔴 Problema

Error: `ext-fileinfo * -> it is missing from your system`

Laravel requiere la extensión `fileinfo` de PHP, pero no está habilitada en el servidor.

## ✅ Solución: Habilitar fileinfo en cPanel

### Método 1: Desde cPanel (Más Fácil)

1. **Accede a cPanel**
2. Busca **"Select PHP Version"** o **"PHP Version"**
3. Click en **"Extensions"** o **"Extensiones"**
4. Busca **`fileinfo`** en la lista
5. **Marca el checkbox** para habilitarlo
6. Click en **"Save"** o **"Guardar"**

### Método 2: Desde WHM (Si tienes acceso root)

1. **WHM** → **"MultiPHP Manager"** o **"PHP Configuration"**
2. Selecciona el dominio: `clients.dowgroupcol.com`
3. Click en **"Extensions"**
4. Busca y habilita **`fileinfo`**
5. Guardar

### Método 3: Verificar desde Terminal

```bash
# Verificar si fileinfo está habilitado
php -m | grep fileinfo

# Si no aparece, habilitarlo manualmente
```

### Método 4: Habilitar Manualmente (Avanzado)

Si no puedes desde la interfaz, editar php.ini:

```bash
# Encontrar php.ini
php --ini

# Editar php.ini
nano /opt/cpanel/ea-php81/root/etc/php.ini

# Buscar y descomentar (quitar ;)
extension=fileinfo

# Guardar y reiniciar PHP-FPM
sudo systemctl restart php-fpm
```

## 🔍 Verificar que está habilitado

Después de habilitar, verificar:

```bash
php -m | grep fileinfo
```

Debería mostrar: `fileinfo`

## 🚀 Continuar con la Instalación

Una vez habilitado `fileinfo`, continuar:

```bash
cd /home/dowgroupcol/clients.dowgroupcol.com/new

# Intentar instalar dependencias nuevamente
composer require laravel/sanctum
composer require barryvdh/laravel-dompdf
composer require intervention/image
```

## ⚠️ Si aún no funciona

Si después de habilitar fileinfo sigue fallando, puedes ignorar temporalmente (no recomendado):

```bash
composer require laravel/sanctum --ignore-platform-req=ext-fileinfo
composer require barryvdh/laravel-dompdf --ignore-platform-req=ext-fileinfo
composer require intervention/image --ignore-platform-req=ext-fileinfo
```

Pero es mejor habilitar fileinfo correctamente.

## 📋 Checklist

- [ ] Acceder a cPanel → Select PHP Version
- [ ] Ir a Extensions
- [ ] Habilitar `fileinfo`
- [ ] Guardar cambios
- [ ] Verificar: `php -m | grep fileinfo`
- [ ] Continuar instalación de dependencias

---

¿Puedes habilitar fileinfo desde cPanel?

