# 🚀 Pasos Después de Git Pull en el Servidor

## ⚠️ IMPORTANTE

Después de hacer `git pull`, **SIEMPRE** debes copiar el contenido de `dist/` a la raíz del dominio.

---

## 📋 Pasos a Ejecutar en el Servidor (cPanel SSH/Terminal)

### 1. Navegar al directorio del proyecto:
```bash
cd ~/clients.dowgroupcol.com
```

### 2. Hacer pull (si aún no lo hiciste):
```bash
git pull origin main
```

### 3. **CRÍTICO: Copiar contenido de dist/ a la raíz:**
```bash
# Copiar todo el contenido de dist/ a la raíz
cp -r dist/* .

# Si hay un .htaccess en dist/, copiarlo también
cp dist/.htaccess . 2>/dev/null || true
```

### 4. Verificar que los archivos estén en la raíz:
```bash
ls -la
```

**Deberías ver:**
- ✅ `index.html` (en la raíz, no dentro de `dist/`)
- ✅ `assets/` (carpeta en la raíz, no dentro de `dist/`)
- ✅ `send-email.php`
- ✅ `upload.php`
- ✅ `send-zoho.php`

### 5. Configurar permisos (opcional pero recomendado):
```bash
# Permisos para archivos
find . -type f -exec chmod 644 {} \;

# Permisos para directorios
find . -type d -exec chmod 755 {} \;

# Permisos especiales para uploads/
chmod -R 775 uploads/ 2>/dev/null || true
```

---

## 🔍 Verificación

### Verificar que los archivos compilados tienen los logs:

```bash
# Buscar los logs en el archivo JS compilado
grep -r "🎫" assets/*.js
grep -r "📧" assets/*.js
grep -r "📝" assets/*.js
```

Si encuentras estos emojis, los archivos están correctos.

---

## 🌐 En el Navegador

### 1. Limpia la caché del navegador:
- **Chrome/Edge:** `Ctrl + Shift + R` o `Ctrl + F5`
- **Firefox:** `Ctrl + Shift + R` o `Ctrl + F5`
- O abre en modo incógnito/privado

### 2. Abre la consola del navegador:
- Presiona `F12`
- Ve a la pestaña **"Console"** o **"Consola"**

### 3. Crea un nuevo ticket

### 4. Deberías ver estos logs en la consola:
```
🎫 handleCreateTicket llamado - Iniciando creación de ticket
🎫 Creando ticket en Firestore...
📧 Iniciando envío de notificaciones por email para ticket: ...
📧 Enviando email al cliente: ...
📧 Resultado email cliente: ...
📧 Enviando email al administrador: ...
📧 Resultado email administrador: ...
📝 Registrando mensaje en Firestore: ...
```

---

## ❌ Si Aún No Aparecen los Logs

### 1. Verifica que copiaste los archivos:
```bash
cd ~/clients.dowgroupcol.com
ls -la assets/
```

### 2. Verifica que los archivos JS tienen los logs:
```bash
grep -l "handleCreateTicket" assets/*.js
```

### 3. Verifica la fecha de modificación de los archivos:
```bash
ls -lht assets/*.js | head -5
```

Los archivos deberían tener una fecha reciente (hoy).

### 4. Fuerza la recarga del navegador:
- Cierra todas las pestañas del sitio
- Cierra el navegador completamente
- Abre de nuevo y limpia la caché (`Ctrl + Shift + R`)

---

## 🔄 Script Automatizado (Opcional)

Puedes crear un script `deploy.sh` en el servidor:

```bash
#!/bin/bash
cd ~/clients.dowgroupcol.com
git pull origin main
cp -r dist/* .
cp dist/.htaccess . 2>/dev/null || true
chmod -R 755 assets/
chmod 644 index.html
echo "✅ Despliegue completado"
```

**Ejecutar:**
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## ✅ Checklist

- [ ] `git pull` ejecutado
- [ ] `cp -r dist/* .` ejecutado
- [ ] `index.html` está en la raíz (verificado con `ls -la`)
- [ ] Carpeta `assets/` está en la raíz (verificado con `ls -la`)
- [ ] Los archivos JS tienen los logs (verificado con `grep`)
- [ ] Caché del navegador limpiada
- [ ] Consola del navegador abierta
- [ ] Ticket creado y logs visibles

