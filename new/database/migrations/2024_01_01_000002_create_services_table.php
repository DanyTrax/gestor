<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('service_number')->unique();
            $table->string('service_name');
            $table->string('service_type');
            $table->text('service_description')->nullable();
            $table->enum('currency', ['COP', 'USD'])->default('COP');
            $table->decimal('amount', 15, 2);
            $table->date('start_date');
            $table->date('end_date');
            $table->string('renewal_period')->nullable(); // Mensual, Anual, etc.
            $table->enum('status', ['activo', 'vencido', 'suspendido'])->default('activo');
            $table->boolean('auto_renew')->default(false);
            $table->string('firebase_id')->nullable(); // Para migración
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('service_number');
            $table->index('status');
            $table->index('end_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};

