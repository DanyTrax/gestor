# Instalación en Dockge - Solución Completa

## ⚠️ El problema: `Dockerfile: no such file or directory`

Este error ocurre porque Docker necesita acceso a todos los archivos del proyecto para construir la imagen.

## ✅ SOLUCIÓN: Clonar el repositorio primero

### Paso 1: Conectar al servidor

Conéctate por SSH al servidor donde corre Dockge:

```bash
ssh usuario@tu-servidor
```

### Paso 2: Clonar el repositorio

```bash
cd /data/stacks  # O donde Dockge guarda los stacks
git clone https://github.com/DanyTrax/gestor.git gestor-cobros
cd gestor-cobros
```

### Paso 3: Crear directorio de uploads

```bash
mkdir -p uploads/payments
chmod -R 775 uploads
```

### Paso 4: En Dockge

1. Ve a **"Componer"** → **"+ Componer"**
2. **Nombre de la Pila**: `gestor-cobros`
3. En el **área de texto grande** (lado derecho), pega este contenido:

```yaml
version: '3.8'

services:
  gestor-cobros:
    build:
      context: /data/stacks/gestor-cobros
      dockerfile: Dockerfile
    container_name: gestor-cobros
    restart: unless-stopped
    ports:
      - "8080:80"
    volumes:
      - /data/stacks/gestor-cobros/uploads:/var/www/html/uploads
    environment:
      - APACHE_DOCUMENT_ROOT=/var/www/html
    networks:
      - gestor-network

networks:
  gestor-network:
    driver: bridge
```

**Importante**: Ajusta la ruta `/data/stacks/gestor-cobros` a la ruta real donde clonaste el repositorio.

### Paso 5: Desplegar

1. Click en **"Guardar"**
2. Click en **"Desplegar"**

---

## 🔄 Alternativa: Usar Git Repository en Dockge (si está disponible)

Si tu versión de Dockge tiene soporte para Git Repository:

1. **"+ Componer"** → Selecciona **"Git Repository"** o busca un botón similar
2. **Git Repository URL**: `https://github.com/DanyTrax/gestor.git`
3. **Branch**: `main`
4. **Stack File Path**: `docker-compose.yml`
5. **Working Directory**: (Dockge lo maneja automáticamente)

---

## 🐛 Si sigue sin funcionar

### Verificar que el Dockerfile existe:

```bash
cd /data/stacks/gestor-cobros
ls -la Dockerfile
```

### Verificar permisos:

```bash
chmod -R 755 /data/stacks/gestor-cobros
```

### Ver logs del build:

En Dockge, después de intentar desplegar, revisa los logs del contenedor para ver el error completo.

---

## 📝 Nota sobre rutas

Dockge normalmente guarda los stacks en:
- `/data/stacks/[nombre-stack]/` 
- O en la ruta que configuraste en Dockge

Verifica la ruta correcta antes de configurar el `context:` en docker-compose.yml.

