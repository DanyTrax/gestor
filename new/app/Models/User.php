<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'email',
        'password',
        'full_name',
        'identification',
        'role',
        'status',
        'phone',
        'address',
        'is_profile_complete',
        'requires_password_change',
        'firebase_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_profile_complete' => 'boolean',
        'requires_password_change' => 'boolean',
        'password' => 'hashed',
    ];

    // Relaciones
    public function services()
    {
        return $this->hasMany(Service::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeAdmins($query)
    {
        return $query->whereIn('role', ['superadmin', 'admin']);
    }

    public function scopeClients($query)
    {
        return $query->where('role', 'client');
    }

    // Helpers
    public function isAdmin(): bool
    {
        return in_array($this->role, ['superadmin', 'admin']);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'superadmin';
    }
}

