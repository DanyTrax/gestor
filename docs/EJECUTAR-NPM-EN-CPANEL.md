# 🔧 Ejecutar npm install y npm run build en cPanel

## ❌ Problema

No puedes ejecutar `npm install` o `npm run build` en cPanel. El sistema dice que falta algo o no encuentra npm.

---

## ✅ Solución: Verificar y Configurar Node.js en cPanel

### Paso 1: Verificar si Node.js está Instalado

#### Opción A: Desde Terminal de cPanel

1. En cPanel, busca **"Terminal"** o **"SSH Access"**
2. Click en **"Open Terminal"** o **"Launch Terminal"**
3. Ejecuta:

```bash
# Verificar si Node.js está instalado
node --version

# Verificar si npm está instalado
npm --version
```

**Si muestra versiones:** Node.js está instalado, ve al Paso 2.

**Si dice "command not found":** Node.js NO está instalado, ve al Paso 1.1.

#### Opción B: Verificar desde SSH

```bash
ssh usuario@tu-servidor

# Verificar Node.js
which node
node --version

# Verificar npm
which npm
npm --version
```

---

### Paso 1.1: Instalar Node.js en cPanel (Si no está instalado)

#### Método 1: Usar Node Version Manager (nvm) - Recomendado

```bash
# Conectar por SSH o Terminal de cPanel
ssh usuario@tu-servidor

# Instalar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recargar el perfil
source ~/.bashrc
# O si usas zsh:
# source ~/.zshrc

# Instalar Node.js LTS (versión estable)
nvm install --lts
nvm use --lts
nvm alias default node

# Verificar instalación
node --version
npm --version
```

#### Método 2: Instalar Node.js Globalmente (Requiere Root/WHM)

Si tienes acceso root o WHM:

```bash
# Desde WHM o como root
# En CentOS/RHEL:
yum install -y nodejs npm

# En Ubuntu/Debian:
apt-get update
apt-get install -y nodejs npm

# Verificar
node --version
npm --version
```

#### Método 3: Instalar Node.js en el Home del Usuario (Sin Root)

```bash
# Crear directorio para Node.js
mkdir -p ~/nodejs
cd ~/nodejs

# Descargar Node.js (ajusta la versión según necesites)
wget https://nodejs.org/dist/v20.11.0/node-v20.11.0-linux-x64.tar.xz

# Extraer
tar -xf node-v20.11.0-linux-x64.tar.xz

# Agregar al PATH (agregar a ~/.bashrc)
echo 'export PATH=$HOME/nodejs/node-v20.11.0-linux-x64/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Verificar
node --version
npm --version
```

---

### Paso 2: Verificar que package.json Existe

```bash
# Ir al directorio del proyecto
cd ~/public_html
# O donde tengas el proyecto:
# cd ~/clients.dowgroupcol.com/current
# cd ~/tu-directorio

# Verificar que package.json existe
ls -la package.json

# Si no existe, verificar estructura
ls -la
```

**Si `package.json` no existe:**
- El proyecto no está completo
- Necesitas clonar el repositorio o subir los archivos

---

### Paso 3: Ejecutar npm install

```bash
# Asegúrate de estar en el directorio correcto
cd ~/public_html  # O tu directorio del proyecto

# Verificar que estás en el lugar correcto
pwd
ls -la package.json

# Ejecutar npm install
npm install
```

**Si da error de permisos:**
```bash
# Dar permisos al directorio
chmod -R 755 ~/public_html
chown -R usuario:usuario ~/public_html
```

**Si da error de memoria:**
```bash
# Aumentar límite de memoria de Node.js
NODE_OPTIONS="--max-old-space-size=4096" npm install
```

---

### Paso 4: Ejecutar npm run build

```bash
# Asegúrate de estar en el directorio del proyecto
cd ~/public_html  # O tu directorio

# Ejecutar build
npm run build
```

**Si da error de memoria:**
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

**El build generará:**
- `dist/` - Archivos compilados listos para producción

---

## 🔍 Verificación Post-Instalación

### Verificar que npm install funcionó:

```bash
# Verificar que node_modules existe
ls -la node_modules/ | head -10

# Verificar que las dependencias están instaladas
ls -la node_modules/react
ls -la node_modules/vite
```

### Verificar que npm run build funcionó:

```bash
# Verificar que dist/ existe
ls -la dist/

# Deberías ver:
# - index.html
# - assets/
# - etc.
```

---

## 🐛 Solución de Problemas Comunes

### Error: "npm: command not found"

**Causa:** Node.js/npm no está instalado o no está en el PATH.

**Solución:**
1. Instalar Node.js (ver Paso 1.1)
2. Verificar que está en el PATH:
   ```bash
   echo $PATH
   which node
   which npm
   ```

### Error: "EACCES: permission denied"

**Causa:** Permisos insuficientes.

**Solución:**
```bash
# Dar permisos al directorio
chmod -R 755 ~/public_html
chown -R $(whoami):$(whoami) ~/public_html

# O usar npm con --unsafe-perm
npm install --unsafe-perm
```

### Error: "JavaScript heap out of memory"

**Causa:** Memoria insuficiente para el build.

**Solución:**
```bash
# Aumentar memoria de Node.js
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# O si sigue fallando, aumentar más:
NODE_OPTIONS="--max-old-space-size=8192" npm run build
```

### Error: "Cannot find module 'package.json'"

**Causa:** No estás en el directorio correcto.

**Solución:**
```bash
# Verificar ubicación actual
pwd

# Ir al directorio del proyecto
cd ~/public_html  # O donde esté tu proyecto

# Verificar que package.json existe
ls -la package.json
```

### Error: "ENOENT: no such file or directory"

**Causa:** Falta algún archivo del proyecto.

**Solución:**
1. Verificar que todos los archivos están subidos
2. Verificar estructura:
   ```bash
   ls -la
   # Debe mostrar: package.json, src/, etc.
   ```

---

## 📋 Checklist Completo

- [ ] Node.js instalado (`node --version`)
- [ ] npm instalado (`npm --version`)
- [ ] package.json existe en el directorio
- [ ] Estás en el directorio correcto del proyecto
- [ ] Permisos correctos en el directorio
- [ ] `npm install` ejecutado exitosamente
- [ ] `node_modules/` creado
- [ ] `npm run build` ejecutado exitosamente
- [ ] `dist/` creado con archivos compilados

---

## 🚀 Alternativa: Build Local y Subir dist/

Si no puedes ejecutar npm en cPanel, puedes hacer el build localmente y subir solo `dist/`:

### En tu Computadora Local:

```bash
# Clonar o ir al proyecto
cd gestor-cobros

# Instalar dependencias
npm install

# Hacer build
npm run build

# El resultado estará en dist/
```

### Subir a cPanel:

1. Usar **File Manager** de cPanel o **FTP**
2. Subir todo el contenido de `dist/` a `public_html/`
3. Subir también `send-email.php`, `upload.php`, `send-zoho.php`
4. Subir `.htaccess`

**Estructura final en cPanel:**
```
public_html/
├── index.html          ← De dist/
├── assets/             ← De dist/
├── send-email.php
├── upload.php
├── send-zoho.php
├── .htaccess
└── uploads/            ← Crear con permisos 775
```

---

## 💡 Recomendación

**Para producción en cPanel, es mejor:**
1. Hacer el build localmente
2. Subir solo `dist/` + archivos PHP
3. No subir `node_modules/` ni `src/` (no son necesarios en producción)

Esto es más rápido y consume menos espacio en el servidor.

---

## 📝 Notas Importantes

1. **Node.js en cPanel:** No todos los hosts tienen Node.js instalado por defecto
2. **Memoria:** El build puede requerir bastante memoria (2-4GB)
3. **Tiempo:** `npm install` puede tardar 5-10 minutos la primera vez
4. **Espacio:** `node_modules/` puede ocupar 200-500MB

---

## ✅ Comando Rápido (Todo en Uno)

Si Node.js ya está instalado:

```bash
cd ~/public_html && \
npm install && \
npm run build && \
echo "✅ Build completado! Revisa dist/"
```

---

**¿Sigue sin funcionar?** Verifica:
1. ¿Node.js está instalado? (`node --version`)
2. ¿Estás en el directorio correcto? (`pwd` y `ls package.json`)
3. ¿Tienes permisos? (`ls -la`)
4. ¿Hay suficiente memoria? (verificar con `free -h`)

