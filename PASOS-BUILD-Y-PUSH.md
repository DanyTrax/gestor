# 🔨 Pasos para Build y Push (Ejecutar en tu Terminal Local)

## ⚠️ Importante
Ejecuta estos comandos en **PowerShell** o **CMD** donde tengas `npm` funcionando.

---

## 📋 Pasos a Ejecutar

### 1. Abre tu Terminal (PowerShell o CMD)

### 2. Navega al proyecto:
```bash
cd F:\Repos\Gestor\gestor
```

### 3. Verifica que npm funciona:
```bash
npm --version
```

Si no funciona, usa la ruta completa:
```bash
"C:\Program Files\nodejs\npm.cmd" --version
```

### 4. Instala dependencias (si es necesario):
```bash
npm install
```

### 5. Hace el build:
```bash
npm run build
```

O con ruta completa:
```bash
"C:\Program Files\nodejs\npm.cmd" run build
```

### 6. Verifica que dist/ se creó correctamente:
```bash
dir dist
dir dist\assets
```

Deberías ver `index.html` y archivos `.js` en `assets/`.

### 7. Agrega dist/ al repositorio (forzado):
```bash
git add -f dist/
```

### 8. Agrega otros archivos modificados:
```bash
git add .
```

### 9. Crea el commit:
```bash
git commit -m "build: Agregar logs de depuración para notificaciones de tickets"
```

### 10. Sube al repositorio:
```bash
git push origin main
```

---

## ✅ Después del Push

En el servidor (cPanel), ejecuta:

```bash
cd ~/clients.dowgroupcol.com
git pull origin main
cp -r dist/* .
```

---

## 🔍 Verificación

Después de hacer el build, puedes verificar que los logs están en el código compilado:

```bash
# Buscar los logs en el archivo compilado
findstr /C:"🎫" dist\assets\*.js
findstr /C:"📧" dist\assets\*.js
findstr /C:"📝" dist\assets\*.js
```

Si encuentras estos emojis, el build está correcto.


