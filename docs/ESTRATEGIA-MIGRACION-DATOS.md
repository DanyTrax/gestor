# Estrategia de Migración de Datos - Firebase ↔ SQL

## 🎯 Objetivo

Migrar datos de Firebase a SQL **SIN PERDER INFORMACIÓN** y permitir que ambos sistemas funcionen durante la transición.

## 📋 Opciones de Migración

### Opción 1: Migración Dual (Recomendada) ⭐

**Concepto**: Mantener Firebase y SQL funcionando en paralelo durante la migración.

#### Estructura de Directorios:

```
gestor-cobros/
├── gestor-cobros-react/          ← Sistema actual (Firebase)
│   ├── src/
│   ├── package.json
│   └── (mantiene funcionando)
│
├── gestor-cobros-laravel/        ← Sistema nuevo (Laravel + SQL)
│   ├── app/
│   ├── database/
│   └── (nuevo sistema)
│
└── scripts/
    └── sync-firebase-to-sql.php  ← Sincronización bidireccional
```

#### Cómo Funciona:

1. **Sistema Actual (React + Firebase)**: Sigue funcionando normalmente
2. **Sistema Nuevo (Laravel + SQL)**: Se crea en paralelo
3. **Script de Sincronización**: Copia datos de Firebase → SQL periódicamente
4. **Migración Gradual**: Usuarios se mueven al nuevo sistema uno por uno

#### Ventajas:
- ✅ **Cero pérdida de datos**
- ✅ **Sistema actual sigue funcionando**
- ✅ **Migración gradual**
- ✅ **Rollback fácil** si hay problemas
- ✅ **Testing en producción paralelo**

---

### Opción 2: Sincronización Bidireccional

**Concepto**: Ambos sistemas escriben en Firebase Y SQL simultáneamente.

```
Usuario → Laravel → Firebase + SQL (ambos)
```

#### Flujo:

```php
// En Laravel, al crear un pago:
public function store(Request $request) {
    // 1. Guardar en SQL (principal)
    $payment = Payment::create($request->all());
    
    // 2. Sincronizar a Firebase (backup/temporal)
    $this->syncToFirebase($payment);
    
    return response()->json($payment);
}
```

#### Ventajas:
- ✅ Ambos sistemas tienen datos actualizados
- ✅ Firebase como backup
- ✅ Migración sin interrupciones

#### Desventajas:
- ⚠️ Más complejo de mantener
- ⚠️ Doble escritura (más lento)

---

### Opción 3: Migración Completa con Punto de Corte

**Concepto**: Exportar todo Firebase → SQL en un momento específico.

#### Proceso:

1. **Día X-7**: Script de exportación de Firebase
2. **Día X-3**: Importar datos a SQL
3. **Día X-1**: Validar datos
4. **Día X**: Cambiar DNS/rutas al nuevo sistema
5. **Día X+1**: Firebase queda como backup read-only

#### Ventajas:
- ✅ Migración rápida
- ✅ Simple de implementar

#### Desventajas:
- ⚠️ Requiere downtime
- ⚠️ Riesgo de pérdida de datos entre exportación y corte

---

## 🏗️ Recomendación: Opción 1 (Migración Dual)

### Estructura Propuesta:

```
/var/www/html/
├── gestor-cobros/                    ← Directorio principal
│   │
│   ├── current/                     ← Sistema actual (React + Firebase)
│   │   ├── dist/
│   │   ├── send-email.php
│   │   └── upload.php
│   │   └── .htaccess → apunta a current/
│   │
│   ├── new/                         ← Sistema nuevo (Laravel + SQL)
│   │   ├── app/
│   │   ├── database/
│   │   ├── public/
│   │   └── .env
│   │
│   └── scripts/
│       ├── sync-firebase-to-sql.php
│       └── validate-migration.php
```

### Configuración de Rutas:

#### Durante la Migración:

```apache
# .htaccess principal
# Sistema actual (default)
RewriteRule ^$ current/dist/index.html [L]
RewriteRule ^(.*)$ current/$1 [L]

# Sistema nuevo (testing)
RewriteRule ^new/(.*)$ new/public/$1 [L]
```

#### Después de la Migración:

```apache
# Sistema nuevo (default)
RewriteRule ^$ new/public/index.php [L]
RewriteRule ^(.*)$ new/public/$1 [L]

# Sistema anterior (backup/read-only)
RewriteRule ^old/(.*)$ current/$1 [L]
```

---

## 📊 Estrategia de Sincronización

### Fase 1: Migración Inicial de Datos (Una vez)

```php
// scripts/migrate-initial-data.php

use Firebase\Firestore\FirestoreClient;
use App\Models\User;
use App\Models\Service;
use App\Models\Payment;

$firestore = new FirestoreClient([
    'projectId' => 'alojamientos-3c46b',
]);

// 1. Migrar Usuarios
$usersRef = $firestore->collection('artifacts/alojamientos-3c46b/public/data/users');
$users = $usersRef->documents();

foreach ($users as $userDoc) {
    $data = $userDoc->data();
    
    User::create([
        'id' => $userDoc->id(),
        'email' => $data['email'],
        'full_name' => $data['fullName'] ?? '',
        'role' => $data['role'] ?? 'client',
        'status' => $data['status'] ?? 'active',
        // ... más campos
        'created_at' => $data['createdAt'] ?? now(),
    ]);
}

// 2. Migrar Servicios
// 3. Migrar Pagos
// 4. Migrar Tickets
// 5. Migrar Configuraciones
```

### Fase 2: Sincronización Continua (Durante Transición)

```php
// scripts/sync-firebase-to-sql.php
// Ejecutar cada hora vía cron

use App\Services\FirebaseSyncService;

class FirebaseSyncService
{
    public function syncNewData()
    {
        // Obtener timestamp de última sincronización
        $lastSync = Cache::get('last_firebase_sync', now()->subDay());
        
        // Sincronizar solo datos nuevos/modificados
        $this->syncUsers($lastSync);
        $this->syncServices($lastSync);
        $this->syncPayments($lastSync);
        $this->syncTickets($lastSync);
        
        Cache::put('last_firebase_sync', now());
    }
    
    private function syncUsers($lastSync)
    {
        // Obtener usuarios modificados después de lastSync
        $users = $firestore
            ->collection('users')
            ->where('updatedAt', '>', $lastSync)
            ->documents();
        
        foreach ($users as $user) {
            // Actualizar o crear en SQL
            User::updateOrCreate(
                ['id' => $user->id()],
                $user->data()
            );
        }
    }
}
```

### Cron Job:

```bash
# /etc/cron.hourly/sync-firebase-to-sql
0 * * * * cd /var/www/html/gestor-cobros/new && php artisan sync:firebase
```

---

## 🔄 Flujo de Migración Gradual

### Semana 1-4: Desarrollo en Paralelo
- ✅ Sistema actual sigue funcionando
- ✅ Desarrollo de Laravel en `/new/`
- ✅ Migración inicial de datos (una vez)

### Semana 5-6: Testing en Paralelo
- ✅ Usuarios de prueba usan `/new/`
- ✅ Sincronización automática Firebase → SQL
- ✅ Validación de datos

### Semana 7-8: Migración Gradual de Usuarios
- ✅ Migrar usuarios uno por uno
- ✅ Sistema actual sigue para usuarios no migrados
- ✅ Script de sincronización bidireccional

### Semana 9-10: Cambio Completo
- ✅ Todos los usuarios migrados
- ✅ DNS apunta a `/new/`
- ✅ Sistema anterior queda como backup

---

## 🔐 Manejo de Autenticación Dual

### Opción A: Laravel Auth + Firebase Auth Temporal

```php
// app/Http/Controllers/Auth/LoginController.php

public function login(Request $request)
{
    // Intentar autenticación Laravel primero
    if (Auth::attempt($credentials)) {
        return redirect()->intended('/dashboard');
    }
    
    // Si no existe en Laravel, verificar Firebase
    if ($this->checkFirebaseAuth($credentials)) {
        // Crear usuario en Laravel desde Firebase
        $user = $this->createUserFromFirebase($firebaseUser);
        Auth::login($user);
        return redirect()->intended('/dashboard');
    }
    
    return back()->withErrors(['email' => 'Credenciales incorrectas']);
}
```

### Opción B: Resetear Contraseñas (Recomendado)

```php
// Al migrar usuario, enviar email para resetear contraseña
public function migrateUser($firebaseUserId)
{
    $firebaseUser = $this->getFirebaseUser($firebaseUserId);
    
    $user = User::create([
        'email' => $firebaseUser->email,
        'password' => Hash::make(Str::random(16)), // Temporal
        // ... otros campos
    ]);
    
    // Enviar email para resetear contraseña
    Password::sendResetLink(['email' => $user->email]);
    
    return $user;
}
```

---

## 📁 Estructura de Archivos en Servidor

```
/var/www/html/gestor-cobros/
│
├── current/                    ← Sistema actual (React)
│   ├── dist/
│   ├── send-email.php
│   ├── upload.php
│   └── .htaccess
│
├── new/                        ← Sistema nuevo (Laravel)
│   ├── app/
│   ├── database/
│   ├── public/
│   │   ├── index.php
│   │   └── uploads/
│   ├── .env
│   └── .htaccess
│
├── shared/                     ← Recursos compartidos
│   ├── uploads/
│   │   ├── payments/
│   │   └── tickets/
│   └── invoices/
│
└── scripts/
    ├── migrate-initial-data.php
    ├── sync-firebase-to-sql.php
    └── validate-migration.php
```

### Configuración Apache:

```apache
# /etc/apache2/sites-available/gestor-cobros.conf

<VirtualHost *:80>
    ServerName clients.dowgroupcol.com
    
    # Durante migración: Sistema actual
    DocumentRoot /var/www/html/gestor-cobros/current
    
    # Sistema nuevo en subdirectorio
    Alias /new /var/www/html/gestor-cobros/new/public
    
    <Directory /var/www/html/gestor-cobros/new/public>
        AllowOverride All
        Require all granted
    </Directory>
    
    # Uploads compartidos
    Alias /uploads /var/www/html/gestor-cobros/shared/uploads
    
    <Directory /var/www/html/gestor-cobros/shared/uploads>
        Require all granted
    </Directory>
</VirtualHost>
```

---

## 🔄 Script de Sincronización Bidireccional

```php
// app/Console/Commands/SyncFirebaseToSql.php

class SyncFirebaseToSql extends Command
{
    protected $signature = 'sync:firebase';
    protected $description = 'Sincronizar datos de Firebase a SQL';
    
    public function handle()
    {
        $this->info('Sincronizando usuarios...');
        $this->syncUsers();
        
        $this->info('Sincronizando servicios...');
        $this->syncServices();
        
        $this->info('Sincronizando pagos...');
        $this->syncPayments();
        
        $this->info('Sincronización completada');
    }
    
    private function syncUsers()
    {
        $users = $this->getFirebaseUsers();
        
        foreach ($users as $firebaseUser) {
            User::updateOrCreate(
                ['firebase_id' => $firebaseUser->id()],
                [
                    'email' => $firebaseUser->data()['email'],
                    'full_name' => $firebaseUser->data()['fullName'] ?? '',
                    // ... más campos
                ]
            );
        }
    }
}
```

---

## ✅ Checklist de Migración

### Pre-Migración:
- [ ] Backup completo de Firebase
- [ ] Crear estructura de directorios
- [ ] Instalar Laravel en `/new/`
- [ ] Configurar base de datos SQL
- [ ] Crear migraciones de tablas

### Migración Inicial:
- [ ] Exportar datos de Firebase
- [ ] Importar a SQL (una vez)
- [ ] Validar integridad de datos
- [ ] Configurar sincronización automática

### Durante Migración:
- [ ] Script de sincronización ejecutándose
- [ ] Sistema actual funcionando
- [ ] Sistema nuevo funcionando en `/new/`
- [ ] Testing en paralelo

### Post-Migración:
- [ ] Todos los usuarios migrados
- [ ] Cambiar DNS/rutas
- [ ] Sistema anterior como backup
- [ ] Desactivar sincronización
- [ ] Monitoreo de errores

---

## 🎯 Resumen de la Estrategia

1. **Mantener ambos sistemas** en directorios separados
2. **Migración inicial** de datos históricos (una vez)
3. **Sincronización continua** durante la transición
4. **Migración gradual** de usuarios
5. **Sistema anterior como backup** después de migración completa

**Ventajas:**
- ✅ Cero pérdida de datos
- ✅ Sin interrupciones
- ✅ Rollback fácil
- ✅ Testing seguro

¿Quieres que cree la estructura de directorios y los scripts de sincronización?

