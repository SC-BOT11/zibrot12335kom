<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'event_id',
        'payment_id',
        'external_id',
        'amount',
        'currency',
        'status',
        'payment_method',
        'payment_channel',
        'payment_details',
        'expires_at',
        'paid_at',
        'failure_reason',
        'xendit_response',
        // Ticket-specific fields
        'ticket_type',
        'quantity',
        'price_per_ticket',
        'ticket_number',
        'is_early_bird',
        'discount_amount',
        'discount_code',
        'attendee_info',
        'requires_approval',
        'approved_at',
        'approved_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_details' => 'array',
        'xendit_response' => 'array',
        'expires_at' => 'datetime',
        'paid_at' => 'datetime',
        'price_per_ticket' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'attendee_info' => 'array',
        'is_early_bird' => 'boolean',
        'requires_approval' => 'boolean',
        'approved_at' => 'datetime',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeExpired($query)
    {
        return $query->where('status', 'expired');
    }

    // Helper methods
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    public function isExpired(): bool
    {
        return $this->status === 'expired';
    }

    public function isExpiredTime(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function getFormattedAmountAttribute(): string
    {
        return 'Rp ' . number_format($this->amount, 0, ',', '.');
    }

    // Ticket-specific methods
    public function generateTicketNumber(): string
    {
        $eventId = str_pad($this->event_id, 3, '0', STR_PAD_LEFT);
        $paymentId = str_pad($this->id, 4, '0', STR_PAD_LEFT);
        $random = str_pad(random_int(0, 999), 3, '0', STR_PAD_LEFT);
        
        return 'TKT' . $eventId . $paymentId . $random;
    }

    public function calculateTotalAmount(): float
    {
        $subtotal = $this->price_per_ticket * $this->quantity;
        return $subtotal - $this->discount_amount;
    }

    public function isEarlyBirdEligible(): bool
    {
        if (!$this->event->early_bird_enabled) {
            return false;
        }

        return now()->lte($this->event->early_bird_deadline);
    }

    public function getTicketTypePrice(): float
    {
        $ticketTypes = $this->event->ticket_types ?? [];
        
        if (isset($ticketTypes[$this->ticket_type])) {
            return $ticketTypes[$this->ticket_type]['price'] ?? $this->event->ticket_price;
        }
        
        return $this->event->ticket_price;
    }

    public function isApproved(): bool
    {
        return $this->approved_at !== null;
    }

    public function isPendingApproval(): bool
    {
        return $this->requires_approval && $this->approved_at === null && $this->status === 'paid';
    }

    public function approve(User $approver): bool
    {
        if (!$this->isPendingApproval()) {
            return false;
        }

        $this->update([
            'approved_at' => now(),
            'approved_by' => $approver->id,
        ]);

        return true;
    }
}
