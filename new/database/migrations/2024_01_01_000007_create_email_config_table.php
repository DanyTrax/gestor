<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_config', function (Blueprint $table) {
            $table->id();
            $table->string('smtp_host');
            $table->integer('smtp_port')->default(587);
            $table->boolean('smtp_secure')->default(false);
            $table->string('smtp_user');
            $table->text('smtp_password'); // Encriptado
            $table->string('from_email');
            $table->string('from_name');
            $table->boolean('enabled')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_config');
    }
};

