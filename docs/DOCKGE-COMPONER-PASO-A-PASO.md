# 🐳 Guía: Crear Stack en Dockge "Componer"

## 📋 Paso a Paso en la Interfaz "Componer"

### Paso 1: Iniciar Creación

1. En el **sidebar izquierdo**, click en el botón verde **"+ Componer"**
2. Se abrirá la interfaz de "Componer" en el centro

---

### Paso 2: Configurar "General"

#### 2.1 Nombre de la Pila

En el campo **"Nombre de la Pila"**:
- Escribe: `gestor-cobros`
- ⚠️ **Importante:** Solo minúsculas, sin espacios

#### 2.2 Agentes Dockge

En **"Agentes Dockge"**:
- Deja seleccionado: **"(online) Actual"** (o el agente que tengas)

---

### Paso 3: Configurar Docker Compose (Área de Texto Derecha)

En el **área de texto grande del lado derecho** (donde dice "1" o está vacío), pega este contenido completo:

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

**⚠️ IMPORTANTE:** 
- Reemplaza TODO el contenido que esté en esa área de texto
- Asegúrate de que la indentación sea correcta (usa espacios, no tabs)

---

### Paso 4: Configurar Origen del Código

**Opción A: Desde Repositorio Git (Recomendado)**

1. Busca una sección que diga **"Source"**, **"Origen"**, **"Git Repository"** o similar
2. Si no la ves, puede estar en un menú desplegable o en "Adicional"
3. Selecciona **"Git Repository"** o **"Repositorio Git"**
4. Completa:
   - **Git Repository URL:** `https://github.com/DanyTrax/gestor.git`
   - **Branch:** `main`
   - **Stack File Path:** `docker-compose.yml`

**Opción B: Si no hay opción Git (Archivos Locales)**

Si no encuentras la opción de Git Repository, necesitarás:

1. **Conectar por SSH al servidor:**
   ```bash
   ssh usuario@tu-servidor
   ```

2. **Clonar el repositorio:**
   ```bash
   cd /data/stacks
   git clone https://github.com/DanyTrax/gestor.git gestor-cobros
   cd gestor-cobros
   ```

3. **En Dockge, cambiar el `context` en el docker-compose.yml:**
   ```yaml
   build:
     context: /data/stacks/gestor-cobros  # Ruta absoluta
     dockerfile: Dockerfile
   ```

---

### Paso 5: Configurar Redes (Opcional)

En la sección **"Redes"** del sidebar derecho:

- **Redes Internas:** No necesitas agregar nada (se crea automáticamente)
- **Redes Externas:** Deja todas desactivadas (toggle en gris/off)

---

### Paso 6: Variables de Entorno (Opcional)

En el área de texto **".env"** del sidebar derecho:

Por ahora, déjala vacía o con solo comentarios. Si más adelante necesitas variables de entorno, las agregarás aquí.

---

### Paso 7: Guardar y Desplegar

1. **Click en "Guardar"** (botón gris con icono de disquete 💾)
   - Esto guarda la configuración sin desplegar

2. **Click en "Desplegar"** (botón azul con icono de cohete 🚀)
   - Esto iniciará el proceso de build y despliegue

---

### Paso 8: Monitorear el Proceso

Después de clickear "Desplegar":

1. Verás los **logs de build** en la pantalla
2. El proceso tomará **5-10 minutos** aproximadamente
3. Verás mensajes como:
   - "Clonando repositorio..."
   - "Construyendo imagen..."
   - "Iniciando contenedor..."

---

### Paso 9: Verificar Estado

1. Una vez terminado, el stack `gestor-cobros` aparecerá en el **sidebar izquierdo**
2. Debería mostrar estado **"activo"** (etiqueta azul claro)
3. Click en el stack para ver detalles y logs

---

## 🎯 Acceso a la Aplicación

Una vez desplegado:

- **URL:** `http://tu-servidor:8080`
- **Puerto:** Si 8080 está ocupado, cámbialo en el `docker-compose.yml` antes de desplegar

---

## ⚠️ Si el Puerto 8080 está Ocupado

Si ya tienes otro servicio usando el puerto 8080:

1. En el área de texto del `docker-compose.yml`, cambia:
   ```yaml
   ports:
     - "8081:80"  # Cambia 8080 por 8081 u otro puerto libre
   ```

2. Guarda y despliega nuevamente

---

## 🔄 Actualizar el Stack (Futuro)

Cuando necesites actualizar:

1. Click en el stack `gestor-cobros` en el sidebar izquierdo
2. Busca el botón **"Actualizar"** o **"Update"** (icono ⬇️)
3. Click para hacer pull de Git y reconstruir automáticamente

---

## 🐛 Solución de Problemas

### Error: "Dockerfile: no such file or directory"

**Causa:** El contexto no está configurado correctamente.

**Solución:**
- Si usas Git Repository, el `context` debe ser `.` (punto)
- Si usas archivos locales, usa la ruta absoluta: `/data/stacks/gestor-cobros`

### Error: "Port already in use"

**Solución:**
- Cambia el puerto en `docker-compose.yml` (ej: `8081:80`)
- Guarda y redespliega

### El stack no aparece después de desplegar

**Verificaciones:**
1. Revisa los logs en la pantalla de "Componer"
2. Busca errores en rojo
3. Verifica que el nombre del stack sea correcto (solo minúsculas)

---

## ✅ Checklist de Configuración

- [ ] Click en "+ Componer"
- [ ] Nombre de la Pila: `gestor-cobros`
- [ ] Docker Compose.yml pegado correctamente
- [ ] Git Repository configurado (o archivos locales)
- [ ] Click en "Guardar"
- [ ] Click en "Desplegar"
- [ ] Esperar a que termine el build
- [ ] Verificar que el stack esté "activo"
- [ ] Acceder a `http://tu-servidor:8080`

---

## 📸 Capturas de Referencia

**Área de Texto Docker Compose:**
- Es el área grande del lado derecho donde pegas el YAML
- Debe tener el contenido completo del `docker-compose.yml`

**Botones de Acción:**
- **"Guardar"** (gris, icono disquete): Guarda sin desplegar
- **"Desplegar"** (azul, icono cohete): Guarda y despliega

---

## 🎉 ¡Listo!

Una vez desplegado, tu aplicación estará disponible en:
- `http://tu-servidor:8080`

**Próximos pasos:**
1. Configurar Firebase (primera vez)
2. Crear usuario Superadmin
3. Configurar Email (SMTP o Zoho Mail API)

---

**¿Necesitas ayuda?** Si encuentras algún problema, revisa los logs en la pantalla de "Componer" o consulta `docs/GUIA-DOCKGE-COMPLETA.md` para más detalles.

