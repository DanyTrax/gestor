# Habilitar fileinfo desde EasyApache 4 (WHM)

## 🎯 Método: EasyApache 4

EasyApache 4 es la herramienta de WHM para gestionar PHP y Apache. Puedes habilitar extensiones PHP desde ahí.

## 📋 Pasos desde EasyApache 4

### Paso 1: Acceder a EasyApache 4

1. **WHM** → Busca **"EasyApache 4"**
2. Click en **"EasyApache 4"**

### Paso 2: Editar Perfil Actual

1. En la sección **"Currently Installed Packages"**
2. Click en **"Customize"** del perfil activo
   - O busca **"Customize"** en el perfil que uses

### Paso 3: Buscar PHP Extensions

1. En el menú lateral, busca **"PHP Extensions"** o **"Extensiones PHP"**
2. Click en esa sección

### Paso 4: Habilitar fileinfo

1. En la lista de extensiones, busca **`fileinfo`**
2. Si aparece como **deshabilitado** o **no instalado**:
   - Marca el checkbox para **instalarlo/habilitarlo**
3. Si no aparece, puede estar en otra categoría:
   - Busca en **"Additional Packages"** o **"Paquetes Adicionales"**
   - O busca por nombre: `fileinfo`

### Paso 5: Provisionar Cambios

1. Click en **"Review"** o **"Revisar"**
2. Verifica que `fileinfo` esté en la lista de cambios
3. Click en **"Provision"** o **"Aprovisionar"**
4. Espera a que termine la compilación (puede tomar varios minutos)

### Paso 6: Verificar

Una vez terminado, verificar desde terminal:

```bash
php -m | grep fileinfo
```

Debería mostrar: `fileinfo`

## 🔍 Alternativa: Select PHP Version

Si EasyApache 4 no muestra fileinfo, también puedes:

1. **WHM** → **"MultiPHP Manager"**
2. Selecciona el dominio/account
3. Click en **"Extensions"**
4. Busca y habilita **`fileinfo`**

## ⚠️ Nota Importante

**fileinfo** generalmente viene **compilado en PHP**, no necesita instalarse como extensión separada. Solo necesita estar **habilitado** en `php.ini`.

Si no aparece en EasyApache 4, significa que:
- Ya está compilado en PHP
- Solo necesitas habilitarlo en `php.ini` (ver método anterior)

## 🚀 Verificar si está compilado

```bash
php -i | grep "fileinfo support"
```

Si dice **"enabled"**, solo necesitas habilitarlo en `php.ini`.

Si dice **"disabled"**, necesitas instalarlo desde EasyApache 4.

## 📋 Método Rápido (Si no aparece en EasyApache)

Si no aparece en EasyApache 4, habilitarlo directamente en `php.ini`:

```bash
# Editar php.ini
nano /opt/cpanel/ea-php81/root/etc/php.ini

# Buscar y descomentar:
# ;extension=fileinfo
# Cambiar a:
extension=fileinfo

# Guardar y reiniciar
systemctl restart ea-php81-php-fpm
```

---

¿Quieres intentar desde EasyApache 4 o prefieres habilitarlo directamente en php.ini?

