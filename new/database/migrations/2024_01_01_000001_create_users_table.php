<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('full_name');
            $table->string('identification')->nullable();
            $table->enum('role', ['superadmin', 'admin', 'client'])->default('client');
            $table->enum('status', ['active', 'inactive', 'pending'])->default('pending');
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->boolean('is_profile_complete')->default(false);
            $table->boolean('requires_password_change')->default(false);
            $table->string('firebase_id')->nullable()->unique(); // Para migración
            $table->rememberToken();
            $table->timestamps();
            
            $table->index('email');
            $table->index('role');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};

