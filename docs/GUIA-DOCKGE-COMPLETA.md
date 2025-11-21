# 🐳 Guía Completa: Desplegar en Dockge

## 📋 Requisitos Previos

1. **Dockge** instalado y funcionando
2. **Docker** y **Docker Compose** instalados
3. **Git** instalado en el servidor (recomendado)
4. Acceso SSH al servidor

---

## 🚀 Método 1: Desde Repositorio Git (Recomendado)

Este método permite actualizaciones automáticas desde Git.

### Paso 1: Crear Stack en Dockge

1. Abre Dockge en tu navegador
2. Ve a **"Compose"** → **"+ Componer"** o **"Add Stack"**
3. Completa el formulario:

   - **Nombre de la Pila/Stack Name:** `gestor-cobros`
   - **Source Type:** Selecciona **"Git Repository"** o **"Repositorio Git"**
   - **Git Repository URL:** `https://github.com/DanyTrax/gestor.git`
   - **Branch:** `main` (o la rama que uses)
   - **Stack File Path:** `docker-compose.yml`
   - **Working Directory:** (Dockge lo maneja automáticamente)

### Paso 2: Configurar docker-compose.yml

En el área de edición del `docker-compose.yml`, pega este contenido:

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
      - "8080:80"  # Cambia 8080 por el puerto que prefieras
    volumes:
      # Persistir uploads fuera del contenedor
      - ./uploads:/var/www/html/uploads
      # Persistir vendor de PHP (PHPMailer)
      - ./vendor:/var/www/html/vendor
    environment:
      - APACHE_DOCUMENT_ROOT=/var/www/html
    labels:
      # Labels para Dockge
      - "com.uw-labs.dockge.stack-name=gestor-cobros"
      - "com.uw-labs.dockge.stack-dir=/data/stacks/gestor-cobros"
    networks:
      - gestor-network

networks:
  gestor-network:
    driver: bridge
```

**Nota:** Ajusta el puerto `8080` si ya está en uso.

### Paso 3: Desplegar

1. Click en **"Guardar"** o **"Save"**
2. Click en **"Desplegar"** o **"Deploy"**
3. Espera a que Dockge:
   - Clone el repositorio
   - Construya la imagen Docker
   - Levante el contenedor

### Paso 4: Verificar

1. Ve a **"Stacks"** o **"Pilas"** en Dockge
2. Verifica que `gestor-cobros` esté en estado **"Running"** o **"En ejecución"**
3. Accede a la aplicación en: `http://tu-servidor:8080`

---

## 📁 Método 2: Desde Archivos Locales

Si prefieres clonar el repositorio manualmente:

### Paso 1: Conectar al Servidor por SSH

```bash
ssh usuario@tu-servidor
```

### Paso 2: Clonar el Repositorio

```bash
# Ir al directorio donde Dockge guarda los stacks
cd /data/stacks  # O la ruta que uses para Dockge

# Clonar el repositorio
git clone https://github.com/DanyTrax/gestor.git gestor-cobros

# Ir al directorio
cd gestor-cobros
```

### Paso 3: Crear Directorios Necesarios

```bash
# Crear directorio de uploads
mkdir -p uploads/payments uploads/tickets
chmod -R 775 uploads

# Crear directorio para vendor de PHP (si no existe)
mkdir -p vendor
```

### Paso 4: Instalar PHPMailer (Requerido para emails)

```bash
# Verificar si composer está instalado
composer --version

# Si no está instalado, instálalo:
# curl -sS https://getcomposer.org/installer | php
# mv composer.phar /usr/local/bin/composer

# Instalar PHPMailer
composer require phpmailer/phpmailer
```

**Nota:** Si no tienes Composer, puedes descargar PHPMailer manualmente o usar el contenedor para instalarlo.

### Paso 5: Crear Stack en Dockge

1. En Dockge, ve a **"Compose"** → **"+ Componer"**
2. Completa:
   - **Nombre:** `gestor-cobros`
   - **Source Type:** **"Local Directory"** o **"Directorio Local"**
   - **Stack File Path:** `/data/stacks/gestor-cobros/docker-compose.yml`
   - **Working Directory:** `/data/stacks/gestor-cobros`

3. En el editor de `docker-compose.yml`, pega:

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
      - /data/stacks/gestor-cobros/vendor:/var/www/html/vendor
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

**Importante:** Ajusta las rutas `/data/stacks/gestor-cobros` a la ruta real donde clonaste el repositorio.

### Paso 6: Desplegar

1. Click en **"Guardar"**
2. Click en **"Desplegar"**

---

## 🔧 Configuración Post-Despliegue

### 1. Verificar que PHP Funciona

1. Accede a: `http://tu-servidor:8080/send-email.php`
2. Deberías ver un error JSON (normal, significa que PHP funciona)
3. Si ves código PHP sin procesar, verifica la configuración de Apache

### 2. Verificar PHPMailer

Desde el servidor (SSH):

```bash
# Entrar al contenedor
docker exec -it gestor-cobros bash

# Verificar que PHPMailer esté instalado
ls -la /var/www/html/vendor/phpmailer/phpmailer/

# Salir del contenedor
exit
```

### 3. Configurar Firebase

1. Accede a la aplicación: `http://tu-servidor:8080`
2. Completa la configuración inicial de Firebase
3. Configura los usuarios y permisos

### 4. Configurar Email (SMTP o Zoho Mail API)

1. Inicia sesión como **Superadmin**
2. Ve a **Mensajes** → **Configuración de Email**
3. Selecciona el proveedor:
   - **SMTP:** Configura servidor SMTP tradicional
   - **Zoho Mail API:** Configura OAuth 2.0 de Zoho

**Para Zoho Mail API:**
- Usa `generate-zoho-token.php` para generar el Refresh Token
- Sigue la guía en `docs/GUIA-CONFIGURACION-ZOHO.md`

---

## 🔄 Actualizar el Stack

### Opción A: Desde Dockge (Si usas Git Repository)

1. Ve al stack `gestor-cobros` en Dockge
2. Click en **"Actualizar"** o **"Update"** (icono ⬇️)
3. Dockge hará `git pull` y reconstruirá automáticamente

### Opción B: Manual desde SSH

```bash
# Conectar al servidor
ssh usuario@tu-servidor

# Ir al directorio del stack
cd /data/stacks/gestor-cobros

# Hacer pull de los cambios
git pull origin main

# Reconstruir y actualizar
docker-compose build --no-cache
docker-compose up -d
```

---

## 🐛 Solución de Problemas

### Error: "Dockerfile: no such file or directory"

**Causa:** El contexto de build no apunta al directorio correcto.

**Solución:**
1. Verifica que el `context` en `docker-compose.yml` apunte al directorio correcto
2. Si usas Git Repository, el contexto debe ser `.` (directorio actual)
3. Si usas Local Directory, usa la ruta absoluta: `/data/stacks/gestor-cobros`

### Error: "PHPMailer class not found"

**Causa:** PHPMailer no está instalado.

**Solución:**
```bash
# Desde el servidor
cd /data/stacks/gestor-cobros
composer require phpmailer/phpmailer

# O instalar dentro del contenedor
docker exec -it gestor-cobros composer require phpmailer/phpmailer
```

### Error: "Permission denied" en uploads

**Causa:** Permisos incorrectos en el directorio de uploads.

**Solución:**
```bash
# Desde el servidor
cd /data/stacks/gestor-cobros
chmod -R 775 uploads
chown -R www-data:www-data uploads  # Si es necesario
```

### Error: Puerto ya en uso

**Causa:** El puerto 8080 (o el que configuraste) está ocupado.

**Solución:**
1. Cambia el puerto en `docker-compose.yml`:
   ```yaml
   ports:
     - "8081:80"  # Usa otro puerto
   ```
2. Guarda y redespliega

### La aplicación no carga

**Verificaciones:**
1. ¿El contenedor está corriendo?
   ```bash
   docker ps | grep gestor-cobros
   ```
2. ¿Hay errores en los logs?
   ```bash
   docker logs gestor-cobros
   ```
3. ¿El build se completó correctamente?
   - Revisa los logs de build en Dockge

---

## 📊 Estructura de Volúmenes

```
/data/stacks/gestor-cobros/
├── uploads/          ← Archivos subidos (payments, tickets)
│   ├── payments/
│   └── tickets/
├── vendor/           ← PHPMailer y otras dependencias PHP
├── dist/             ← Build de React (generado en build)
└── docker-compose.yml
```

**Importante:** Los directorios `uploads/` y `vendor/` se montan como volúmenes para persistir datos fuera del contenedor.

---

## 🔐 Seguridad

### Recomendaciones:

1. **Firewall:** Configura el firewall para permitir solo el puerto necesario
2. **HTTPS:** Usa un proxy reverso (Nginx/Traefik) con SSL para HTTPS
3. **Credenciales:** No subas credenciales al repositorio
4. **Permisos:** Limita permisos en directorios sensibles

### Variables de Entorno Sensibles:

Si necesitas variables de entorno sensibles, agrégalas en `docker-compose.yml`:

```yaml
environment:
  - APACHE_DOCUMENT_ROOT=/var/www/html
  - FIREBASE_API_KEY=tu-api-key
  # NO subas esto al repositorio público
```

O usa un archivo `.env` (no incluido en Git):

```yaml
env_file:
  - .env
```

---

## 📝 Checklist de Despliegue

- [ ] Dockge instalado y funcionando
- [ ] Repositorio clonado o configurado en Dockge
- [ ] `docker-compose.yml` configurado correctamente
- [ ] Directorio `uploads/` creado con permisos correctos
- [ ] PHPMailer instalado (si usas SMTP)
- [ ] Stack desplegado en Dockge
- [ ] Contenedor corriendo sin errores
- [ ] Aplicación accesible en el navegador
- [ ] Firebase configurado
- [ ] Email configurado (SMTP o Zoho)
- [ ] Prueba de envío de email exitosa

---

## 🎯 Acceso a la Aplicación

Una vez desplegado, accede a:

- **URL:** `http://tu-servidor:8080`
- **Puerto:** Ajusta según tu configuración

### Configuración Inicial:

1. Primera vez: Configura Firebase
2. Crea usuario Superadmin
3. Configura email (SMTP o Zoho Mail API)
4. Prueba el sistema

---

## 📚 Documentación Relacionada

- `docs/DOCKGE-INSTALACION.md` - Instalación básica
- `docs/DOCKGE-UPDATE.md` - Cómo actualizar
- `docs/GUIA-CONFIGURACION-ZOHO.md` - Configurar Zoho Mail API
- `INTEGRACION-ZOHO-COMPLETA.md` - Detalles de integración Zoho

---

## ✅ Estado del Despliegue

Si todo está correcto, deberías ver:

1. **En Dockge:**
   - Stack `gestor-cobros` en estado "Running"
   - Sin errores en los logs

2. **En el Navegador:**
   - Aplicación cargando correctamente
   - Sin errores en la consola del navegador

3. **En el Servidor:**
   ```bash
   docker ps | grep gestor-cobros
   # Debería mostrar el contenedor corriendo
   ```

---

**¿Necesitas ayuda?** Revisa los logs en Dockge o consulta la documentación específica del problema.

