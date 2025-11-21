# 🔨 Instrucciones para Build y Despliegue

## ⚠️ Problema Actual
Los logs de depuración no aparecen porque el código compilado en el servidor no tiene los cambios más recientes.

## ✅ Solución: Build Local y Despliegue

### Paso 1: Build Local (En tu Computadora)

Abre **PowerShell** o **CMD** y ejecuta:

```bash
# 1. Ir al directorio del proyecto
cd F:\Repos\Gestor\gestor

# 2. Verificar que npm funciona
npm --version

# 3. Si npm no funciona, necesitas agregar Node.js al PATH o usar la ruta completa
# Ejemplo: "C:\Program Files\nodejs\npm.cmd" --version

# 4. Instalar dependencias (si no están)
npm install

# 5. Hacer build
npm run build
```

**Verificar que dist/ se creó:**
```bash
dir dist
# Deberías ver index.html y assets/
```

### Paso 2: Subir al Repositorio

```bash
# 1. Agregar dist/ forzadamente (aunque esté en .gitignore)
git add -f dist/

# 2. Agregar otros archivos si hay cambios
git add .

# 3. Crear commit
git commit -m "build: Agregar logs de depuración para notificaciones de tickets"

# 4. Push al repositorio
git push origin main
```

### Paso 3: Desplegar en el Servidor (cPanel)

Conecta al servidor vía **SSH** o **Terminal de cPanel** y ejecuta:

```bash
# 1. Ir al directorio del proyecto
cd ~/clients.dowgroupcol.com

# 2. Hacer pull del repositorio
git pull origin main

# 3. Verificar que dist/ existe
ls -la dist/

# 4. Copiar contenido de dist/ a la raíz
cp -r dist/* .

# 5. Verificar que se copiaron los archivos
ls -la assets/
# Deberías ver archivos .js compilados
```

### Paso 4: Verificar en el Navegador

1. **Limpiar caché del navegador:**
   - Presiona `Ctrl + Shift + R` (o `Ctrl + F5`)
   - O abre en modo incógnito

2. **Crear un ticket nuevo**

3. **Abrir la consola del navegador** (F12 → Consola)

4. **Buscar los logs:**
   - Deberías ver: `🎫 handleCreateTicket llamado`
   - Deberías ver: `📧 Iniciando envío de notificaciones`
   - Deberías ver: `📝 Registrando mensaje en Firestore`

---

## 🔍 Si npm no funciona en tu terminal

### Opción A: Usar la ruta completa de npm

```bash
# Encontrar dónde está instalado Node.js
where node
# Ejemplo: C:\Program Files\nodejs\node.exe

# Usar la ruta completa
"C:\Program Files\nodejs\npm.cmd" install
"C:\Program Files\nodejs\npm.cmd" run build
```

### Opción B: Agregar Node.js al PATH

1. Buscar dónde está Node.js instalado (normalmente `C:\Program Files\nodejs\`)
2. Agregar esa ruta al PATH del sistema
3. Reiniciar la terminal

---

## ✅ Verificación Final

Después del despliegue, cuando crees un ticket, deberías ver en la consola:

```
🎫 handleCreateTicket llamado - Iniciando creación de ticket
🎫 Creando ticket en Firestore...
📧 Iniciando envío de notificaciones por email para ticket: TKT-2025-XXXXX
📧 Enviando email al cliente: cliente@ejemplo.com
📝 Registrando mensaje en Firestore: {...}
✅ Mensaje registrado exitosamente con ID: ...
```

Si NO ves estos logs, significa que:
- El build no se hizo correctamente
- Los archivos no se copiaron correctamente en el servidor
- El navegador está usando una versión en caché


