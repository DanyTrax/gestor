<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'ticket_number',
        'subject',
        'status',
        'priority',
        'closed_at',
        'firebase_id',
    ];

    protected $casts = [
        'closed_at' => 'datetime',
    ];

    // Relaciones
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function messages()
    {
        return $this->hasMany(TicketMessage::class);
    }

    // Scopes
    public function scopeOpen($query)
    {
        return $query->where('status', 'abierto');
    }

    public function scopeInProcess($query)
    {
        return $query->where('status', 'en_proceso');
    }

    public function scopeResolved($query)
    {
        return $query->where('status', 'resuelto');
    }

    public function scopeClosed($query)
    {
        return $query->where('status', 'cerrado');
    }

    public function scopeHighPriority($query)
    {
        return $query->whereIn('priority', ['alta', 'urgente']);
    }

    // Helpers
    public function isOpen(): bool
    {
        return $this->status === 'abierto';
    }

    public function isClosed(): bool
    {
        return in_array($this->status, ['resuelto', 'cerrado']);
    }

    public function close(): void
    {
        $this->update([
            'status' => 'cerrado',
            'closed_at' => now(),
        ]);
    }
}

