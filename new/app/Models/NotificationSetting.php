<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'role',
        'module',
        'event',
        'enabled',
    ];

    protected $casts = [
        'enabled' => 'boolean',
    ];

    // Scopes
    public function scopeForRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    public function scopeForModule($query, string $module)
    {
        return $query->where('module', $module);
    }

    public function scopeEnabled($query)
    {
        return $query->where('enabled', true);
    }

    // Helpers
    public static function isEnabled(string $role, string $module, string $event): bool
    {
        return static::where('role', $role)
            ->where('module', $module)
            ->where('event', $event)
            ->where('enabled', true)
            ->exists();
    }
}

