<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

class Event extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'date',
        'start_time',
        'end_time',
        'location',
        'flyer_path',
        'certificate_template_path',
        'max_participants',
        'is_active',
        'registration_deadline',
        // Certificate fields
        'has_certificate',
        'certificate_required',
        // Ticket pricing fields
        'is_paid_event',
        'ticket_price',
        'ticket_types',
        'early_bird_enabled',
        'early_bird_discount',
        'early_bird_deadline',
        'max_tickets_per_user',
        'requires_approval',
        'payment_instructions',
    ];

    protected $casts = [
        'date' => 'date',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'registration_deadline' => 'datetime',
        'is_active' => 'boolean',
        'max_participants' => 'integer',
        // Certificate casts
        'has_certificate' => 'boolean',
        'certificate_required' => 'boolean',
        // Ticket pricing casts
        'is_paid_event' => 'boolean',
        'ticket_price' => 'decimal:2',
        'ticket_types' => 'array',
        'early_bird_enabled' => 'boolean',
        'early_bird_discount' => 'decimal:2',
        'early_bird_deadline' => 'datetime',
        'max_tickets_per_user' => 'integer',
        'requires_approval' => 'boolean',
    ];

    protected $appends = [
        'is_registration_open',
        'is_past_event',
        'full_date_time',
        'current_participants_count',
        'can_admin_create',
        'is_event_day',
        'is_attendance_open',
    ];

    // Relationships
    public function participants()
    {
        return $this->belongsToMany(User::class, 'event_participant', 'event_id', 'participant_id')
            ->using(EventParticipant::class)
            ->withPivot(['id', 'registration_number', 'attendance_token', 'attendance_verified_at', 'has_received_certificate'])
            ->withTimestamps();
    }

    public function eventParticipants()
    {
        return $this->hasMany(EventParticipant::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function certificates()
    {
        return $this->hasMany(Certificate::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    // Scopes
    public function scopeUpcoming($query)
    {
        return $query->where('date', '>=', now()->toDateString())
            ->where('is_active', true)
            ->orderBy('date')
            ->orderBy('start_time');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%")
              ->orWhere('location', 'like', "%{$search}%");
        });
    }

    // Accessors
    public function getIsRegistrationOpenAttribute()
    {
        $eventDateTime = Carbon::parse($this->date->format('Y-m-d') . ' ' . $this->start_time->format('H:i:s'));
        return $eventDateTime->isFuture() && now()->lte($this->registration_deadline);
    }

    public function getIsPastEventAttribute()
    {
        $eventDateTime = Carbon::parse($this->date->format('Y-m-d') . ' ' . $this->end_time->format('H:i:s'));
        return $eventDateTime->isPast();
    }

    public function getFullDateTimeAttribute()
    {
        return $this->date->format('Y-m-d') . ' ' . $this->start_time->format('H:i:s');
    }

    public function getCurrentParticipantsCountAttribute()
    {
        return $this->eventParticipants()->count();
    }

    public function getCanAdminCreateAttribute()
    {
        $eventDate = Carbon::parse($this->date);
        return now()->diffInDays($eventDate) >= 3;
    }

    public function getIsEventDayAttribute()
    {
        return $this->date->isToday();
    }

    public function getIsAttendanceOpenAttribute()
    {
        if (!$this->is_event_day) {
            return false;
        }

        $eventStartTime = Carbon::parse($this->date->format('Y-m-d') . ' ' . $this->start_time->format('H:i:s'));
        return now()->gte($eventStartTime);
    }

    // Methods
    public function isRegistrationOpen()
    {
        return $this->is_registration_open;
    }

    public function canAdminCreate()
    {
        return $this->can_admin_create;
    }

    public function isAttendanceOpen()
    {
        return $this->is_attendance_open;
    }

    public function hasReachedMaxParticipants()
    {
        if (!$this->max_participants) {
            return false;
        }
        return $this->current_participants_count >= $this->max_participants;
    }

    public function canUserRegister($userId)
    {
        // Check if user is already registered
        $isRegistered = $this->eventParticipants()->where('participant_id', $userId)->exists();
        
        return !$isRegistered && 
               $this->isRegistrationOpen() && 
               !$this->hasReachedMaxParticipants();
    }

    public function generateRegistrationNumber()
    {
        $prefix = 'EVT' . $this->id;
        $count = $this->eventParticipants()->count() + 1;
        return $prefix . str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    public function generateAttendanceToken()
    {
        return str_pad(random_int(0, 9999999999), 10, '0', STR_PAD_LEFT);
    }

    // Ticket-related methods
    public function isPaidEvent(): bool
    {
        return $this->is_paid_event;
    }

    public function getTicketPriceForType(string $ticketType = 'general'): float
    {
        if (!$this->isPaidEvent()) {
            return 0;
        }

        $ticketTypes = $this->ticket_types ?? [];
        
        if (isset($ticketTypes[$ticketType])) {
            return $ticketTypes[$ticketType]['price'] ?? $this->ticket_price;
        }
        
        return $this->ticket_price;
    }

    public function isEarlyBirdActive(): bool
    {
        if (!$this->early_bird_enabled) {
            return false;
        }

        return now()->lte($this->early_bird_deadline);
    }

    public function calculateEarlyBirdPrice(float $basePrice): float
    {
        if (!$this->isEarlyBirdActive()) {
            return $basePrice;
        }

        $discountAmount = $basePrice * ($this->early_bird_discount / 100);
        return $basePrice - $discountAmount;
    }

    public function getAvailableTicketTypes(): array
    {
        if (!$this->isPaidEvent()) {
            return [];
        }

        $ticketTypes = $this->ticket_types ?? [];
        
        if (empty($ticketTypes)) {
            return [
                'general' => [
                    'name' => 'General',
                    'price' => $this->ticket_price,
                    'description' => 'Tiket masuk umum'
                ]
            ];
        }

        return $ticketTypes;
    }

    public function getTotalTicketsSold(): int
    {
        return $this->payments()
            ->where('status', 'paid')
            ->sum('quantity');
    }

    public function getTotalRevenue(): float
    {
        return $this->payments()
            ->where('status', 'paid')
            ->sum('amount');
    }

    public function canUserBuyTickets(int $userId, int $quantity = 1): bool
    {
        // Check if user has already bought tickets
        $userTickets = $this->payments()
            ->where('user_id', $userId)
            ->where('status', 'paid')
            ->sum('quantity');

        return ($userTickets + $quantity) <= $this->max_tickets_per_user;
    }
}
