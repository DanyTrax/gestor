<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'service_id',
        'payment_number',
        'amount',
        'original_amount',
        'currency',
        'gateway',
        'payment_method',
        'status',
        'proof_url',
        'invoice_url',
        'invoice_number',
        'exchange_rate',
        'exchange_rate_date',
        'payment_date',
        'client_email',
        'client_name',
        'firebase_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'original_amount' => 'decimal:2',
        'exchange_rate' => 'decimal:4',
        'exchange_rate_date' => 'date',
        'payment_date' => 'datetime',
    ];

    // Relaciones
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'Pendiente');
    }

    public function scopeProcessing($query)
    {
        return $query->where('status', 'Procesando');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'Completado');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'Fallido');
    }

    // Helpers
    public function isPending(): bool
    {
        return $this->status === 'Pendiente';
    }

    public function isProcessing(): bool
    {
        return $this->status === 'Procesando';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'Completado';
    }

    public function getFormattedAmountAttribute(): string
    {
        return number_format($this->amount, 2, ',', '.') . ' ' . $this->currency;
    }
}

