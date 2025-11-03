<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'service_number',
        'service_name',
        'service_type',
        'service_description',
        'currency',
        'amount',
        'start_date',
        'end_date',
        'renewal_period',
        'status',
        'auto_renew',
        'firebase_id',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'amount' => 'decimal:2',
        'auto_renew' => 'boolean',
    ];

    // Relaciones
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'activo');
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'vencido')
            ->orWhere('end_date', '<', now());
    }

    public function scopeExpiringSoon($query, $days = 30)
    {
        return $query->where('status', 'activo')
            ->whereBetween('end_date', [now(), now()->addDays($days)]);
    }

    // Helpers
    public function isExpired(): bool
    {
        return $this->end_date < now() || $this->status === 'vencido';
    }

    public function daysUntilExpiration(): int
    {
        return now()->diffInDays($this->end_date, false);
    }

    public function hasPendingPayment(): bool
    {
        return $this->payments()
            ->whereIn('status', ['Pendiente', 'Procesando'])
            ->exists();
    }
}

