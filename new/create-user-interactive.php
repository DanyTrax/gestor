#!/usr/bin/env php
<?php
/**
 * Script interactivo para crear usuario administrador
 * Uso: php create-user-interactive.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;

echo "🚀 Crear Usuario Administrador\n";
echo str_repeat("=", 40) . "\n\n";

// Solicitar datos
echo "Ingresa el email: ";
$email = trim(fgets(STDIN));
if (empty($email)) {
    echo "❌ Email es requerido\n";
    exit(1);
}

echo "Ingresa la contraseña: ";
$password = trim(fgets(STDIN));
if (empty($password)) {
    echo "❌ Contraseña es requerida\n";
    exit(1);
}

echo "Ingresa el nombre completo: ";
$name = trim(fgets(STDIN));
if (empty($name)) {
    $name = 'Administrador';
}

try {
    // Verificar si el usuario ya existe
    if (User::where('email', $email)->exists()) {
        echo "⚠️  El usuario con email '$email' ya existe.\n";
        exit(1);
    }

    // Crear usuario
    $user = User::create([
        'email' => $email,
        'password' => bcrypt($password),
        'full_name' => $name,
        'role' => 'superadmin',
        'status' => 'active',
        'is_profile_complete' => true,
    ]);

    echo "\n✅ Usuario creado exitosamente!\n\n";
    echo "Email: {$user->email}\n";
    echo "Nombre: {$user->full_name}\n";
    echo "Rol: {$user->role}\n";
    echo "Contraseña: $password\n\n";
    echo "🔐 Puedes iniciar sesión ahora en: /login\n";
    
} catch (\Exception $e) {
    echo "❌ Error al crear usuario: " . $e->getMessage() . "\n";
    exit(1);
}

