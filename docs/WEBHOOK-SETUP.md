# Configuración de Webhook para Actualización Automática

Este setup permite que cuando hagas `git push`, automáticamente se actualice el stack en Dockge.

## 🎯 Requisitos

- Node.js instalado en el servidor
- Acceso SSH al servidor
- Permisos para ejecutar Docker commands
- Puerto disponible (3001 por defecto)

## 📋 Paso 1: Instalar dependencias en el servidor

```bash
ssh usuario@tu-servidor

# Ir al directorio del stack
cd /data/stacks/gestor-cobros

# Clonar el repo si no lo tienes (o hacer pull)
git clone https://github.com/DanyTrax/gestor.git .
# O si ya existe:
# git pull origin main

# Instalar Node.js si no lo tienes
# En Ubuntu/Debian:
sudo apt update
sudo apt install nodejs npm

# Instalar dependencias
npm install express
```

## 📋 Paso 2: Configurar el webhook server

```bash
# Generar un secret aleatorio
SECRET=$(openssl rand -hex 32)
echo $SECRET  # Copia este valor, lo necesitarás en GitHub

# Crear archivo .env
cat > .env << EOF
WEBHOOK_SECRET=$SECRET
STACK_DIR=/data/stacks/gestor-cobros
PORT=3001
EOF

# Hacer ejecutable el script
chmod +x webhook-server.js
```

## 📋 Paso 3: Iniciar el webhook server

### Opción A: Con PM2 (Recomendado - se reinicia automáticamente)

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar el webhook server
pm2 start webhook-server.js --name gestor-webhook

# Guardar configuración para que se inicie al reiniciar
pm2 save
pm2 startup  # Sigue las instrucciones que muestra
```

### Opción B: Con systemd (Alternativa)

```bash
# Crear servicio systemd
sudo nano /etc/systemd/system/gestor-webhook.service
```

Contenido del servicio:

```ini
[Unit]
Description=Gestor Webhook Server
After=network.target

[Service]
Type=simple
User=tu-usuario
WorkingDirectory=/data/stacks/gestor-cobros
Environment="NODE_ENV=production"
EnvironmentFile=/data/stacks/gestor-cobros/.env
ExecStart=/usr/bin/node /data/stacks/gestor-cobros/webhook-server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Luego:

```bash
sudo systemctl daemon-reload
sudo systemctl enable gestor-webhook
sudo systemctl start gestor-webhook
sudo systemctl status gestor-webhook
```

### Opción C: Ejecutar directamente (No recomendado para producción)

```bash
node webhook-server.js
```

## 📋 Paso 4: Configurar el webhook en GitHub

1. Ve a tu repositorio en GitHub: `https://github.com/DanyTrax/gestor`

2. Settings → Webhooks → Add webhook

3. Configura:
   - **Payload URL**: `http://tu-servidor:3001/webhook`
     - Si tienes un dominio: `https://webhook.dowgroupcol.com/webhook`
     - Si no tienes HTTPS, usa HTTP directo al IP:puerto
   - **Content type**: `application/json`
   - **Secret**: Pega el `SECRET` que generaste antes
   - **Which events**: Selecciona "Just the push event"
   - **Active**: ✅ Marcado

4. Click en "Add webhook"

## 📋 Paso 5: Configurar firewall (si es necesario)

Si tu servidor tiene firewall, abre el puerto 3001:

```bash
# UFW (Ubuntu)
sudo ufw allow 3001/tcp

# O con iptables
sudo iptables -A INPUT -p tcp --dport 3001 -j ACCEPT
```

## ✅ Probar el webhook

1. Haz un pequeño cambio en el código
2. Haz commit y push:
   ```bash
   git add .
   git commit -m "test webhook"
   git push origin main
   ```
3. Ve a GitHub → Settings → Webhooks → Click en tu webhook
4. Verifica que aparezca una entrega (delivery) exitosa
5. En el servidor, verifica los logs:
   ```bash
   # Si usas PM2
   pm2 logs gestor-webhook
   
   # O si usas systemd
   sudo journalctl -u gestor-webhook -f
   ```

## 🔍 Verificar que funciona

```bash
# Ver logs del webhook
pm2 logs gestor-webhook

# Verificar que el contenedor se actualizó
cd /data/stacks/gestor-cobros
docker-compose ps
docker-compose logs --tail=50
```

## 🔒 Seguridad adicional (Opcional pero recomendado)

### Usar HTTPS con Nginx reverse proxy

Si tienes Nginx, puedes crear un proxy para usar HTTPS:

```nginx
# /etc/nginx/sites-available/webhook
server {
    listen 443 ssl;
    server_name webhook.dowgroupcol.com;

    ssl_certificate /ruta/a/cert.pem;
    ssl_certificate_key /ruta/a/key.pem;

    location /webhook {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Luego en GitHub, usa `https://webhook.dowgroupcol.com/webhook`

## 🐛 Troubleshooting

### El webhook no se ejecuta

1. Verifica que el servidor esté corriendo:
   ```bash
   pm2 status
   # O
   sudo systemctl status gestor-webhook
   ```

2. Verifica que el puerto esté abierto:
   ```bash
   netstat -tlnp | grep 3001
   ```

3. Revisa logs en GitHub → Webhooks → Click en el webhook → Ver deliveries

### Error de permisos

```bash
# Dar permisos al usuario para Docker (sin sudo)
sudo usermod -aG docker $USER
# Luego reinicia sesión
```

### El secret no coincide

- Verifica que el secret en `.env` sea el mismo que configuraste en GitHub
- Regenera si es necesario

## 📝 Resumen del flujo

1. **Haces cambios** localmente → `git commit` → `git push`
2. **GitHub** recibe el push → Envía webhook a tu servidor
3. **Webhook server** recibe la notificación → Ejecuta `git pull`
4. **Docker** reconstruye la imagen → Reinicia el contenedor
5. **✅ Tu aplicación está actualizada automáticamente!**

