# 🔍 Diagnóstico: Página en Blanco

## ⚠️ Problema
Después de hacer `git pull` y `cp -r dist/* .`, la página quedó en blanco.

## 🔧 Pasos de Diagnóstico

### 1. Verificar que los archivos se copiaron correctamente

En el servidor (SSH/Terminal de cPanel):

```bash
cd ~/clients.dowgroupcol.com

# Verificar que index.html existe en la raíz
ls -la index.html

# Verificar que assets/ existe
ls -la assets/

# Verificar que hay archivos JS en assets/
ls -la assets/*.js

# Verificar el tamaño de los archivos (deben ser grandes, no 0 bytes)
ls -lh assets/*.js
```

**Deberías ver:**
- ✅ `index.html` en la raíz
- ✅ Carpeta `assets/` en la raíz
- ✅ Archivos `.js` y `.css` dentro de `assets/`
- ✅ Los archivos deben tener tamaño > 0 bytes

### 2. Verificar el contenido de index.html

```bash
cat index.html
```

**Debería mostrar:**
```html
<!doctype html>
<html lang="es">
  <head>
    ...
    <script type="module" crossorigin src="/assets/index-XXXXX.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-XXXXX.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

### 3. Verificar que los archivos JS existen

El `index.html` referencia archivos como `/assets/index-XXXXX.js`. Verifica que ese archivo existe:

```bash
# Ver qué archivos JS hay en assets/
ls -la assets/*.js

# El nombre debe coincidir con el que está en index.html
```

### 4. Verificar permisos de archivos

```bash
# Los archivos deben ser legibles
chmod 644 index.html
chmod 644 assets/*.js
chmod 644 assets/*.css
chmod 755 assets/
```

### 5. Verificar en el navegador

1. **Abre la consola del navegador** (F12 → Console)
2. **Revisa si hay errores** (deberían aparecer en rojo)
3. **Revisa la pestaña Network** (F12 → Network)
   - Recarga la página (F5)
   - Verifica que `index.html` se carga (status 200)
   - Verifica que los archivos `.js` y `.css` se cargan (status 200)
   - Si algún archivo muestra 404, ese es el problema

### 6. Verificar rutas de assets

Si los archivos no se cargan, puede ser un problema de rutas. Verifica:

```bash
# Ver el contenido de index.html y las rutas
grep -o 'src="[^"]*"' index.html
grep -o 'href="[^"]*"' index.html
```

Las rutas deben empezar con `/assets/` (ruta absoluta), no `assets/` (ruta relativa).

## 🚨 Soluciones Comunes

### Solución 1: Re-copiar archivos

```bash
cd ~/clients.dowgroupcol.com

# Eliminar archivos antiguos
rm -rf assets/
rm -f index.html

# Re-copiar desde dist/
cp -r dist/* .

# Verificar
ls -la
```

### Solución 2: Verificar que dist/ tiene los archivos

```bash
cd ~/clients.dowgroupcol.com

# Verificar que dist/ existe y tiene contenido
ls -la dist/
ls -la dist/assets/

# Si dist/ está vacío o no existe, hacer build de nuevo
```

### Solución 3: Limpiar caché del navegador

1. **Chrome/Edge:**
   - Presiona `Ctrl + Shift + Delete`
   - Selecciona "Imágenes y archivos en caché"
   - Haz clic en "Borrar datos"
   - O usa modo incógnito: `Ctrl + Shift + N`

2. **Firefox:**
   - Presiona `Ctrl + Shift + Delete`
   - Selecciona "Caché"
   - Haz clic en "Limpiar ahora"

### Solución 4: Verificar errores de JavaScript

Si hay errores en la consola, compártelos. Los errores más comunes son:

- **404 en archivos JS/CSS:** Los archivos no se copiaron correctamente
- **CORS errors:** Problema de configuración del servidor
- **Syntax errors:** Error en el código JavaScript
- **Module not found:** Problema con imports

### Solución 5: Verificar .htaccess (si existe)

Si hay un `.htaccess`, verifica que no esté bloqueando los archivos:

```bash
cat .htaccess
```

## 📋 Checklist de Verificación

Ejecuta estos comandos y comparte los resultados:

```bash
cd ~/clients.dowgroupcol.com

echo "=== Verificando estructura ==="
ls -la | head -20

echo "=== Verificando index.html ==="
ls -lh index.html
head -15 index.html

echo "=== Verificando assets/ ==="
ls -lh assets/ | head -10

echo "=== Verificando archivos JS ==="
ls -lh assets/*.js

echo "=== Verificando permisos ==="
stat -c "%a %n" index.html
stat -c "%a %n" assets/
```

## 🔄 Si Nada Funciona

1. **Hacer build local de nuevo:**
   ```bash
   # En tu computadora local
   npm run build
   git add -f dist/
   git commit -m "fix: Rebuild para corregir página en blanco"
   git push
   ```

2. **En el servidor:**
   ```bash
   cd ~/clients.dowgroupcol.com
   git pull
   rm -rf assets/ index.html
   cp -r dist/* .
   chmod -R 755 assets/
   chmod 644 index.html
   ```

3. **Verificar de nuevo en el navegador con caché limpia**

