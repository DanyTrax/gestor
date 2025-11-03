<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MessageHistory extends Model
{
    use HasFactory;

    protected $table = 'message_history';

    protected $fillable = [
        'to',
        'to_name',
        'subject',
        'body',
        'type',
        'recipient_type',
        'status',
        'module',
        'event',
        'metadata',
        'sent_at',
        'error_message',
        'firebase_id',
    ];

    protected $casts = [
        'metadata' => 'array',
        'sent_at' => 'datetime',
    ];

    // Scopes
    public function scopeSent($query)
    {
        return $query->where('status', 'Enviado');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'Fallido');
    }

    public function scopeByModule($query, string $module)
    {
        return $query->where('module', $module);
    }

    // Helpers
    public function isSent(): bool
    {
        return $this->status === 'Enviado';
    }

    public function markAsSent(): void
    {
        $this->update([
            'status' => 'Enviado',
            'sent_at' => now(),
        ]);
    }

    public function markAsFailed(string $error): void
    {
        $this->update([
            'status' => 'Fallido',
            'error_message' => $error,
        ]);
    }
}

