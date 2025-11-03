# 🌐 Instalador Web de Laravel

## 🎯 Instalación desde el Navegador

### Paso 1: Subir archivos

1. Hacer `git pull` en el servidor:
   ```bash
   cd ~/clients.dowgroupcol.com
   git pull
   ```

2. O subir manualmente los archivos `new/` vía FTP/cPanel File Manager

### Paso 2: Acceder al Instalador

Abre en tu navegador:
```
https://tudominio.com/new/public/install.php
```

### Paso 3: Seguir los Pasos

El instalador te guía paso a paso:

1. **Verificar Requisitos** - Comprueba PHP, Composer, permisos
2. **Configurar Base de Datos** - Ingresa datos de MySQL
3. **Instalar Laravel** - Ejecuta migraciones y configura
4. **Crear Usuario** - Crea tu primer administrador
5. **Completado** - ¡Listo!

### Paso 4: Eliminar Archivo de Seguridad

**IMPORTANTE:** Después de instalar, elimina `install.php`:
```bash
rm ~/clients.dowgroupcol.com/new/public/install.php
```

O desde cPanel File Manager.

## 🔄 Actualizar la Aplicación

### Opción 1: Usar el Actualizador Web

1. Acceder a:
   ```
   https://tudominio.com/new/public/update.php
   ```

2. Ingresar contraseña (cambiar en el archivo si es necesario)

3. Hacer clic en "Actualizar Todo"

### Opción 2: SSH (Recomendado)

```bash
cd ~/clients.dowgroupcol.com/new
git pull
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
```

## 🔒 Seguridad

### Cambiar Contraseña del Actualizador

Editar `new/public/update.php` línea 8:
```php
$password = 'TU_CONTRASEÑA_SEGURA_AQUI';
```

### Eliminar Archivos Después de Usar

```bash
# Después de instalar
rm ~/clients.dowgroupcol.com/new/public/install.php

# Después de actualizar (opcional, pero recomendado)
rm ~/clients.dowgroupcol.com/new/public/update.php
```

## 📋 Checklist de Instalación

- [ ] Git pull realizado
- [ ] Acceder a install.php en navegador
- [ ] Completar los 4 pasos del instalador
- [ ] Verificar que el login funciona
- [ ] Eliminar install.php
- [ ] Cambiar contraseña de update.php
- [ ] (Opcional) Eliminar update.php después de configurar

## ⚠️ Solución de Problemas

### Error: "No se puede ejecutar composer"

El instalador necesita que Composer esté instalado. Instalar desde SSH:
```bash
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
```

### Error: "Permisos denegados"

Desde SSH:
```bash
cd ~/clients.dowgroupcol.com/new
chmod -R 775 storage bootstrap/cache
chmod -R 755 public
```

### Error: "Base de datos no encontrada"

Verificar que la base de datos existe en cPanel → MySQL Databases

## 🎉 Ventajas del Instalador Web

✅ **No requiere SSH** - Todo desde el navegador  
✅ **Interfaz gráfica** - Fácil de usar  
✅ **Paso a paso** - Guía clara  
✅ **Actualizador incluido** - Para futuras actualizaciones  
✅ **Seguro** - Eliminar después de usar  

## 📞 Siguiente Paso

Después de instalar, accede a:
```
https://tudominio.com/new/public/login
```

E inicia sesión con el usuario creado.

