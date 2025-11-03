<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('service_id')->constrained()->onDelete('cascade');
            $table->string('payment_number')->unique();
            $table->decimal('amount', 15, 2);
            $table->decimal('original_amount', 15, 2)->nullable(); // Para conversión USD
            $table->enum('currency', ['COP', 'USD'])->default('COP');
            $table->string('gateway')->nullable();
            $table->string('payment_method');
            $table->enum('status', ['Pendiente', 'Procesando', 'Completado', 'Fallido', 'Cancelado'])->default('Pendiente');
            $table->string('proof_url')->nullable();
            $table->string('invoice_url')->nullable();
            $table->string('invoice_number')->nullable();
            $table->decimal('exchange_rate', 10, 4)->nullable(); // Para conversión USD → COP
            $table->date('exchange_rate_date')->nullable();
            $table->dateTime('payment_date')->nullable();
            $table->string('client_email')->nullable();
            $table->string('client_name')->nullable();
            $table->string('firebase_id')->nullable(); // Para migración
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('service_id');
            $table->index('payment_number');
            $table->index('status');
            $table->index('payment_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};

