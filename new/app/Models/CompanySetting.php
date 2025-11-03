<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanySetting extends Model
{
    use HasFactory;

    protected $table = 'company_settings';

    protected $fillable = [
        'company_name',
        'identification',
        'address',
        'phone',
        'email',
        'website',
        'logo_url',
        'inactivity_timeout_minutes',
    ];

    // Singleton pattern
    public static function getSettings()
    {
        return static::first() ?? static::create([
            'company_name' => 'Gestor de Cobros',
            'inactivity_timeout_minutes' => 10,
        ]);
    }
}

