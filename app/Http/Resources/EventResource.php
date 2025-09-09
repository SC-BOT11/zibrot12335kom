<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'date' => $this->date,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'location' => $this->location,
            'max_participants' => $this->max_participants,
            'status' => $this->status,
            'flyer_path' => $this->flyer_path,
            'image' => $this->flyer_path ? asset('storage/' . $this->flyer_path) : null,
            'certificate_template_path' => $this->certificate_template_path,
            'registration_deadline' => $this->registration_deadline,
            'is_active' => (bool) $this->is_active,
            'created_by' => $this->user_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            // Computed attributes
            'is_registration_open' => $this->is_registration_open,
            'is_past_event' => $this->is_past_event,
            'full_date_time' => $this->full_date_time,
            'current_participants_count' => $this->current_participants_count,
            'can_admin_create' => $this->can_admin_create,
            'is_event_day' => $this->is_event_day,
            'is_attendance_open' => $this->is_attendance_open,
        ];
    }
}
