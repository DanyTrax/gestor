# Cómo Actualizar el Stack en Dockge

## 🔄 Proceso de Actualización

Cuando hay cambios en el repositorio Git, necesitas actualizar el stack en Dockge.

## Opción 1: Desde el Servidor (SSH) - Manual

### Paso 1: Conectar al servidor

```bash
ssh usuario@tu-servidor
```

### Paso 2: Ir al directorio del stack

```bash
cd /data/stacks/gestor-cobros
```

### Paso 3: Hacer pull de los cambios

```bash
git pull origin main
```

### Paso 4: En Dockge, hacer Redeploy

1. Abre Dockge en tu navegador
2. Ve a la lista de stacks
3. Busca `gestor-cobros`
4. Click en el botón **"Reconstruir"** o **"Redeploy"**
   - También puede estar como **"Rebuild"** o un ícono de reciclar

Esto reconstruirá la imagen Docker con los nuevos cambios.

---

## Opción 2: Desde Dockge

### Si tienes el botón "Actualizar":

1. Ve al stack `gestor` en Dockge
2. Click en el botón **"Actualizar"** (icono de descarga)
3. Esto debería hacer pull y reconstruir automáticamente

### Si el botón "Actualizar" no funciona o no está:

Usa la **Opción 3** (Manual desde SSH) en su lugar

---

## Opción 3: Script Automático

Puedes crear un script para automatizar esto:

```bash
#!/bin/bash
# update-gestor.sh

cd /data/stacks/gestor-cobros
git pull origin main

# Luego en Dockge, hacer click en "Redeploy" manualmente
# O usar Docker Compose directamente:
docker-compose build --no-cache
docker-compose up -d
```

Para hacerlo ejecutable:
```bash
chmod +x update-gestor.sh
```

---

## 🔍 Verificar si hay cambios pendientes

Antes de hacer pull, puedes verificar:

```bash
cd /data/stacks/gestor-cobros
git fetch
git status
```

Si hay cambios, verás algo como:
```
Your branch is behind 'origin/main' by X commits
```

---

## 🚀 Actualización Rápida (Comando único)

Desde el servidor:

```bash
cd /data/stacks/gestor-cobros && git pull origin main && docker-compose build --no-cache && docker-compose up -d
```

**Nota:** Esto funciona si tienes permisos de Docker y Docker Compose instalado. Si usas Dockge, es mejor usar su interfaz para redeploy.

---

## ⚠️ Importante

- **Backup:** Antes de actualizar, asegúrate de tener un backup de tus datos importantes
- **Downtime:** Durante el rebuild puede haber un breve downtime (1-2 minutos)
- **Permisos:** Verifica que el directorio `uploads` mantenga sus permisos después del update

---

## 🔔 Actualizaciones Automáticas (Webhook)

Si quieres actualizaciones automáticas cuando haces push a GitHub:

1. Configura un webhook en GitHub que apunte a tu servidor
2. Crea un endpoint que ejecute el script de update
3. GitHub notificará automáticamente cuando haya cambios

**Ejemplo básico de webhook handler (Node.js):**

```javascript
// webhook-server.js
const express = require('express');
const { exec } = require('child_process');
const app = express();

app.post('/webhook', (req, res) => {
  exec('cd /data/stacks/gestor-cobros && git pull origin main && docker-compose build && docker-compose up -d', 
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error}`);
        return res.status(500).send('Error updating');
      }
      res.send('Updated successfully');
    });
});

app.listen(3001);
```

---

## 📝 Resumen del Proceso

1. **Haces cambios** → `git push` al repositorio
2. **En el servidor**: `cd /data/stacks/gestor-cobros && git pull`
3. **En Dockge**: Click en **"Redeploy"** o **"Rebuild"**
4. **Listo**: La nueva versión está activa

