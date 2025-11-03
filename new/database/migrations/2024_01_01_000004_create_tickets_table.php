<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('ticket_number')->unique();
            $table->string('subject');
            $table->enum('status', ['abierto', 'en_proceso', 'resuelto', 'cerrado'])->default('abierto');
            $table->enum('priority', ['baja', 'media', 'alta', 'urgente'])->default('media');
            $table->timestamp('closed_at')->nullable();
            $table->string('firebase_id')->nullable(); // Para migración
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('ticket_number');
            $table->index('status');
            $table->index('priority');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};

