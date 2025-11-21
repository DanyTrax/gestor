# 🔨 Build Local y Subir al Repositorio

## 🎯 Objetivo

Hacer el build localmente y subirlo al repositorio, para que en el servidor (cPanel) solo necesites hacer `git pull` y tener los archivos compilados listos.

---

## ⚡ Método Rápido (Script Automático)

### Windows:

```bash
# Dar permisos de ejecución (solo primera vez)
# Luego ejecutar:
build-and-push.bat

# O con mensaje personalizado:
build-and-push.bat "build: Actualizar producción v1.2.3"
```

### Linux/Mac:

```bash
# Dar permisos de ejecución (solo primera vez)
chmod +x build-and-push.sh

# Ejecutar:
./build-and-push.sh

# O con mensaje personalizado:
./build-and-push.sh "build: Actualizar producción v1.2.3"
```

---

## 📋 Método Manual (Paso a Paso)

### Paso 1: Hacer Build Localmente

```bash
# En tu computadora, en el directorio del proyecto
cd gestor-cobros

# Instalar dependencias (solo primera vez o si cambian)
npm install

# Hacer build
npm run build
```

Esto generará el directorio `dist/` con los archivos compilados.

### Paso 2: Agregar dist/ al Repositorio

Normalmente `dist/` está en `.gitignore`, pero vamos a forzarlo:

```bash
# Agregar dist/ forzadamente (aunque esté en .gitignore)
git add -f dist/

# Verificar que se agregó
git status
```

### Paso 3: Commit y Push

```bash
# Agregar otros archivos si hay cambios
git add .

# Crear commit
git commit -m "build: Actualizar build de producción"

# Subir al repositorio
git push origin main
```

---

## 🚀 En el Servidor (cPanel)

Una vez que subiste el build al repositorio:

### Opción 1: Desde Terminal de cPanel

```bash
# Ir al directorio del proyecto
cd ~/public_html
# O donde tengas el proyecto:
# cd ~/clients.dowgroupcol.com/current

# Hacer pull
git pull origin main

# Verificar que dist/ existe
ls -la dist/
```

### Opción 2: Desde SSH

```bash
ssh usuario@tu-servidor
cd ~/public_html
git pull origin main
```

---

## 📁 Estructura en el Servidor

Después de hacer `git pull`, en el servidor deberías tener:

```
public_html/
├── dist/              ← Build compilado (del repo)
│   ├── index.html
│   └── assets/
├── send-email.php
├── upload.php
├── send-zoho.php
├── .htaccess
└── uploads/           ← Crear con permisos 775
```

---

## ⚙️ Configuración Inicial

### Primera Vez: Configurar .gitignore

El archivo `.gitignore` tiene `dist/` ignorado. Para subirlo al repo, usamos `git add -f dist/` que fuerza la inclusión.

**Nota:** Esto es intencional - normalmente `dist/` no se sube, pero en este caso lo necesitamos para cPanel.

### Si Quieres que dist/ Siempre se Suba

Puedes modificar `.gitignore` para NO ignorar `dist/`:

```bash
# Editar .gitignore
# Comentar o eliminar la línea:
# dist/
```

Pero **no es recomendado** porque:
- `dist/` es código generado
- Ocupa mucho espacio en el repo
- Puede causar conflictos de merge

**Mejor:** Usar `git add -f dist/` solo cuando necesites subirlo.

---

## 🔄 Flujo de Trabajo Recomendado

### Cuando Haces Cambios en el Código:

1. **Desarrollo local:**
   ```bash
   npm run dev  # Probar cambios
   ```

2. **Commit del código:**
   ```bash
   git add src/
   git commit -m "feat: Nueva funcionalidad"
   git push origin main
   ```

3. **Build y subir dist/:**
   ```bash
   npm run build
   git add -f dist/
   git commit -m "build: Actualizar build"
   git push origin main
   ```

4. **En el servidor:**
   ```bash
   git pull origin main
   # ¡Listo! Los cambios están aplicados
   ```

---

## 🐛 Solución de Problemas

### Error: "dist/ no se agregó al commit"

**Causa:** `dist/` está en `.gitignore` y no usaste `-f`.

**Solución:**
```bash
git add -f dist/
```

### Error: "git push rejected"

**Causa:** El repositorio remoto tiene cambios que no tienes localmente.

**Solución:**
```bash
git pull origin main
# Resolver conflictos si los hay
git push origin main
```

### El build no se actualiza en el servidor

**Verificaciones:**
1. ¿Hiciste `git push` después del build?
2. ¿Hiciste `git pull` en el servidor?
3. ¿El commit incluye `dist/`?
   ```bash
   git log --name-only -1
   # Debe mostrar archivos en dist/
   ```

---

## 📝 Scripts Disponibles

### `build-and-push.sh` (Linux/Mac)
- Hace build automáticamente
- Agrega `dist/` al repo
- Hace commit y push

### `build-and-push.bat` (Windows)
- Mismo proceso para Windows

### Uso:
```bash
# Linux/Mac
chmod +x build-and-push.sh
./build-and-push.sh "Mensaje del commit"

# Windows
build-and-push.bat "Mensaje del commit"
```

---

## ✅ Checklist

- [ ] Build local completado (`npm run build`)
- [ ] `dist/` existe y tiene archivos
- [ ] `dist/` agregado al repo (`git add -f dist/`)
- [ ] Commit creado
- [ ] Push al repositorio exitoso
- [ ] En servidor: `git pull origin main` ejecutado
- [ ] Verificar que `dist/` existe en el servidor
- [ ] Aplicación funcionando en producción

---

## 💡 Ventajas de Este Método

✅ **No necesitas Node.js en cPanel**  
✅ **Build más rápido** (en tu máquina local)  
✅ **Control total** del proceso de build  
✅ **Historial** de builds en el repositorio  
✅ **Fácil rollback** (git checkout commit-anterior)  

---

## 🎯 Resumen Rápido

```bash
# 1. Localmente: Build y push
npm run build
git add -f dist/
git commit -m "build: Actualizar producción"
git push origin main

# 2. En servidor: Pull
git pull origin main
```

**¡Listo!** 🎉

