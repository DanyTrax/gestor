# 🚀 Desplegar en Dockge - Resumen Rápido

## ⚡ Método Rápido (5 minutos)

### 1. En Dockge: Crear Stack

- **Nombre:** `gestor-cobros`
- **Source Type:** `Git Repository`
- **Git URL:** `https://github.com/DanyTrax/gestor.git`
- **Branch:** `main`
- **Stack File:** `docker-compose.yml`

### 2. Configurar docker-compose.yml

Pega esto en el editor:

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

### 3. Desplegar

1. Click **"Guardar"**
2. Click **"Desplegar"**
3. Espera a que termine el build

### 4. Acceder

- **URL:** `http://tu-servidor:8080`

---

## 📋 Checklist Post-Despliegue

- [ ] Contenedor corriendo en Dockge
- [ ] Aplicación accesible en navegador
- [ ] Configurar Firebase (primera vez)
- [ ] Configurar Email (SMTP o Zoho Mail API)
- [ ] Probar envío de email

---

## 🔄 Actualizar

**Desde Dockge:**
- Click en **"Actualizar"** (si usas Git Repository)

**Desde SSH:**
```bash
cd /data/stacks/gestor-cobros
git pull origin main
docker-compose build --no-cache && docker-compose up -d
```

---

## 📚 Documentación Completa

Ver `docs/GUIA-DOCKGE-COMPLETA.md` para detalles completos.

---

## 🆘 Problemas Comunes

**Error: "Dockerfile not found"**
- Verifica que el `context` sea `.` (punto)

**Error: "PHPMailer not found"**
- El Dockerfile instala PHPMailer automáticamente
- Si falla, verifica los logs de build

**Puerto ocupado**
- Cambia `8080` por otro puerto en `docker-compose.yml`

---

**¿Listo?** ¡Despliega y disfruta! 🎉

