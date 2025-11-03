<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('message_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type'); // approval, rejection, reminder, etc.
            $table->string('subject');
            $table->text('body');
            $table->json('variables')->nullable(); // Variables disponibles
            $table->string('firebase_id')->nullable(); // Para migración
            $table->timestamps();
            
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_templates');
    }
};

