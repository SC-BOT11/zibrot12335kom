<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Attendance;
use App\Models\Certificate;
use App\Http\Resources\EventResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\EventParticipantsExport;
use App\Exports\DashboardExport;

class EventController extends Controller
{
    /**
     * Display a listing of events (public)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Event::with(['creator', 'eventParticipants'])
                ->active()
                ->withCount('eventParticipants as current_participants');

            // Search functionality
            if ($request->has('search') && !empty($request->search)) {
                $query->where(function($q) use ($request) {
                    $q->where('title', 'like', '%' . $request->search . '%')
                      ->orWhere('description', 'like', '%' . $request->search . '%')
                      ->orWhere('location', 'like', '%' . $request->search . '%');
                });
            }

            // Filter by status
            if ($request->has('status') && $request->status !== 'all') {
                switch ($request->status) {
                    case 'upcoming':
                        $query->where('date', '>', now()->toDateString());
                        break;
                    case 'ongoing':
                        $query->where('date', '=', now()->toDateString());
                        break;
                    case 'completed':
                        $query->where('date', '<', now()->toDateString());
                        break;
                }
            }

            // Sorting functionality
            if ($request->has('sort')) {
                switch ($request->sort) {
                    case 'date_asc':
                        $query->orderBy('date', 'asc')->orderBy('start_time', 'asc');
                        break;
                    case 'date_desc':
                        $query->orderBy('date', 'desc')->orderBy('start_time', 'desc');
                        break;
                    case 'title_asc':
                        $query->orderBy('title', 'asc');
                        break;
                    case 'title_desc':
                        $query->orderBy('title', 'desc');
                        break;
                    case 'participants_desc':
                        $query->orderBy('current_participants', 'desc');
                        break;
                    case 'participants_asc':
                        $query->orderBy('current_participants', 'asc');
                        break;
                    default:
                        // Default: closest upcoming first
                        $query->orderBy('date', 'asc')->orderBy('start_time', 'asc');
                        break;
                }
            } else {
                // Default: closest upcoming first
                $query->orderBy('date', 'asc')->orderBy('start_time', 'asc');
            }

            $events = $query->paginate($request->get('per_page', 12));

            return response()->json([
                'status' => 'success',
                'data' => EventResource::collection($events),
                'pagination' => [
                    'current_page' => $events->currentPage(),
                    'last_page' => $events->lastPage(),
                    'per_page' => $events->perPage(),
                    'total' => $events->total(),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching events: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch events',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Display the specified event (public)
     */
    public function show($id): JsonResponse
    {
        try {
            $event = Event::with(['creator', 'eventParticipants.participant'])
                ->withCount('eventParticipants as current_participants')
                ->findOrFail($id);

            return response()->json([
                'status' => 'success',
                'data' => new EventResource($event)
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Event not found'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error fetching event: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch event',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Store a newly created event (admin only)
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'date' => 'required|date|after_or_equal:today',
                'start_time' => 'required|date_format:H:i',
                'end_time' => 'required|date_format:H:i|after:start_time',
                'location' => 'required|string|max:255',
                'max_participants' => 'nullable|integer|min:1',
                'registration_deadline' => 'required|date|before_or_equal:date',
                'flyer' => 'nullable|file|mimes:jpeg,png,jpg|max:2048',
                'certificate_template' => 'nullable|file|mimes:pdf,jpeg,png,jpg|max:5120',
            ]);

            // Check if event is being created at least 3 days before the event
            $eventDate = Carbon::parse($validated['date']);
            if (now()->diffInDays($eventDate) < 3) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Event harus dibuat minimal H-3 dari tanggal pelaksanaan.'
                ], 422);
            }

            DB::beginTransaction();

            $eventData = [
                'user_id' => auth()->id(),
                'title' => $validated['title'],
                'description' => $validated['description'],
                'date' => $validated['date'],
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
                'location' => $validated['location'],
                'max_participants' => $validated['max_participants'] ?? null,
                'registration_deadline' => $validated['registration_deadline'],
                'is_active' => true,
            ];

            // Handle file uploads
            if ($request->hasFile('flyer')) {
                $path = $request->file('flyer')->store('events/flyers', 'public');
                $eventData['flyer_path'] = $path;
            }

            if ($request->hasFile('certificate_template')) {
                $path = $request->file('certificate_template')->store('events/certificates/templates', 'public');
                $eventData['certificate_template_path'] = $path;
            }

            $event = Event::create($eventData);
            
            DB::commit();

            Log::info('Event created successfully', [
                'event_id' => $event->id,
                'title' => $event->title,
                'created_by' => auth()->id()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Event berhasil dibuat',
                'data' => new EventResource($event)
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak valid',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating event: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal membuat event',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Update the specified event (admin only)
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            DB::beginTransaction();
            
            $event = Event::findOrFail($id);
            
            $validated = $request->validate([
                'title' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'date' => 'sometimes|required|date|after_or_equal:today',
                'start_time' => 'sometimes|required|date_format:H:i',
                'end_time' => 'sometimes|required|date_format:H:i|after:start_time',
                'location' => 'sometimes|required|string|max:255',
                'max_participants' => 'nullable|integer|min:1',
                'registration_deadline' => 'sometimes|required|date|before_or_equal:date',
                'is_active' => 'sometimes|boolean',
                'flyer' => 'nullable|file|mimes:jpeg,png,jpg|max:2048',
                'certificate_template' => 'nullable|file|mimes:pdf,jpeg,png,jpg|max:5120',
            ]);
            
            // Handle file uploads
            if ($request->hasFile('flyer')) {
                // Delete old flyer if exists
                if ($event->flyer_path) {
                    Storage::disk('public')->delete($event->flyer_path);
                }
                $path = $request->file('flyer')->store('events/flyers', 'public');
                $validated['flyer_path'] = $path;
            }

            if ($request->hasFile('certificate_template')) {
                // Delete old template if exists
                if ($event->certificate_template_path) {
                    Storage::disk('public')->delete($event->certificate_template_path);
                }
                $path = $request->file('certificate_template')->store('events/certificates/templates', 'public');
                $validated['certificate_template_path'] = $path;
            }
            
            $event->update($validated);
            
            DB::commit();
            
            Log::info('Event updated successfully', [
                'event_id' => $event->id,
                'title' => $event->title,
                'updated_by' => auth()->id()
            ]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Event berhasil diperbarui',
                'data' => new EventResource($event)
            ]);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Event tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating event: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui event',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Remove the specified event (admin only)
     */
    public function destroy($id): JsonResponse
    {
        try {
            $event = Event::findOrFail($id);
            
            // Check if event has participants
            if ($event->eventParticipants()->count() > 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tidak dapat menghapus event yang sudah memiliki peserta'
                ], 422);
            }

            $event->delete();
            
            Log::info('Event deleted successfully', [
                'event_id' => $id,
                'deleted_by' => auth()->id()
            ]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Event berhasil dihapus'
            ]);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Event tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error deleting event: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal menghapus event',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Register user for an event
     */
    public function register(Request $request, $id): JsonResponse
    {
        try {
            $event = Event::findOrFail($id);
            $userId = auth()->id();

            // Check if user can register
            if (!$event->canUserRegister($userId)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tidak dapat mendaftar untuk event ini'
                ], 422);
            }

            DB::beginTransaction();

            $eventParticipant = EventParticipant::create([
                'event_id' => $event->id,
                'participant_id' => $userId,
            ]);

            // Send attendance token via email
            try {
                $currentUser = auth()->user();
                // TODO: Send email with attendance token
                Log::info('Attendance token generated', [
                    'user_id' => $userId,
                    'event_id' => $event->id,
                    'token' => $eventParticipant->attendance_token
                ]);
            } catch (\Exception $e) {
                Log::warning('Failed to send attendance token email', [
                    'user_id' => $userId,
                    'event_id' => $event->id,
                    'error' => $e->getMessage()
                ]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Berhasil mendaftar untuk event',
                'data' => [
                    'registration_number' => $eventParticipant->registration_number,
                    'attendance_token' => $eventParticipant->attendance_token,
                    'event' => new EventResource($event)
                ]
            ], 201);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Event tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error registering for event: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mendaftar untuk event',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Mark attendance for an event
     */
    public function attendance(Request $request, $id): JsonResponse
    {
        try {
            $event = Event::findOrFail($id);
            $userId = auth()->id();

            // Check if attendance is open
            if (!$event->isAttendanceOpen()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Daftar hadir belum dibuka atau sudah ditutup'
                ], 422);
            }

            // Find event participant
            $eventParticipant = $event->eventParticipants()
                ->where('participant_id', $userId)
                ->first();

            if (!$eventParticipant) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Anda tidak terdaftar untuk event ini'
                ], 422);
            }

            // Check if already verified
            if ($eventParticipant->is_attendance_verified) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Kehadiran sudah diverifikasi'
                ], 422);
            }

            // Verify attendance token
            $token = $request->input('attendance_token');
            if (!$eventParticipant->verifyAttendance($token)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Token kehadiran tidak valid'
                ], 422);
            }

            // Create attendance record
            Attendance::create([
                'event_id' => $event->id,
                'participant_id' => $userId,
                'event_participant_id' => $eventParticipant->id,
                'time_in' => now(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Kehadiran berhasil diverifikasi',
                'data' => [
                    'attendance_verified_at' => $eventParticipant->attendance_verified_at,
                    'can_receive_certificate' => $eventParticipant->can_receive_certificate
                ]
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Event tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error marking attendance: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memverifikasi kehadiran',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get user's registered events with attendance and certificate status
     */
    public function myEvents(): JsonResponse
    {
        try {
            $userId = auth()->id();
            
            $eventParticipants = EventParticipant::with([
                'event',
                'attendance',
                'certificate'
            ])
            ->where('participant_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate(12);

            $events = $eventParticipants->map(function ($participant) {
                $event = $participant->event;
                $now = now();
                $eventDate = \Carbon\Carbon::parse($event->date . ' ' . $event->start_time);
                
                // Determine event status
                $status = 'upcoming';
                if ($eventDate->isPast()) {
                    $status = 'completed';
                } elseif ($eventDate->isToday()) {
                    $status = 'ongoing';
                }

                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'description' => $event->description,
                    'date' => $event->date,
                    'start_time' => $event->start_time,
                    'end_time' => $event->end_time,
                    'location' => $event->location,
                    'image' => $event->image,
                    'max_participants' => $event->max_participants,
                    'current_participants' => $event->eventParticipants()->count(),
                    'status' => $status,
                    'registration_number' => $participant->registration_number,
                    'attendance_token' => $participant->attendance_token,
                    'attendance_status' => $participant->attendance_status,
                    'is_attendance_verified' => $participant->is_attendance_verified,
                    'attendance_verified_at' => $participant->attendance_verified_at,
                    'has_certificate' => $participant->certificate ? true : false,
                    'certificate_number' => $participant->certificate ? $participant->certificate->certificate_number : null,
                    'certificate_issued_at' => $participant->certificate ? $participant->certificate->created_at : null,
                    'can_attend' => $participant->canAttend(),
                    'registered_at' => $participant->created_at,
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => $events,
                'pagination' => [
                    'current_page' => $eventParticipants->currentPage(),
                    'last_page' => $eventParticipants->lastPage(),
                    'per_page' => $eventParticipants->perPage(),
                    'total' => $eventParticipants->total(),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching user events: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data event',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get user's certificates with detailed information
     */
    public function myCertificates(): JsonResponse
    {
        try {
            $userId = auth()->id();
            
            $certificates = Certificate::with([
                'eventParticipant.event',
                'eventParticipant.participant',
                'eventParticipant.attendance'
            ])
            ->whereHas('eventParticipant', function ($query) use ($userId) {
                $query->where('participant_id', $userId);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(12);

            $certificateData = $certificates->map(function ($certificate) {
                $eventParticipant = $certificate->eventParticipant;
                $event = $eventParticipant->event;
                
                return [
                    'id' => $certificate->id,
                    'certificate_number' => $certificate->certificate_number,
                    'issued_at' => $certificate->created_at,
                    'event' => [
                        'id' => $event->id,
                        'title' => $event->title,
                        'date' => $event->date,
                        'start_time' => $event->start_time,
                        'end_time' => $event->end_time,
                        'location' => $event->location,
                        'image' => $event->image,
                    ],
                    'participant' => [
                        'registration_number' => $eventParticipant->registration_number,
                        'attendance_verified_at' => $eventParticipant->attendance_verified_at,
                        'attendance_status' => $eventParticipant->attendance_status,
                    ],
                    'attendance' => $eventParticipant->attendance ? [
                        'time_in' => $eventParticipant->attendance->time_in,
                        'time_out' => $eventParticipant->attendance->time_out,
                    ] : null,
                    'download_url' => route('certificates.download', $certificate->id),
                    'verify_url' => route('certificates.verify', $certificate->certificate_number),
                ];
            });

            return response()->json([
                'status' => 'success',
                'data' => $certificateData,
                'pagination' => [
                    'current_page' => $certificates->currentPage(),
                    'last_page' => $certificates->lastPage(),
                    'per_page' => $certificates->perPage(),
                    'total' => $certificates->total(),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching user certificates: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data sertifikat',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get dashboard statistics (admin only)
     */
    public function statistics(): JsonResponse
    {
        try {
            $totalEvents = Event::count();
            $totalParticipants = EventParticipant::count();
            $totalCertificates = Certificate::count();
            $upcomingEvents = Event::where('date', '>=', now()->toDateString())
                ->where('date', '<=', now()->addDays(30)->toDateString())
                ->count();
            $recentActivities = DB::table('activity_log')
                ->join('users', 'activity_log.causer_id', '=', 'users.id')
                ->select('activity_log.*', 'users.name as user_name')
                ->orderBy('activity_log.created_at', 'desc')
                ->take(10)
                ->get();
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'total_events' => $totalEvents,
                    'total_participants' => $totalParticipants,
                    'total_certificates' => $totalCertificates,
                    'upcoming_events' => $upcomingEvents,
                    'recent_activities' => $recentActivities
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving statistics: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve statistics',
                'error' => config('app.debug') ? $e->getMessage() : 'Please try again later.'
            ], 500);
        }
    }

    /**
     * Get chart data for dashboard (admin only)
     */
    public function chartData(Request $request): JsonResponse
    {
        try {
            $year = $request->get('year', now()->year);
            
            // Monthly events data (Jan-Dec)
            $monthlyEvents = Event::selectRaw('MONTH(date) as month, COUNT(*) as count')
                ->whereYear('date', $year)
                ->groupBy('month')
                ->orderBy('month')
                ->get();
            
            // Monthly participants data (Jan-Dec) - only from participants who attended
            $monthlyParticipants = DB::table('event_participant')
                ->join('events', 'event_participant.event_id', '=', 'events.id')
                ->join('attendances', function($join) {
                    $join->on('event_participant.participant_id', '=', 'attendances.user_id')
                         ->on('event_participant.event_id', '=', 'attendances.event_id');
                })
                ->selectRaw('MONTH(events.date) as month, COUNT(DISTINCT event_participant.participant_id) as count')
                ->whereYear('events.date', $year)
                ->groupBy('month')
                ->orderBy('month')
                ->get();
            
            // Top 10 events with most participants
            $topEvents = Event::withCount('eventParticipants')
                ->orderBy('event_participants_count', 'desc')
                ->take(10)
                ->get(['id', 'title', 'date', 'event_participants_count']);
            
            return response()->json([
                'status' => 'success',
                'data' => [
                    'monthly_events' => $monthlyEvents,
                    'monthly_participants' => $monthlyParticipants,
                    'top_events' => $topEvents
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving chart data: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve chart data',
                'error' => config('app.debug') ? $e->getMessage() : 'Please try again later.'
            ], 500);
        }
    }

    /**
     * Export dashboard data (admin only)
     */
    public function exportDashboard(Request $request)
    {
        try {
            $year = $request->get('year', now()->year);
            $filename = 'dashboard_data_' . $year . '_' . now()->format('Y-m-d_H-i-s') . '.xlsx';
            
            return Excel::download(new DashboardExport($year), $filename);
            
        } catch (\Exception $e) {
            Log::error('Error exporting dashboard data: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengekspor data dashboard',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Export events data (admin only)
     */
    public function exportEvents()
    {
        try {
            $filename = 'events_' . now()->format('Y-m-d_H-i-s') . '.xlsx';
            
            // Get all events for export
            $events = Event::all();
            $exportData = collect();
            
            foreach ($events as $event) {
                $exportData = $exportData->merge(
                    EventParticipant::with('participant')
                        ->where('event_id', $event->id)
                        ->get()
                        ->map(function($participant) use ($event) {
                            return (object) [
                                'event_title' => $event->title,
                                'event_date' => $event->date,
                                'registration_number' => $participant->registration_number,
                                'participant_name' => $participant->participant->name,
                                'email' => $participant->participant->email,
                                'phone' => $participant->participant->phone,
                                'registration_date' => $participant->created_at,
                            ];
                        })
                );
            }
            
            return Excel::download(new DashboardExport(), $filename);
            
        } catch (\Exception $e) {
            Log::error('Error exporting events: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengekspor data event',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Export participants data for specific event (admin only)
     */
    public function exportParticipants($eventId)
    {
        try {
            $event = Event::findOrFail($eventId);
            $filename = 'participants_' . str_replace(' ', '_', $event->title) . '_' . now()->format('Y-m-d_H-i-s') . '.xlsx';
            
            return Excel::download(new EventParticipantsExport($event), $filename);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Event tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error exporting participants: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengekspor data peserta',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
