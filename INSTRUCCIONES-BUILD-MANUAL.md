# 🔨 Instrucciones para Build Manual

## ⚠️ Problema Detectado

Node.js no está correctamente configurado en el PATH de tu sistema. Necesitas ejecutar el build manualmente desde una terminal donde Node.js esté disponible.

---

## ✅ Solución: Build Manual

### Opción 1: Desde Terminal con Node.js Configurado

1. **Abre una nueva terminal** (CMD, PowerShell, o Git Bash)
2. **Verifica que Node.js funciona:**
   ```bash
   node --version
   npm --version
   ```

3. **Si Node.js funciona, ejecuta:**
   ```bash
   cd F:\Repos\Gestor\gestor
   npm install
   npm run build
   ```

4. **Luego agrega dist/ al repo:**
   ```bash
   git add -f dist/
   git commit -m "build: Actualizar build de producción"
   git push origin main
   ```

---

### Opción 2: Usar el Script Automático

Si Node.js está en el PATH en otra terminal:

**Windows:**
```bash
cd F:\Repos\Gestor\gestor
build-and-push.bat
```

**Linux/Mac:**
```bash
cd /ruta/al/proyecto
chmod +x build-and-push.sh
./build-and-push.sh
```

---

### Opción 3: Configurar Node.js en el PATH

Si Node.js está instalado pero no en el PATH:

1. **Encuentra la ubicación de Node.js:**
   - Generalmente: `C:\Program Files\nodejs\`

2. **Agrega al PATH de Windows:**
   - Presiona `Win + R`, escribe `sysdm.cpl`, Enter
   - Pestaña "Opciones avanzadas" → "Variables de entorno"
   - En "Variables del sistema", busca "Path"
   - Click "Editar" → "Nuevo"
   - Agrega: `C:\Program Files\nodejs\`
   - Click "Aceptar" en todas las ventanas
   - **Reinicia la terminal**

3. **Verifica:**
   ```bash
   node --version
   npm --version
   ```

---

## 🚀 Pasos Rápidos (Una vez Node.js funcione)

```bash
# 1. Ir al directorio del proyecto
cd F:\Repos\Gestor\gestor

# 2. Instalar dependencias (solo primera vez)
npm install

# 3. Hacer build
npm run build

# 4. Agregar dist/ al repositorio
git add -f dist/

# 5. Commit y push
git commit -m "build: Actualizar build de producción"
git push origin main
```

---

## 📋 Verificación

Después del build, verifica que `dist/` existe:

```bash
ls dist/
# O en Windows:
dir dist
```

Deberías ver:
- `index.html`
- `assets/` (con archivos .js y .css)

---

## 🎯 En el Servidor (cPanel)

Una vez que subas el build al repo:

```bash
# Desde Terminal de cPanel o SSH
cd ~/public_html
git pull origin main

# Verificar que dist/ existe
ls -la dist/
```

---

## 💡 Alternativa: Usar VS Code Terminal

Si usas VS Code:

1. Abre VS Code
2. Abre la terminal integrada (`Ctrl + `` ` ``)
3. Ejecuta los comandos desde ahí
4. VS Code generalmente tiene Node.js en el PATH

---

## ✅ Checklist

- [ ] Node.js instalado y funcionando (`node --version`)
- [ ] npm funcionando (`npm --version`)
- [ ] En el directorio correcto del proyecto
- [ ] `npm install` ejecutado (si es necesario)
- [ ] `npm run build` ejecutado exitosamente
- [ ] `dist/` creado con archivos
- [ ] `git add -f dist/` ejecutado
- [ ] Commit creado
- [ ] Push al repositorio exitoso

---

**¿Necesitas ayuda para configurar Node.js en el PATH?** Puedo guiarte paso a paso.

