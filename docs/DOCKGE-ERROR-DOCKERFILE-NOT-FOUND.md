# 🔧 Solución: Error "Dockerfile: no such file or directory"

## ❌ Problema

Error al iniciar el stack:
```
failed to solve: failed to read dockerfile: open Dockerfile: no such file or directory
```

**Causa:** El contexto del build no encuentra el Dockerfile en la ubicación esperada.

---

## ✅ Solución Rápida

### Opción 1: Verificar y Configurar Git Repository (Recomendado)

El problema es que Dockge no tiene el código fuente. Necesitas configurar el repositorio Git:

1. **En Dockge, click en "Editar"** (botón con lápiz ✏️)
2. **Busca la sección "Source" o "Origen"** o "Git Repository"
3. **Configura:**
   - **Source Type:** `Git Repository` o `Repositorio Git`
   - **Git Repository URL:** `https://github.com/DanyTrax/gestor.git`
   - **Branch:** `main`
   - **Stack File Path:** `docker-compose.yml`
4. **En el compose.yaml, asegúrate de que el `context` sea `.` (punto):**
   ```yaml
   build:
     context: .
     dockerfile: Dockerfile
   ```
5. **Click en "Guardar"**
6. **Click en "► Iniciar"** o **"Desplegar"**

---

### Opción 2: Clonar Repositorio Manualmente (SSH)

Si no encuentras la opción de Git Repository en Dockge:

1. **Conéctate por SSH:**
   ```bash
   ssh usuario@tu-servidor
   ```

2. **Ir al directorio donde Dockge guarda los stacks:**
   ```bash
   cd /data/stacks
   # O verifica en Dockge → stack → detalles → "stack-dir"
   ```

3. **Eliminar el directorio actual (si existe):**
   ```bash
   rm -rf gestor-cobros
   ```

4. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/DanyTrax/gestor.git gestor-cobros
   cd gestor-cobros
   ```

5. **Verificar que el Dockerfile existe:**
   ```bash
   ls -la Dockerfile
   # Debe mostrar el archivo Dockerfile
   ```

6. **En Dockge, editar el stack:**
   - Cambiar el `context` en `compose.yaml` a la ruta absoluta:
   ```yaml
   build:
     context: /data/stacks/gestor-cobros  # Ruta absoluta
     dockerfile: Dockerfile
   ```

7. **Guardar y desplegar**

---

### Opción 3: Verificar Ruta del Context

Si ya tienes el repositorio clonado:

1. **En Dockge, click en "Editar"**
2. **En el compose.yaml, verifica la línea del `context`:**
   ```yaml
   build:
     context: .  # Debe ser punto (directorio actual)
     dockerfile: Dockerfile
   ```

3. **Si el context es una ruta relativa y no funciona, cámbiala a absoluta:**
   ```yaml
   build:
     context: /data/stacks/gestor-cobros  # Ruta completa
     dockerfile: Dockerfile
   ```

4. **Guardar y desplegar**

---

## 🔍 Verificación Paso a Paso

### 1. Verificar que el Repositorio Esté Clonado

Desde SSH:
```bash
cd /data/stacks/gestor-cobros
ls -la
```

Debes ver:
- `Dockerfile` ✅
- `docker-compose.yml` ✅
- `package.json` ✅
- `src/` ✅
- etc.

### 2. Verificar Ubicación del Stack

En Dockge:
- Click en el stack "gestor-cobros"
- Busca en los detalles la ruta "stack-dir"
- Debe ser algo como: `/data/stacks/gestor-cobros`

### 3. Verificar Context en compose.yaml

El `context` debe apuntar al directorio donde está el Dockerfile:
- Si usas Git Repository: `context: .` (punto)
- Si usas Local Directory: `context: /data/stacks/gestor-cobros` (ruta absoluta)

---

## 🚀 Solución Completa (Todo en Uno)

Si quieres empezar desde cero:

### Desde SSH:

```bash
# 1. Conectar
ssh usuario@tu-servidor

# 2. Ir al directorio de stacks
cd /data/stacks

# 3. Eliminar stack actual (si existe)
rm -rf gestor-cobros

# 4. Clonar repositorio
git clone https://github.com/DanyTrax/gestor.git gestor-cobros
cd gestor-cobros

# 5. Verificar Dockerfile
ls -la Dockerfile

# 6. Verificar estructura
ls -la
```

### En Dockge:

1. **Eliminar el stack actual:**
   - Click en "✔ Eliminar" (botón rojo)
   - Confirmar

2. **Crear nuevo stack:**
   - Click en "+ Componer"
   - **Nombre:** `gestor-cobros`
   - **Source Type:** `Git Repository` (si está disponible)
     - URL: `https://github.com/DanyTrax/gestor.git`
     - Branch: `main`
   - **O si no hay Git Repository:**
     - Usa `context: /data/stacks/gestor-cobros` (ruta absoluta)

3. **Pegar compose.yaml:**
   ```yaml
   version: '3.8'
   
   services:
     gestor-cobros:
       build:
         context: .  # O /data/stacks/gestor-cobros si no usas Git
         dockerfile: Dockerfile
       container_name: gestor-cobros
       restart: unless-stopped
       ports:
         - "8080:80"
       volumes:
         - ./uploads:/var/www/html/uploads
         - ./vendor:/var/www/html/vendor
       environment:
         - APACHE_DOCUMENT_ROOT=/var/www/html
       labels:
         - "com.uw-labs.dockge.stack-name=gestor-cobros"
         - "com.uw-labs.dockge.stack-dir=/data/stacks/gestor-cobros"
       networks:
         - gestor-network
   
   networks:
     gestor-network:
       driver: bridge
   ```

4. **Guardar y Desplegar**

---

## ⚠️ Nota sobre el Warning de "version"

El warning sobre `version: "3.8"` es solo informativo. Puedes eliminarlo si quieres:

```yaml
# Elimina esta línea:
# version: '3.8'

services:
  gestor-cobros:
    # ... resto del archivo
```

Pero no es necesario, solo es un aviso.

---

## ✅ Checklist de Verificación

- [ ] Repositorio clonado en `/data/stacks/gestor-cobros`
- [ ] Dockerfile existe en el directorio
- [ ] `context` en compose.yaml apunta al directorio correcto
- [ ] Si usas Git Repository, está configurado correctamente
- [ ] Si usas Local Directory, la ruta es absoluta
- [ ] Guardado y desplegado nuevamente

---

## 🎯 Resumen

**El problema:** Dockge no encuentra el Dockerfile porque el `context` no apunta al lugar correcto o el repositorio no está clonado.

**La solución:**
1. Asegúrate de que el repositorio esté clonado
2. Configura Git Repository en Dockge (recomendado)
3. O usa `context: /data/stacks/gestor-cobros` (ruta absoluta)
4. Guarda y despliega

---

**¿Sigue sin funcionar?** Verifica los logs en la sección "Terminal" de Dockge para ver el error exacto.

