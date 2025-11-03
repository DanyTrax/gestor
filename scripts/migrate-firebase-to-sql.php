<?php

/**
 * Script de Migración Firebase → MySQL
 * 
 * Este script migra todos los datos de Firebase Firestore a MySQL
 * 
 * Uso: php migrate-firebase-to-sql.php
 */

require __DIR__ . '/../gestor-cobros-new/vendor/autoload.php';

use Kreait\Firebase\Factory;
use Kreait\Firebase\Firestore;
use App\Models\User;
use App\Models\Service;
use App\Models\Payment;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\MessageHistory;
use App\Models\EmailConfig;
use App\Models\NotificationSetting;
use App\Models\CompanySetting;
use App\Models\MessageTemplate;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

// Configuración
$appId = 'alojamientos-3c46b';
$firebaseCredentialsPath = __DIR__ . '/../firebase-credentials.json';

echo "🚀 Iniciando migración de Firebase a MySQL...\n\n";

try {
    // Inicializar Firebase
    $factory = (new Factory)->withServiceAccount($firebaseCredentialsPath);
    $firestore = $factory->createFirestore();

    // 1. Migrar Usuarios
    echo "📦 Migrando usuarios...\n";
    migrateUsers($firestore, $appId);
    
    // 2. Migrar Servicios
    echo "📦 Migrando servicios...\n";
    migrateServices($firestore, $appId);
    
    // 3. Migrar Pagos
    echo "📦 Migrando pagos...\n";
    migratePayments($firestore, $appId);
    
    // 4. Migrar Tickets
    echo "📦 Migrando tickets...\n";
    migrateTickets($firestore, $appId);
    
    // 5. Migrar Mensajes de Tickets
    echo "📦 Migrando mensajes de tickets...\n";
    migrateTicketMessages($firestore, $appId);
    
    // 6. Migrar Historial de Mensajes
    echo "📦 Migrando historial de mensajes...\n";
    migrateMessageHistory($firestore, $appId);
    
    // 7. Migrar Configuración de Email
    echo "📦 Migrando configuración de email...\n";
    migrateEmailConfig($firestore, $appId);
    
    // 8. Migrar Configuración de Notificaciones
    echo "📦 Migrando configuración de notificaciones...\n";
    migrateNotificationSettings($firestore, $appId);
    
    // 9. Migrar Configuración de Empresa
    echo "📦 Migrando configuración de empresa...\n";
    migrateCompanySettings($firestore, $appId);
    
    // 10. Migrar Plantillas
    echo "📦 Migrando plantillas...\n";
    migrateMessageTemplates($firestore, $appId);
    
    echo "\n✅ Migración completada exitosamente!\n";
    
} catch (\Exception $e) {
    echo "\n❌ Error durante la migración: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}

function migrateUsers($firestore, $appId) {
    $usersRef = $firestore->database()->collection("artifacts/{$appId}/public/data/users");
    $users = $usersRef->documents();
    
    $count = 0;
    foreach ($users as $userDoc) {
        $data = $userDoc->data();
        
        // Crear contraseña temporal (se requerirá reset)
        $tempPassword = Hash::make(Str::random(16));
        
        User::updateOrCreate(
            ['firebase_id' => $userDoc->id()],
            [
                'email' => $data['email'] ?? '',
                'password' => $tempPassword,
                'full_name' => $data['fullName'] ?? '',
                'identification' => $data['identification'] ?? null,
                'role' => $data['role'] ?? 'client',
                'status' => $data['status'] ?? 'active',
                'phone' => $data['phone'] ?? null,
                'address' => $data['address'] ?? null,
                'is_profile_complete' => $data['isProfileComplete'] ?? false,
                'requires_password_change' => true, // Requerir cambio de contraseña
                'created_at' => isset($data['createdAt']) ? $data['createdAt']->toDateTime() : now(),
                'updated_at' => isset($data['updatedAt']) ? $data['updatedAt']->toDateTime() : now(),
            ]
        );
        
        $count++;
    }
    
    echo "   ✅ {$count} usuarios migrados\n";
}

function migrateServices($firestore, $appId) {
    $servicesRef = $firestore->database()->collection("artifacts/{$appId}/public/data/services");
    $services = $servicesRef->documents();
    
    $count = 0;
    foreach ($services as $serviceDoc) {
        $data = $serviceDoc->data();
        
        // Buscar usuario por firebase_id
        $user = User::where('firebase_id', $data['userId'] ?? '')->first();
        if (!$user) {
            echo "   ⚠️  Usuario no encontrado para servicio {$serviceDoc->id()}\n";
            continue;
        }
        
        Service::updateOrCreate(
            ['firebase_id' => $serviceDoc->id()],
            [
                'user_id' => $user->id,
                'service_number' => $data['serviceNumber'] ?? '',
                'service_name' => $data['serviceName'] ?? '',
                'service_type' => $data['serviceType'] ?? '',
                'service_description' => $data['serviceDescription'] ?? null,
                'currency' => $data['currency'] ?? 'COP',
                'amount' => $data['amount'] ?? 0,
                'start_date' => isset($data['startDate']) ? $data['startDate']->toDate() : now(),
                'end_date' => isset($data['endDate']) ? $data['endDate']->toDate() : now(),
                'renewal_period' => $data['renewalPeriod'] ?? null,
                'status' => $data['status'] ?? 'activo',
                'auto_renew' => $data['autoRenew'] ?? false,
                'created_at' => isset($data['createdAt']) ? $data['createdAt']->toDateTime() : now(),
                'updated_at' => isset($data['updatedAt']) ? $data['updatedAt']->toDateTime() : now(),
            ]
        );
        
        $count++;
    }
    
    echo "   ✅ {$count} servicios migrados\n";
}

function migratePayments($firestore, $appId) {
    $paymentsRef = $firestore->database()->collection("artifacts/{$appId}/public/data/payments");
    $payments = $paymentsRef->documents();
    
    $count = 0;
    foreach ($payments as $paymentDoc) {
        $data = $paymentDoc->data();
        
        // Buscar usuario y servicio
        $user = User::where('firebase_id', $data['userId'] ?? '')->first();
        $service = Service::where('firebase_id', $data['serviceId'] ?? '')->first();
        
        if (!$user || !$service) {
            echo "   ⚠️  Usuario o servicio no encontrado para pago {$paymentDoc->id()}\n";
            continue;
        }
        
        Payment::updateOrCreate(
            ['firebase_id' => $paymentDoc->id()],
            [
                'user_id' => $user->id,
                'service_id' => $service->id,
                'payment_number' => $data['paymentNumber'] ?? '',
                'amount' => $data['amount'] ?? 0,
                'original_amount' => $data['originalAmount'] ?? null,
                'currency' => $data['currency'] ?? 'COP',
                'gateway' => $data['gateway'] ?? null,
                'payment_method' => $data['paymentMethod'] ?? '',
                'status' => $data['status'] ?? 'Pendiente',
                'proof_url' => $data['proofUrl'] ?? null,
                'invoice_url' => $data['invoiceUrl'] ?? null,
                'invoice_number' => $data['invoiceNumber'] ?? null,
                'exchange_rate' => $data['exchangeRate'] ?? null,
                'exchange_rate_date' => isset($data['exchangeRateDate']) ? $data['exchangeRateDate']->toDate() : null,
                'payment_date' => isset($data['paymentDate']) ? $data['paymentDate']->toDateTime() : null,
                'client_email' => $data['clientEmail'] ?? null,
                'client_name' => $data['clientName'] ?? null,
                'created_at' => isset($data['createdAt']) ? $data['createdAt']->toDateTime() : now(),
                'updated_at' => isset($data['updatedAt']) ? $data['updatedAt']->toDateTime() : now(),
            ]
        );
        
        $count++;
    }
    
    echo "   ✅ {$count} pagos migrados\n";
}

function migrateTickets($firestore, $appId) {
    $ticketsRef = $firestore->database()->collection("artifacts/{$appId}/public/data/tickets");
    $tickets = $ticketsRef->documents();
    
    $count = 0;
    foreach ($tickets as $ticketDoc) {
        $data = $ticketDoc->data();
        
        $user = User::where('firebase_id', $data['userId'] ?? '')->first();
        if (!$user) {
            echo "   ⚠️  Usuario no encontrado para ticket {$ticketDoc->id()}\n";
            continue;
        }
        
        Ticket::updateOrCreate(
            ['firebase_id' => $ticketDoc->id()],
            [
                'user_id' => $user->id,
                'ticket_number' => $data['ticketNumber'] ?? '',
                'subject' => $data['subject'] ?? '',
                'status' => $data['status'] ?? 'abierto',
                'priority' => $data['priority'] ?? 'media',
                'closed_at' => isset($data['closedAt']) ? $data['closedAt']->toDateTime() : null,
                'created_at' => isset($data['createdAt']) ? $data['createdAt']->toDateTime() : now(),
                'updated_at' => isset($data['updatedAt']) ? $data['updatedAt']->toDateTime() : now(),
            ]
        );
        
        $count++;
    }
    
    echo "   ✅ {$count} tickets migrados\n";
}

function migrateTicketMessages($firestore, $appId) {
    // Implementar según estructura de Firebase
    echo "   ⚠️  Implementar según estructura de mensajes en Firebase\n";
}

function migrateMessageHistory($firestore, $appId) {
    $messagesRef = $firestore->database()->collection("artifacts/{$appId}/public/data/messageHistory");
    $messages = $messagesRef->documents();
    
    $count = 0;
    foreach ($messages as $messageDoc) {
        $data = $messageDoc->data();
        
        MessageHistory::updateOrCreate(
            ['firebase_id' => $messageDoc->id()],
            [
                'to' => $data['to'] ?? '',
                'to_name' => $data['toName'] ?? null,
                'subject' => $data['subject'] ?? '',
                'body' => $data['body'] ?? '',
                'type' => $data['type'] ?? null,
                'recipient_type' => $data['recipientType'] ?? null,
                'status' => $data['status'] ?? 'Simulado',
                'module' => $data['module'] ?? null,
                'event' => $data['event'] ?? null,
                'metadata' => isset($data['metadata']) ? json_encode($data['metadata']) : null,
                'sent_at' => isset($data['sentAt']) ? $data['sentAt']->toDateTime() : null,
                'error_message' => $data['errorMessage'] ?? null,
                'created_at' => isset($data['createdAt']) ? $data['createdAt']->toDateTime() : now(),
                'updated_at' => isset($data['updatedAt']) ? $data['updatedAt']->toDateTime() : now(),
            ]
        );
        
        $count++;
    }
    
    echo "   ✅ {$count} mensajes migrados\n";
}

function migrateEmailConfig($firestore, $appId) {
    $configRef = $firestore->database()->document("artifacts/{$appId}/public/data/settings/email_config");
    $config = $configRef->snapshot();
    
    if ($config->exists()) {
        $data = $config->data();
        
        EmailConfig::updateOrCreate(
            ['id' => 1],
            [
                'smtp_host' => $data['smtpHost'] ?? '',
                'smtp_port' => $data['smtpPort'] ?? 587,
                'smtp_secure' => $data['smtpSecure'] ?? false,
                'smtp_user' => $data['smtpUser'] ?? '',
                'smtp_password' => $data['smtpPassword'] ?? '',
                'from_email' => $data['fromEmail'] ?? '',
                'from_name' => $data['fromName'] ?? '',
                'enabled' => $data['enabled'] ?? false,
            ]
        );
        
        echo "   ✅ Configuración de email migrada\n";
    } else {
        echo "   ⚠️  No se encontró configuración de email\n";
    }
}

function migrateNotificationSettings($firestore, $appId) {
    // Implementar según estructura de Firebase
    echo "   ⚠️  Implementar según estructura de notificaciones en Firebase\n";
}

function migrateCompanySettings($firestore, $appId) {
    $settingsRef = $firestore->database()->document("artifacts/{$appId}/public/data/settings/company_info");
    $settings = $settingsRef->snapshot();
    
    if ($settings->exists()) {
        $data = $settings->data();
        
        CompanySetting::updateOrCreate(
            ['id' => 1],
            [
                'company_name' => $data['companyName'] ?? 'Gestor de Cobros',
                'identification' => $data['identification'] ?? null,
                'address' => $data['address'] ?? null,
                'phone' => $data['phone'] ?? null,
                'email' => $data['email'] ?? null,
                'website' => $data['website'] ?? null,
                'logo_url' => $data['logoUrl'] ?? null,
                'inactivity_timeout_minutes' => $data['inactivityTimeoutMinutes'] ?? 10,
            ]
        );
        
        echo "   ✅ Configuración de empresa migrada\n";
    } else {
        echo "   ⚠️  No se encontró configuración de empresa\n";
    }
}

function migrateMessageTemplates($firestore, $appId) {
    $templatesRef = $firestore->database()->collection("artifacts/{$appId}/public/data/messageTemplates");
    $templates = $templatesRef->documents();
    
    $count = 0;
    foreach ($templates as $templateDoc) {
        $data = $templateDoc->data();
        
        MessageTemplate::updateOrCreate(
            ['firebase_id' => $templateDoc->id()],
            [
                'name' => $data['name'] ?? '',
                'type' => $data['type'] ?? '',
                'subject' => $data['subject'] ?? '',
                'body' => $data['body'] ?? '',
                'variables' => isset($data['variables']) ? json_encode($data['variables']) : null,
            ]
        );
        
        $count++;
    }
    
    echo "   ✅ {$count} plantillas migradas\n";
}

