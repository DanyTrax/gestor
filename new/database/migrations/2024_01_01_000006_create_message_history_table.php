<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('message_history', function (Blueprint $table) {
            $table->id();
            $table->string('to');
            $table->string('to_name')->nullable();
            $table->string('subject');
            $table->text('body');
            $table->string('type')->nullable(); // Aprobación, Rechazo, etc.
            $table->enum('recipient_type', ['admin', 'client'])->nullable();
            $table->enum('status', ['Enviado', 'Fallido', 'Cancelado', 'Simulado'])->default('Simulado');
            $table->string('module')->nullable(); // payments, services, tickets
            $table->string('event')->nullable(); // approval, rejection, etc.
            $table->json('metadata')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->text('error_message')->nullable();
            $table->string('firebase_id')->nullable(); // Para migración
            $table->timestamps();
            
            $table->index('to');
            $table->index('status');
            $table->index('module');
            $table->index('sent_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_history');
    }
};

