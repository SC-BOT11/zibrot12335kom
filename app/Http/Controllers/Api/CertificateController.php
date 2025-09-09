<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Certificate;
use App\Models\EventParticipant;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;

class CertificateController extends Controller
{
    /**
     * Get events with certificate information
     */
    public function getEventsWithCertificates(): JsonResponse
    {
        try {
            $events = Event::withCount([
                'eventParticipants as participants_count',
                'certificates as certificates_generated',
                'eventParticipants as certificates_pending' => function ($query) {
                    $query->where('attendance_verified_at', '!=', null)
                          ->where('has_received_certificate', false);
                }
            ])
            ->select([
                'id', 'title', 'date', 'location', 
                'certificate_template_path', 'has_certificate', 'certificate_required'
            ])
            ->orderBy('date', 'desc')
            ->get();

            return response()->json([
                'status' => 'success',
                'data' => $events
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching events with certificates: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data events',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Get certificates for a specific event
     */
    public function getEventCertificates($eventId): JsonResponse
    {
        try {
            $event = Event::findOrFail($eventId);
            
            $certificates = Certificate::with(['participant', 'event'])
                ->where('event_id', $eventId)
                ->get()
                ->map(function ($certificate) {
                    return [
                        'id' => $certificate->id,
                        'participant' => [
                            'id' => $certificate->participant->id,
                            'name' => $certificate->participant->name,
                            'email' => $certificate->participant->email,
                        ],
                        'event' => [
                            'id' => $certificate->event->id,
                            'title' => $certificate->event->title,
                            'date' => $certificate->event->date,
                        ],
                        'certificate_number' => $certificate->certificate_number,
                        'status' => $this->getCertificateStatus($certificate),
                        'generated_at' => $certificate->issued_at,
                        'download_count' => $certificate->download_count ?? 0,
                    ];
                });

            return response()->json([
                'status' => 'success',
                'data' => $certificates
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching event certificates: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data sertifikat',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Update event certificate settings
     */
    public function updateEventCertificateSettings(Request $request, $eventId): JsonResponse
    {
        try {
            DB::beginTransaction();
            
            $event = Event::findOrFail($eventId);
            
            $validated = $request->validate([
                'has_certificate' => 'required|boolean',
                'certificate_required' => 'required|boolean',
                'certificate_template' => 'nullable|file|mimes:pdf,jpeg,png,jpg|max:5120',
            ]);

            $event->has_certificate = $validated['has_certificate'];
            $event->certificate_required = $validated['certificate_required'];

            // Handle certificate template upload
            if ($request->hasFile('certificate_template')) {
                // Delete old template if exists
                if ($event->certificate_template_path) {
                    $oldPath = str_replace('/storage/', 'public/', $event->certificate_template_path);
                    Storage::delete($oldPath);
                }

                $path = $request->file('certificate_template')->store('public/events/certificates/templates');
                $event->certificate_template_path = Storage::url($path);
            }

            $event->save();
            
            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Pengaturan sertifikat berhasil diupdate',
                'data' => $event
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak valid',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating event certificate settings: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal update pengaturan sertifikat',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Generate certificate for a specific participant
     */
    public function generateCertificate(Request $request, $eventId): JsonResponse
    {
        try {
            DB::beginTransaction();
            
            $event = Event::findOrFail($eventId);
            
            $validated = $request->validate([
                'participant_id' => 'required|integer|exists:users,id',
            ]);

            $participantId = $validated['participant_id'];
            
            // Check if participant is registered for this event
            $eventParticipant = EventParticipant::where('event_id', $eventId)
                ->where('participant_id', $participantId)
                ->first();

            if (!$eventParticipant) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Peserta tidak terdaftar untuk event ini',
                ], 404);
            }

            // Check if participant has attended
            if (!$eventParticipant->attendance_verified_at) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Peserta belum melakukan daftar hadir',
                ], 400);
            }

            // Check if certificate already exists
            $existingCertificate = Certificate::where('event_id', $eventId)
                ->where('participant_id', $participantId)
                ->first();

            if ($existingCertificate) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Sertifikat sudah pernah digenerate untuk peserta ini',
                ], 400);
            }

            // Generate certificate
            $certificate = $this->createCertificate($event, $eventParticipant);
            
            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Sertifikat berhasil digenerate',
                'data' => $certificate
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak valid',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error generating certificate: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal generate sertifikat',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Generate certificates for all eligible participants
     */
    public function generateAllCertificates($eventId): JsonResponse
    {
        try {
            DB::beginTransaction();
            
            $event = Event::findOrFail($eventId);
            
            // Get eligible participants
            $eligibleParticipants = EventParticipant::where('event_id', $eventId)
                ->where('attendance_verified_at', '!=', null)
                ->where('has_received_certificate', false)
                ->with('participant')
                ->get();

            if ($eligibleParticipants->isEmpty()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tidak ada peserta yang memenuhi syarat untuk sertifikat',
                ], 400);
            }

            $generatedCount = 0;
            foreach ($eligibleParticipants as $participant) {
                try {
                    $this->createCertificate($event, $participant);
                    $generatedCount++;
                } catch (\Exception $e) {
                    Log::error("Error generating certificate for participant {$participant->id}: " . $e->getMessage());
                }
            }
            
            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => "Berhasil generate {$generatedCount} sertifikat",
                'data' => ['generated_count' => $generatedCount]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error generating all certificates: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal generate sertifikat',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Download certificate
     */
    public function downloadCertificate($certificateId): JsonResponse
    {
        try {
            $certificate = Certificate::with(['participant', 'event'])->findOrFail($certificateId);
            
            // Increment download count
            $certificate->increment('download_count');
            
            // Return download URL
            return response()->json([
                'status' => 'success',
                'data' => [
                    'download_url' => $certificate->certificate_path,
                    'certificate_number' => $certificate->certificate_number,
                    'participant_name' => $certificate->participant->name,
                    'event_title' => $certificate->event->title,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error downloading certificate: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal download sertifikat',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Create certificate for participant
     */
    private function createCertificate($event, $eventParticipant)
    {
        // Generate certificate PDF using DomPDF
        $pdf = Pdf::loadView('certificates.template', [
            'event' => $event,
            'participant' => $eventParticipant->participant,
            'certificateNumber' => Str::uuid(),
        ]);
        
        $filename = "certificate_{$event->id}_{$eventParticipant->id}_" . time() . '.pdf';
        $path = "public/certificates/{$filename}";
        
        // Save the PDF to storage
        Storage::put($path, $pdf->output());
        
        // Create certificate record
        $certificate = Certificate::create([
            'event_id' => $event->id,
            'participant_id' => $eventParticipant->participant_id,
            'event_participant_id' => $eventParticipant->id,
            'certificate_number' => Str::uuid(),
            'certificate_path' => Storage::url($path),
            'issued_at' => now(),
            'download_count' => 0,
        ]);
        
        // Update participant's certificate status
        $eventParticipant->update(['has_received_certificate' => true]);
        
        return $certificate;
    }

    /**
     * Get certificate status
     */
    private function getCertificateStatus($certificate)
    {
        if ($certificate->issued_at) {
            if ($certificate->download_count > 0) {
                return 'downloaded';
            }
            return 'generated';
        }
        return 'pending';
    }
}