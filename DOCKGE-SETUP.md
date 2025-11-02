# Configuración para Dockge - Gestor de Cobros

## Prerrequisitos

1. **Dockge** instalado y corriendo
2. **Docker** y **Docker Compose** instalados
3. **Git** para clonar el repositorio (opcional)

## Pasos para Desplegar en Dockge

### Opción 1: Desde Repositorio Git (Recomendado)

1. **En Dockge, crear un nuevo stack:**
   - Click en "Compose" → "Add Stack"
   - Nombre: `gestor-cobros`
   - Stack File Type: `docker-compose.yml`
   - Source Type: `Git Repository`
   - Git Repository URL: `https://github.com/DanyTrax/gestor.git`
   - Branch: `main`
   - Stack File Path: `docker-compose.yml`

2. **Configurar variables (opcional):**
   - En el archivo `docker-compose.yml`, puedes cambiar el puerto:
     ```yaml
     ports:
       - "8080:80"  # Cambia 8080 por el puerto que prefieras
     ```

3. **Deploy:**
   - Click en "Deploy"
   - Dockge construirá la imagen y levantará el contenedor

### Opción 2: Desde Archivos Locales

1. **Subir archivos al servidor:**
   ```bash
   git clone https://github.com/DanyTrax/gestor.git
   cd gestor
   ```

2. **Crear directorio para uploads:**
   ```bash
   mkdir -p uploads/payments
   chmod 775 uploads/payments
   ```

3. **En Dockge:**
   - Click en "Compose" → "Add Stack"
   - Nombre: `gestor-cobros`
   - Stack File Type: `docker-compose.yml`
   - Source Type: `Local Directory`
   - Stack File Path: `/ruta/completa/a/gestor/docker-compose.yml`
   - Working Directory: `/ruta/completa/a/gestor`

4. **Deploy:**
   - Click en "Deploy"

## Acceso a la Aplicación

Una vez desplegado, accede a:
- `http://tu-servidor:8080` (o el puerto que configuraste)

## Estructura de Volúmenes

Los archivos subidos se guardan en:
- `./uploads/payments/` (en el host)
- `/var/www/html/uploads/payments/` (en el contenedor)

**Importante:** Asegúrate de que el directorio `uploads` tenga permisos de escritura:
```bash
chmod -R 775 uploads/
```

## Variables de Entorno

Actualmente no requiere variables de entorno, ya que la configuración de Firebase está en el código. Si necesitas cambiar algo, puedes:

1. Editar `src/config/firebase.js` antes de construir
2. O crear un script de build que inyecte variables

## Actualizar la Aplicación

### Si usas Git Repository en Dockge:
1. Haz `git push` de tus cambios
2. En Dockge, click en "Redeploy" del stack
3. Opcionalmente, puedes configurar webhooks para auto-deploy

### Si usas Local Directory:
1. Hacer cambios en el código
2. En Dockge, click en "Redeploy"
3. O hacer `docker-compose build` manualmente

## Troubleshooting

### Los uploads no funcionan
- Verifica permisos: `chmod -R 775 uploads/`
- Verifica que el volumen esté montado correctamente
- Revisa logs: `docker logs gestor-cobros`

### La aplicación no carga
- Verifica que el puerto esté disponible
- Revisa logs del contenedor
- Verifica firewall/iptables

### Error de build
- Verifica que todas las dependencias estén en `package.json`
- Revisa logs del build en Dockge

## Características

- ✅ Multi-stage build (optimizado)
- ✅ PHP + Apache para servir SPA y PHP
- ✅ Routing SPA configurado
- ✅ Volúmenes persistentes para uploads
- ✅ Seguridad en directorio uploads (.htaccess)

## Personalización

### Cambiar puerto:
Edita `docker-compose.yml`:
```yaml
ports:
  - "3000:80"  # Cambia 3000 por tu puerto
```

### Cambiar dominio/base:
Edita `vite.config.js` antes de construir:
```js
export default defineConfig({
  base: '/tu-subdirectorio/',  # Si está en subdirectorio
  plugins: [react()],
})
```

