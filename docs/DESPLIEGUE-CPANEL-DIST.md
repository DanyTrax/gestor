# 🚀 Despliegue en cPanel - Carpeta dist/

## ⚠️ Problema Común

Si accedes a `https://clients.dowgroupcol.com/dist/` y no ves nada, es porque:

1. **Los archivos de `dist/` deben estar en la raíz del dominio**, no en una subcarpeta
2. **El contenido de `dist/` debe copiarse directamente a `clients.dowgroupcol.com/`** (que es el directorio público del dominio)

## 📁 Estructura Correcta

```
~/clients.dowgroupcol.com/          ← Directorio del proyecto (y también directorio público)
├── src/                            ← Código fuente (no necesario en producción)
├── dist/                           ← Build compilado (carpeta temporal)
│   ├── index.html                  ← Este archivo debe estar en la raíz
│   └── assets/                     ← Esta carpeta debe estar en la raíz
├── index.html                      ← ✅ Debe estar aquí (copiado de dist/)
├── assets/                         ← ✅ Debe estar aquí (copiado de dist/)
├── send-email.php                  ← ✅ En la raíz
├── upload.php                      ← ✅ En la raíz
├── send-zoho.php                   ← ✅ En la raíz
├── .htaccess                       ← ✅ En la raíz
├── uploads/                        ← ✅ En la raíz (permisos 775)
├── package.json                    ← No necesario en producción
└── .git/                           ← Repositorio Git
```

## ✅ Solución: Desplegar dist/ en cPanel

### Opción 1: Usando Git Pull (Recomendado)

#### Paso 1: Conectar al servidor vía SSH o Terminal de cPanel

```bash
# Navegar al directorio del proyecto (que también es el directorio público)
cd ~/clients.dowgroupcol.com
```

#### Paso 2: Hacer pull del repositorio

```bash
git pull origin main
```

#### Paso 3: Copiar contenido de dist/ a la raíz

```bash
# Copiar todo el contenido de dist/ a la raíz del directorio
cp -r dist/* .
cp dist/.htaccess . 2>/dev/null || true

# Verificar que los archivos estén en la raíz
ls -la
# Deberías ver: index.html, assets/, send-email.php, etc.
```

#### Paso 4: Verificar que los archivos estén en la raíz

```bash
ls -la
# Deberías ver: index.html, assets/, send-email.php, upload.php, etc.
```

#### Paso 5: Configurar permisos

```bash
# Permisos para archivos
find . -type f -exec chmod 644 {} \;

# Permisos para directorios
find . -type d -exec chmod 755 {} \;

# Permisos especiales para uploads/
chmod -R 775 uploads/
```

---

### Opción 2: Subir archivos manualmente vía File Manager

1. **Accede a File Manager en cPanel**
2. **Navega a `clients.dowgroupcol.com/`** (directorio del proyecto)
3. **Sube el contenido de `dist/` a la raíz**:
   - `index.html` → debe estar en la raíz de `clients.dowgroupcol.com/`
   - Carpeta `assets/` completa → debe estar en la raíz
4. **Sube también los archivos PHP** (si no están):
   - `send-email.php`
   - `upload.php`
   - `send-zoho.php`
5. **Sube `.htaccess`** a la raíz (si no está)
6. **Crea la carpeta `uploads/`** con permisos 775 (si no existe)

---

### Opción 3: Script Automatizado

Crea un script `deploy.sh` en el servidor:

```bash
#!/bin/bash

# Directorio del proyecto (que también es el directorio público)
PROJECT_DIR="$HOME/clients.dowgroupcol.com"

# Ir al directorio del proyecto
cd "$PROJECT_DIR"

# Hacer pull
git pull origin main

# Copiar contenido de dist/ a la raíz del mismo directorio
cp -r dist/* .
cp dist/.htaccess . 2>/dev/null || true

# Asegurar que los archivos PHP estén en la raíz
# (Ya deberían estar, pero por si acaso)
if [ ! -f "send-email.php" ]; then
    echo "⚠️  Advertencia: send-email.php no encontrado"
fi

# Crear uploads/ si no existe
mkdir -p uploads
chmod -R 775 uploads

# Configurar permisos
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
chmod -R 775 uploads/

echo "✅ Despliegue completado en $PROJECT_DIR"
```

**Ejecutar:**
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 🔍 Verificación

### 1. Verificar que los archivos estén en la raíz

```bash
cd ~/clients.dowgroupcol.com
ls -la
```

**Deberías ver:**
- `index.html` ← ✅ Debe estar aquí (no dentro de dist/)
- `assets/` (carpeta) ← ✅ Debe estar aquí (no dentro de dist/)
- `send-email.php`
- `upload.php`
- `send-zoho.php`
- `.htaccess`
- `dist/` (carpeta con el build, pero el contenido debe estar en la raíz)

### 2. Verificar que la URL funcione

- ✅ **Correcto:** `https://clients.dowgroupcol.com/` → Debe mostrar la aplicación
- ❌ **Incorrecto:** `https://clients.dowgroupcol.com/dist/` → No debería ser necesario

### 3. Verificar permisos

```bash
# Archivos: 644
ls -l index.html
# Debería mostrar: -rw-r--r--

# Directorios: 755
ls -ld assets/
# Debería mostrar: drwxr-xr-x

# Uploads: 775
ls -ld uploads/
# Debería mostrar: drwxrwxr-x
```

---

## 🐛 Troubleshooting

### Problema: "404 Not Found" al acceder a la raíz

**Solución:**
1. Verifica que `index.html` esté en `~/clients.dowgroupcol.com/` (raíz del dominio)
2. Verifica que `.htaccess` esté presente y tenga las reglas correctas
3. Verifica permisos: `chmod 644 index.html`
4. Verifica que el contenido de `dist/` se haya copiado a la raíz

### Problema: "403 Forbidden"

**Solución:**
```bash
cd ~/clients.dowgroupcol.com
chmod 755 .
chmod 644 index.html
chmod -R 755 assets/
```

### Problema: Los assets no cargan (CSS/JS)

**Solución:**
1. Verifica que la carpeta `assets/` esté en la raíz
2. Verifica permisos: `chmod -R 755 assets/`
3. Verifica que las rutas en `index.html` sean relativas (ej: `./assets/...`)

### Problema: PHP no funciona

**Solución:**
1. Verifica que PHP esté habilitado en cPanel
2. Verifica que los archivos `.php` tengan permisos 644
3. Verifica que PHPMailer esté instalado (ver `docs/INSTALAR-PHPMailer.md`)

---

## 📝 Notas Importantes

1. **No subas la carpeta `dist/` completa**, solo su contenido
2. **Los archivos deben estar en la raíz** del dominio (`~/clients.dowgroupcol.com/`)
3. **El directorio `clients.dowgroupcol.com/` ES el directorio público** (no hay `public_html/` separado)
4. **Mantén `.htaccess`** en la raíz para el routing de React
5. **La carpeta `uploads/`** debe tener permisos 775 para escritura
6. **Después de cada `git pull`**, recuerda copiar el contenido de `dist/` a la raíz con: `cp -r dist/* .`

---

## 🔄 Actualización Automática (Opcional)

Puedes configurar un webhook de GitHub para actualizar automáticamente:

1. **Crear `webhook.php`** en `~/clients.dowgroupcol.com/`:
```php
<?php
$secret = 'TU_SECRET_KEY';
$payload = file_get_contents('php://input');
$signature = hash_hmac('sha256', $payload, $secret);

if ($signature === $_SERVER['HTTP_X_HUB_SIGNATURE_256']) {
    exec('cd ~/clients.dowgroupcol.com && git pull origin main && cp -r dist/* . && chmod -R 755 assets/ && chmod 644 index.html');
    http_response_code(200);
    echo "OK";
} else {
    http_response_code(403);
    echo "Forbidden";
}
```

2. **Configurar webhook en GitHub:**
   - URL: `https://clients.dowgroupcol.com/webhook.php`
   - Content type: `application/json`
   - Secret: (el mismo que en `webhook.php`)

---

## ✅ Checklist Final

- [ ] `git pull` ejecutado en `~/clients.dowgroupcol.com/`
- [ ] Contenido de `dist/` copiado a la raíz (`cp -r dist/* .`)
- [ ] `index.html` está en `~/clients.dowgroupcol.com/` (no dentro de `dist/`)
- [ ] Carpeta `assets/` está en `~/clients.dowgroupcol.com/` (no dentro de `dist/`)
- [ ] Archivos PHP en la raíz (`send-email.php`, `upload.php`, `send-zoho.php`)
- [ ] `.htaccess` en la raíz
- [ ] Carpeta `uploads/` creada con permisos 775
- [ ] `index.html` accesible en `https://clients.dowgroupcol.com/` (sin `/dist/`)
- [ ] Assets (CSS/JS) cargando correctamente
- [ ] PHP funcionando (probar `send-email.php`)

---

**¿Necesitas ayuda?** Revisa:
- `docs/EJECUTAR-NPM-EN-CPANEL.md` - Para build en servidor
- `docs/BUILD-LOCAL-Y-SUBIR.md` - Para build local
- `docs/INSTALAR-PHPMailer.md` - Para configuración PHP

