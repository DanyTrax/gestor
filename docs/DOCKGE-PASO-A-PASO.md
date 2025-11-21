# 📖 Guía Paso a Paso: Desplegar en Dockge

## 🎯 Objetivo

Desplegar el proyecto **Gestor de Cobros** en Dockge con soporte para SMTP y Zoho Mail API.

---

## 📋 Paso 1: Preparar el Entorno

### 1.1 Verificar Requisitos

- ✅ Dockge instalado y funcionando
- ✅ Docker y Docker Compose instalados
- ✅ Acceso SSH al servidor (opcional, para método manual)

### 1.2 Acceder a Dockge

1. Abre tu navegador
2. Ve a la URL de Dockge (ej: `http://tu-servidor:5001`)
3. Inicia sesión si es necesario

---

## 📦 Paso 2: Crear el Stack

### 2.1 Iniciar Creación

1. En Dockge, busca el botón **"+ Componer"** o **"Add Stack"**
2. Click para crear un nuevo stack

### 2.2 Configurar el Stack

Completa el formulario con estos valores:

| Campo | Valor |
|-------|-------|
| **Nombre de la Pila** | `gestor-cobros` |
| **Source Type** | `Git Repository` (recomendado) |
| **Git Repository URL** | `https://github.com/DanyTrax/gestor.git` |
| **Branch** | `main` |
| **Stack File Path** | `docker-compose.yml` |

**Nota:** Si no tienes acceso a Git o prefieres subir archivos manualmente, selecciona **"Local Directory"** y sigue el método alternativo.

---

## ⚙️ Paso 3: Configurar docker-compose.yml

### 3.1 Contenido del Archivo

En el editor de `docker-compose.yml` que aparece en Dockge, pega este contenido:

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
      - "8080:80"  # ⚠️ Cambia 8080 si está ocupado
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

### 3.2 Explicación de Configuración

- **`ports: "8080:80"`**: Mapea el puerto 8080 del host al puerto 80 del contenedor
- **`volumes`**: Monta directorios para persistir datos
- **`restart: unless-stopped`**: Reinicia automáticamente si se detiene
- **`context: .`**: Usa el directorio actual como contexto de build

### 3.3 Ajustar Puerto (Si es Necesario)

Si el puerto 8080 está ocupado, cámbialo:

```yaml
ports:
  - "8081:80"  # Usa 8081 en lugar de 8080
```

---

## 🚀 Paso 4: Desplegar

### 4.1 Guardar Configuración

1. Click en **"Guardar"** o **"Save"**
2. Verifica que no haya errores de sintaxis

### 4.2 Iniciar Despliegue

1. Click en **"Desplegar"** o **"Deploy"**
2. Observa el progreso en los logs

### 4.3 Proceso de Build

Dockge realizará:

1. **Clonar repositorio** (si usas Git Repository)
2. **Construir imagen Docker:**
   - Instalar Node.js y construir React
   - Instalar PHP y Apache
   - Instalar PHPMailer
   - Configurar Apache para SPA
3. **Crear contenedor**
4. **Iniciar servicios**

**Tiempo estimado:** 5-10 minutos (depende del servidor)

---

## ✅ Paso 5: Verificar Despliegue

### 5.1 Verificar Estado en Dockge

1. Ve a la lista de **"Stacks"** o **"Pilas"**
2. Busca `gestor-cobros`
3. Verifica que el estado sea **"Running"** o **"En ejecución"**

### 5.2 Verificar Logs

1. Click en el stack `gestor-cobros`
2. Ve a la pestaña **"Logs"**
3. Verifica que no haya errores críticos

### 5.3 Acceder a la Aplicación

1. Abre tu navegador
2. Ve a: `http://tu-servidor:8080`
3. Deberías ver la aplicación cargando

**Si no carga:**
- Verifica que el puerto sea correcto
- Revisa los logs en Dockge
- Verifica el firewall del servidor

---

## 🔧 Paso 6: Configuración Inicial

### 6.1 Configurar Firebase

1. Accede a la aplicación: `http://tu-servidor:8080`
2. Si es la primera vez, verás la pantalla de configuración
3. Completa los datos de Firebase:
   - API Key
   - Auth Domain
   - Project ID
   - etc.

### 6.2 Crear Usuario Superadmin

1. Después de configurar Firebase, crea el primer usuario
2. Este será el usuario **Superadmin**
3. Guarda las credenciales de forma segura

### 6.3 Configurar Email

#### Opción A: SMTP (Tradicional)

1. Inicia sesión como Superadmin
2. Ve a **Mensajes** → **Configuración de Email**
3. Selecciona **"SMTP"** como proveedor
4. Completa:
   - Servidor SMTP
   - Puerto (587 o 465)
   - Usuario y contraseña
   - Email remitente
5. Marca **"Habilitar servicio de email"**
6. Click **"Guardar"**
7. Envía un email de prueba

#### Opción B: Zoho Mail API (Nuevo)

1. **Generar Refresh Token:**
   - Sube `generate-zoho-token.php` al servidor
   - Accede desde el navegador
   - Sigue las instrucciones en pantalla
   - Copia el Refresh Token generado

2. **Configurar en el Sistema:**
   - Ve a **Mensajes** → **Configuración de Email**
   - Selecciona **"Zoho Mail API"** como proveedor
   - Completa:
     - Client ID
     - Client Secret
     - Refresh Token
     - Email remitente
   - Marca **"Habilitar servicio de email"**
   - Click **"Guardar"**
   - Envía un email de prueba

**Guía completa:** Ver `docs/GUIA-CONFIGURACION-ZOHO.md`

---

## 🔄 Paso 7: Actualizar el Stack (Futuro)

### Método 1: Desde Dockge (Automático)

Si usaste **Git Repository**:

1. Ve al stack `gestor-cobros`
2. Click en **"Actualizar"** (icono ⬇️)
3. Dockge hará `git pull` y reconstruirá automáticamente

### Método 2: Desde SSH (Manual)

```bash
# Conectar al servidor
ssh usuario@tu-servidor

# Ir al directorio del stack
cd /data/stacks/gestor-cobros

# Hacer pull de cambios
git pull origin main

# Reconstruir y actualizar
docker-compose build --no-cache
docker-compose up -d
```

---

## 🐛 Solución de Problemas

### Problema: "Dockerfile: no such file or directory"

**Causa:** El contexto de build no es correcto.

**Solución:**
- Si usas Git Repository, el `context` debe ser `.` (punto)
- Si usas Local Directory, usa la ruta absoluta

### Problema: "Port already in use"

**Causa:** El puerto 8080 está ocupado.

**Solución:**
1. Cambia el puerto en `docker-compose.yml`
2. Guarda y redespliega

### Problema: "PHPMailer class not found"

**Causa:** PHPMailer no se instaló correctamente.

**Solución:**
El Dockerfile instala PHPMailer automáticamente. Si falla:
1. Revisa los logs de build
2. Verifica que `composer.json` esté en el repositorio
3. Reconstruye la imagen sin caché

### Problema: La aplicación no carga

**Verificaciones:**
1. ¿El contenedor está corriendo?
   ```bash
   docker ps | grep gestor-cobros
   ```
2. ¿Hay errores en los logs?
   - Revisa en Dockge → Logs
3. ¿El puerto es correcto?
   - Verifica en `docker-compose.yml`

### Problema: "Permission denied" en uploads

**Solución:**
```bash
# Desde el servidor
cd /data/stacks/gestor-cobros
chmod -R 775 uploads
```

---

## 📊 Estructura Final

Después del despliegue, la estructura será:

```
/data/stacks/gestor-cobros/
├── dist/                 ← Build de React (generado)
├── uploads/              ← Archivos subidos
│   ├── payments/
│   └── tickets/
├── vendor/               ← PHPMailer (generado)
├── docker-compose.yml    ← Configuración
└── ... (otros archivos del repo)
```

---

## ✅ Checklist Final

- [ ] Stack creado en Dockge
- [ ] `docker-compose.yml` configurado
- [ ] Stack desplegado exitosamente
- [ ] Contenedor corriendo
- [ ] Aplicación accesible en navegador
- [ ] Firebase configurado
- [ ] Usuario Superadmin creado
- [ ] Email configurado (SMTP o Zoho)
- [ ] Email de prueba enviado exitosamente

---

## 🎉 ¡Listo!

Tu aplicación está desplegada y funcionando. 

**Acceso:** `http://tu-servidor:8080`

**Próximos pasos:**
- Configurar usuarios adicionales
- Configurar servicios y clientes
- Personalizar según tus necesidades

---

## 📚 Documentación Adicional

- `docs/GUIA-DOCKGE-COMPLETA.md` - Guía completa y detallada
- `DOCKGE-RESUMEN-RAPIDO.md` - Resumen rápido
- `docs/GUIA-CONFIGURACION-ZOHO.md` - Configurar Zoho Mail API
- `INTEGRACION-ZOHO-COMPLETA.md` - Detalles de integración

---

**¿Necesitas ayuda?** Revisa los logs en Dockge o consulta la documentación específica.

