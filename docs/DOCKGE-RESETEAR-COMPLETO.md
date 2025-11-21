# 🔄 Resetear Stack Completo en Dockge

## 🎯 Objetivo

Eliminar completamente el stack actual y recrearlo desde cero para solucionar errores de regresión.

---

## ⚠️ Paso 1: Detener y Eliminar el Stack Actual

### 1.1 En Dockge (Interfaz Web)

1. En el **sidebar izquierdo**, click en el stack **"gestor"** (el que está activo)
2. En el **panel central**, click en el botón **"Detener"** (Stop)
   - Espera a que el estado cambie a "inactivo"
3. Click en el botón **"Eliminar"** (Delete)
   - Confirma la eliminación si te lo pide

### 1.2 Verificar Eliminación

El stack "gestor" debería desaparecer de la lista del sidebar izquierdo.

---

## 🧹 Paso 2: Limpiar Imágenes y Volúmenes (Opcional pero Recomendado)

### 2.1 Desde SSH (Recomendado)

Conéctate al servidor por SSH:

```bash
ssh usuario@tu-servidor
```

### 2.2 Eliminar Imagen Docker

```bash
# Ver imágenes relacionadas con gestor
docker images | grep gestor

# Eliminar la imagen (ajusta el nombre si es diferente)
docker rmi gestor-cobros:latest
# O si tiene otro nombre:
docker rmi $(docker images | grep gestor | awk '{print $3}') -f
```

### 2.3 Eliminar Volúmenes (Si es Necesario)

```bash
# Ver volúmenes
docker volume ls | grep gestor

# Eliminar volúmenes (cuidado, esto borra datos)
docker volume rm $(docker volume ls | grep gestor | awk '{print $2}') 2>/dev/null || true
```

### 2.4 Limpiar Directorio del Stack (Si Existe)

```bash
# Ir al directorio donde Dockge guarda los stacks
cd /data/stacks

# Si existe el directorio gestor, eliminarlo
rm -rf gestor

# O si está en otra ubicación, busca:
find /data -name "gestor*" -type d 2>/dev/null
```

---

## 🆕 Paso 3: Crear Stack Nuevo desde Cero

### 3.1 En Dockge: Crear Nuevo Stack

1. En el **sidebar izquierdo**, click en el botón verde **"+ Componer"**
2. Se abrirá la interfaz de "Componer"

### 3.2 Configurar "General"

- **Nombre de la Pila:** `gestor-cobros` (o `gestor` si prefieres)
- **Agentes Dockge:** Deja el que está seleccionado

### 3.3 Configurar Docker Compose (Área de Texto Derecha)

En el **área de texto grande del lado derecho**, pega este contenido:

```yaml
version: '3.8'

services:
  gestor-cobros:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: gestor-cobros
    restart: unless-stopped
    ports:
      - "8082:80"  # Usa el puerto que prefieras (8082, 8080, etc.)
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

**⚠️ IMPORTANTE:** 
- Ajusta el puerto `8082` si prefieres otro
- Asegúrate de que la indentación sea correcta

### 3.4 Configurar Git Repository (Para Asegurar Commit Correcto)

Si Dockge tiene opción de **"Git Repository"** o **"Source"**:

1. Selecciona **"Git Repository"**
2. Completa:
   - **Git Repository URL:** `https://github.com/DanyTrax/gestor.git`
   - **Branch:** `main` (o la rama que uses)
   - **Stack File Path:** `docker-compose.yml`

**Si quieres un commit específico:**

Si necesitas volver a un commit anterior:

```bash
# Desde SSH, después de clonar:
cd /data/stacks/gestor-cobros
git log --oneline  # Ver commits
git checkout <commit-hash>  # Volver a commit específico
```

O si usas Git Repository en Dockge, puedes especificar un tag o commit en el campo "Branch".

---

## 🚀 Paso 4: Desplegar

1. **Click en "Guardar"** (botón gris con icono de disquete 💾)
2. **Click en "Desplegar"** (botón azul con icono de cohete 🚀)
3. **Espera** a que termine el build (5-10 minutos)

---

## ✅ Paso 5: Verificar

### 5.1 Verificar Estado

1. El stack debería aparecer en el sidebar izquierdo como **"activo"**
2. Click en el stack para ver detalles
3. Verifica que el contenedor esté **"running"**

### 5.2 Verificar Logs

En la sección **"Terminal"** del panel central, deberías ver:
- Logs de Apache
- Sin errores críticos
- Mensajes de acceso HTTP (200 OK)

### 5.3 Acceder a la Aplicación

- **URL:** `http://tu-servidor:8082` (o el puerto que configuraste)

---

## 🔄 Alternativa: Resetear desde SSH (Más Rápido)

Si prefieres hacerlo todo desde SSH:

```bash
# 1. Conectar al servidor
ssh usuario@tu-servidor

# 2. Ir al directorio del stack
cd /data/stacks/gestor-cobros

# 3. Detener y eliminar contenedor
docker-compose down -v

# 4. Eliminar imagen
docker rmi gestor-cobros:latest -f

# 5. Hacer pull del commit correcto
git fetch origin
git reset --hard origin/main  # O el commit que necesites
# O volver a un commit específico:
# git reset --hard <commit-hash>

# 6. Limpiar build anterior
rm -rf dist/ node_modules/

# 7. Reconstruir desde cero
docker-compose build --no-cache

# 8. Levantar el stack
docker-compose up -d

# 9. Ver logs
docker-compose logs -f
```

Luego en Dockge, solo necesitas hacer "Actualizar" o el stack se actualizará automáticamente.

---

## 🐛 Si Sigue con Errores

### Limpieza Completa

```bash
# Desde SSH
cd /data/stacks

# Eliminar todo relacionado con gestor
rm -rf gestor*

# Limpiar Docker completamente
docker system prune -a --volumes -f

# Luego crear el stack nuevamente desde Dockge
```

### Verificar Commit Correcto

```bash
cd /data/stacks/gestor-cobros
git log --oneline -10  # Ver últimos 10 commits
git status  # Ver estado actual
git branch  # Ver rama actual
```

---

## 📋 Checklist de Reseteo

- [ ] Stack "gestor" detenido en Dockge
- [ ] Stack "gestor" eliminado de Dockge
- [ ] Imagen Docker eliminada (opcional)
- [ ] Volúmenes limpiados (opcional)
- [ ] Directorio del stack limpiado (opcional)
- [ ] Nuevo stack creado en Dockge
- [ ] Git Repository configurado correctamente
- [ ] docker-compose.yml pegado correctamente
- [ ] Stack desplegado exitosamente
- [ ] Contenedor corriendo
- [ ] Aplicación accesible en navegador

---

## ⚡ Comando Rápido (Todo en Uno)

Si tienes acceso SSH y quieres hacerlo rápido:

```bash
ssh usuario@tu-servidor << 'EOF'
cd /data/stacks/gestor-cobros
docker-compose down -v
docker rmi gestor-cobros:latest -f 2>/dev/null || true
git fetch origin
git reset --hard origin/main
rm -rf dist/ node_modules/
docker-compose build --no-cache
docker-compose up -d
docker-compose logs -f
EOF
```

---

## 🎯 Resumen

1. **En Dockge:** Detener → Eliminar stack "gestor"
2. **Opcional (SSH):** Limpiar imágenes y volúmenes
3. **En Dockge:** Crear nuevo stack "+ Componer"
4. **Configurar:** Nombre, docker-compose.yml, Git Repository
5. **Desplegar:** Guardar → Desplegar
6. **Verificar:** Estado activo, logs sin errores, aplicación accesible

---

**¿Listo?** Sigue estos pasos y tendrás un stack limpio y funcionando. 🚀

