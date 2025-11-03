<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class EmailConfig extends Model
{
    use HasFactory;

    protected $table = 'email_config';

    protected $fillable = [
        'smtp_host',
        'smtp_port',
        'smtp_secure',
        'smtp_user',
        'smtp_password',
        'from_email',
        'from_name',
        'enabled',
    ];

    protected $casts = [
        'smtp_secure' => 'boolean',
        'enabled' => 'boolean',
    ];

    // Encriptar/desencriptar contraseña
    public function setSmtpPasswordAttribute($value)
    {
        $this->attributes['smtp_password'] = Crypt::encryptString($value);
    }

    public function getSmtpPasswordAttribute($value)
    {
        try {
            return Crypt::decryptString($value);
        } catch (\Exception $e) {
            return $value;
        }
    }

    // Singleton pattern
    public static function getConfig()
    {
        return static::first() ?? new static();
    }
}

