<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_settings', function (Blueprint $table) {
            $table->id();
            $table->enum('role', ['admin', 'client']);
            $table->string('module'); // payments, services, users, tickets, renewals
            $table->string('event'); // approval, rejection, reminder, etc.
            $table->boolean('enabled')->default(true);
            $table->timestamps();
            
            $table->unique(['role', 'module', 'event']);
            $table->index('role');
            $table->index('module');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_settings');
    }
};

