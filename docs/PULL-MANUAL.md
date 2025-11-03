# Actualización Manual en Dockge - Guía Rápida

## ⚠️ IMPORTANTE: ¿Desde dónde hacer el pull?

**NO desde el contenedor (`>_ Bash` en Dockge)** ❌
- El contenedor solo tiene archivos compilados, no el código fuente
- No tiene git instalado
- Los cambios no se reflejarán porque el contenedor se reconstruye desde el servidor

**SÍ desde el servidor (SSH)** ✅
- Tienes acceso al código fuente completo
- Puedes hacer git pull
- Luego reconstruir el contenedor con los nuevos cambios

---

## 📋 Pasos para Actualizar Manualmente

Cuando hagas `git push` desde tu computadora, sigue estos pasos en el servidor:

### Paso 1: Conectar al servidor por SSH

```bash
ssh usuario@tu-servidor
```

### Paso 2: Ir al directorio del stack

```bash
cd /data/stacks/gestor-cobros
```

**Nota:** Si el stack está en otra ubicación, ajusta la ruta. Puedes verificar en Dockge → stack `gestor` → sección "docker-compose.yml" → busca el `context: .` o la ruta que indique.

### Paso 3: Hacer pull de los cambios

```bash
git pull origin main
```

### Paso 4: Reconstruir y actualizar el contenedor

```bash
docker-compose build --no-cache
docker-compose up -d
```

### Paso 5: Verificar que esté corriendo

```bash
docker-compose ps
```

Deberías ver algo como:
```
NAME                STATUS         PORTS
gestor-cobros       Up 2 minutes   0.0.0.0:8082->80/tcp
```

---

## 🚀 Comando Único (Rápido)

Si prefieres hacer todo en un solo comando:

```bash
cd /data/stacks/gestor-cobros && git pull origin main && docker-compose build --no-cache && docker-compose up -d
```

---

## 🔍 Si no sabes dónde está el stack

### Opción 1: Buscar por nombre

```bash
find /data -name "docker-compose.yml" 2>/dev/null | xargs grep -l "gestor-cobros"
```

### Opción 2: Desde Dockge

1. Ve a Dockge → stack `gestor`
2. En la sección "docker-compose.yml", busca la línea:
   ```yaml
   - com.uw-labs.dockge.stack-dir=/data/stacks/gestor-cobros
   ```
3. Esa es la ruta donde está el stack

---

## ⚙️ Alternativa: Script de Actualización

Puedes crear un script para automatizar esto:

### Crear el script:

```bash
nano /data/stacks/gestor-cobros/update.sh
```

### Contenido del script:

```bash
#!/bin/bash

echo "🔄 Actualizando gestor-cobros..."

cd /data/stacks/gestor-cobros

echo "📥 Descargando cambios de Git..."
git pull origin main

if [ $? -eq 0 ]; then
    echo "✅ Git pull exitoso"
    
    echo "🔨 Reconstruyendo imagen Docker..."
    docker-compose build --no-cache
    
    if [ $? -eq 0 ]; then
        echo "✅ Build exitoso"
        
        echo "🚀 Reiniciando contenedor..."
        docker-compose up -d
        
        if [ $? -eq 0 ]; then
            echo "✅ Contenedor actualizado y corriendo"
            docker-compose ps
        else
            echo "❌ Error al iniciar el contenedor"
        fi
    else
        echo "❌ Error en el build"
    fi
else
    echo "❌ Error al hacer pull de Git"
fi
```

### Hacer el script ejecutable:

```bash
chmod +x /data/stacks/gestor-cobros/update.sh
```

### Usar el script:

```bash
/data/stacks/gestor-cobros/update.sh
```

O desde cualquier lugar:

```bash
cd /data/stacks/gestor-cobros
./update.sh
```

---

## 🐛 Troubleshooting

### Error: "fatal: not a git repository"

**Solución:** El directorio no está inicializado como repositorio Git.

```bash
cd /data/stacks/gestor-cobros
git init
git remote add origin https://github.com/DanyTrax/gestor.git
git pull origin main
```

### Error: "Permission denied"

**Solución:** Asegúrate de tener permisos en el directorio.

```bash
sudo chown -R $USER:$USER /data/stacks/gestor-cobros
```

### Error: "docker-compose: command not found"

**Solución:** Docker Compose no está instalado o está como `docker compose` (sin guion).

```bash
# Probar con:
docker compose build --no-cache
docker compose up -d

# O instalar docker-compose:
sudo apt install docker-compose
```

### Los cambios no se reflejan

**Solución:** Limpiar caché y reconstruir:

```bash
cd /data/stacks/gestor-cobros
docker-compose down
docker-compose build --no-cache --pull
docker-compose up -d
```

---

## 🚫 ¿Por qué NO desde el contenedor?

Si intentas hacer `git pull` desde el botón `>_ Bash` del contenedor:

```bash
# ❌ Esto NO funcionará dentro del contenedor
cd /var/www/html
git pull origin main  # Error: not a git repository
```

**Razones:**
1. El contenedor solo contiene los archivos compilados (`dist/`)
2. No tiene el código fuente original
3. No tiene git instalado
4. El contenedor es solo el resultado del build, no el proyecto completo

**Solución:** Siempre hacer pull desde el **servidor host** (donde está el código fuente), luego reconstruir el contenedor.

---

## 📝 Resumen del Flujo Completo

1. **En tu computadora local:**
   ```bash
   git add .
   git commit -m "mis cambios"
   git push origin main
   ```

2. **En el servidor (SSH):**
   ```bash
   cd /data/stacks/gestor-cobros
   git pull origin main
   docker-compose build --no-cache
   docker-compose up -d
   ```

3. **Verificar:**
   - Visita `http://tu-servidor:8082` para confirmar que funciona
   - Revisa logs: `docker-compose logs --tail=50`

---

## 💡 Tips

- **Guarda este comando en un alias** para hacerlo más rápido:
  ```bash
  alias update-gestor='cd /data/stacks/gestor-cobros && git pull origin main && docker-compose build --no-cache && docker-compose up -d'
  ```
  
  Agrega esta línea a tu `~/.bashrc` o `~/.zshrc` para que persista.

- **Ver cambios antes de actualizar:**
  ```bash
  cd /data/stacks/gestor-cobros
  git fetch
  git log HEAD..origin/main --oneline  # Ver qué cambios hay
  git pull origin main  # Aplicar cambios
  ```

---

¡Listo! Ahora puedes actualizar manualmente cada vez que hagas push.

