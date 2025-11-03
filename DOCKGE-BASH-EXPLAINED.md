# ¿Puedo hacer git pull desde el Bash del contenedor en Dockge?

## ❌ Respuesta corta: NO

El botón **">_ Bash"** en Dockge te da acceso al shell **dentro del contenedor Docker**, pero:

### ¿Qué tiene el contenedor?

```
/var/www/html/
├── index.html          # Archivo compilado
├── assets/            # Archivos JS/CSS compilados
├── upload.php         # Script PHP
└── uploads/           # Directorio de uploads
```

### ¿Qué NO tiene el contenedor?

- ❌ Código fuente original (`src/`)
- ❌ `package.json`
- ❌ `Dockerfile`
- ❌ Archivos `.git`
- ❌ Git instalado
- ❌ Node.js (solo en el stage de build, no en producción)

## ✅ La forma correcta: Desde el servidor host

El código fuente está en el **servidor donde corre Dockge**, no dentro del contenedor.

### Dónde está el código fuente:

Basado en tu `docker-compose.yml`:
```yaml
labels:
  - com.uw-labs.dockge.stack-dir=/opt/stacks/gestor
```

Tu código está en: **`/opt/stacks/gestor`** en el servidor.

### Cómo actualizar:

1. **Conéctate al servidor por SSH** (NO al contenedor):
   ```bash
   ssh usuario@tu-servidor
   ```

2. **Ve al directorio del stack:**
   ```bash
   cd /opt/stacks/gestor
   ```

3. **Haz pull:**
   ```bash
   git pull origin main
   ```

4. **Reconstruye el contenedor:**
   ```bash
   docker-compose build --no-cache
   docker-compose up -d
   ```

## 🔍 ¿Para qué sirve el Bash del contenedor entonces?

El botón `>_ Bash` es útil para:

- ✅ Verificar que los archivos compilados están correctos
- ✅ Revisar logs de Apache/PHP
- ✅ Debugging dentro del contenedor
- ✅ Verificar configuraciones de runtime
- ✅ Comprobar permisos de archivos

**Ejemplos:**
```bash
# Ver logs de Apache
tail -f /var/log/apache2/error.log

# Verificar archivos compilados
ls -la /var/www/html/assets/

# Verificar permisos de uploads
ls -la /var/www/html/uploads/

# Ver configuración de PHP
php -i | grep upload_max_filesize
```

**Pero NO para:**
- ❌ Hacer git pull (no hay git)
- ❌ Modificar código fuente (solo está compilado)
- ❌ Instalar dependencias (solo PHP + Apache)

## 📊 Comparación

| Acción | ¿Desde el servidor? | ¿Desde el contenedor? |
|--------|-------------------|----------------------|
| `git pull` | ✅ Sí | ❌ No (no hay git) |
| `npm install` | ✅ Sí (en build) | ❌ No (no hay Node) |
| Ver archivos compilados | ✅ Sí | ✅ Sí |
| Ver logs de Apache | ⚠️ Indirecto | ✅ Sí (directo) |
| Reconstruir imagen | ✅ Sí | ❌ No (necesitas acceso al servidor) |

## 🎯 Resumen

- **Para actualizar código:** Servidor host (SSH) ✅
- **Para debugging/verificación:** Contenedor (Bash) ✅

---

## 💡 Tip: Verificar desde dónde estás

Si no estás seguro si estás en el servidor o en el contenedor:

```bash
# Si ves algo como esto, estás en el CONTENEDOR:
root@gestor-cobros:/var/www/html#

# Si ves algo como esto, estás en el SERVIDOR:
usuario@servidor:/opt/stacks/gestor#
```

O verifica la ruta:
- `/var/www/html` = Contenedor (solo archivos compilados)
- `/opt/stacks/gestor` o `/data/stacks/gestor-cobros` = Servidor (código fuente completo)

