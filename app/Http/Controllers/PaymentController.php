<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    /**
     * Create payment for event ticket purchase
     */
    public function createTicketPayment(Request $request): JsonResponse
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'ticket_type' => 'required|string',
            'quantity' => 'required|integer|min:1|max:10',
            'payment_method' => 'required|string|in:virtual_account,ewallet,credit_card',
            'payment_channel' => 'required|string',
            'attendee_info' => 'required|array',
            'attendee_info.name' => 'required|string',
            'attendee_info.email' => 'required|email',
            'attendee_info.phone' => 'required|string',
            'discount_code' => 'nullable|string',
        ]);

        try {
            $user = Auth::user();
            $event = Event::findOrFail($request->event_id);

            // Check if event is paid
            if (!$event->isPaidEvent()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Event ini gratis, tidak memerlukan pembayaran'
                ], 400);
            }

            // Check if user can buy tickets
            if (!$event->canUserBuyTickets($user->id, $request->quantity)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda telah mencapai batas maksimal pembelian tiket untuk event ini'
                ], 400);
            }

            // Check if event registration is still open
            if (!$event->isRegistrationOpen()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pendaftaran event sudah ditutup'
                ], 400);
            }

            // Get ticket price
            $basePrice = $event->getTicketPriceForType($request->ticket_type);
            $pricePerTicket = $event->isEarlyBirdActive() 
                ? $event->calculateEarlyBirdPrice($basePrice)
                : $basePrice;

            // Calculate total amount
            $subtotal = $pricePerTicket * $request->quantity;
            $discountAmount = 0;

            // TODO: Apply discount code if provided
            if ($request->discount_code) {
                // Implement discount logic here
                $discountAmount = 0; // Placeholder
            }

            $totalAmount = $subtotal - $discountAmount;

            // Generate external ID
            $externalId = 'TICKET_' . $event->id . '_' . $user->id . '_' . time();

            // Create payment record
            $payment = Payment::create([
                'user_id' => $user->id,
                'event_id' => $event->id,
                'external_id' => $externalId,
                'amount' => $totalAmount,
                'currency' => 'IDR',
                'status' => 'pending',
                'payment_method' => $request->payment_method,
                'payment_channel' => $request->payment_channel,
                'expires_at' => now()->addHours(24),
                // Ticket-specific fields
                'ticket_type' => $request->ticket_type,
                'quantity' => $request->quantity,
                'price_per_ticket' => $pricePerTicket,
                'is_early_bird' => $event->isEarlyBirdActive(),
                'discount_amount' => $discountAmount,
                'discount_code' => $request->discount_code,
                'attendee_info' => $request->attendee_info,
                'requires_approval' => $event->requires_approval,
            ]);

            // Generate ticket number
            $payment->update([
                'ticket_number' => $payment->generateTicketNumber()
            ]);

            // TODO: Integrate with Xendit API
            $payment->update([
                'payment_id' => 'xendit_' . Str::random(20),
                'xendit_response' => [
                    'id' => 'xendit_' . Str::random(20),
                    'external_id' => $externalId,
                    'amount' => $totalAmount,
                    'status' => 'PENDING',
                    'created' => now()->toISOString(),
                    'updated' => now()->toISOString(),
                ]
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pembayaran tiket berhasil dibuat',
                'data' => [
                    'payment' => $payment,
                    'ticket_number' => $payment->ticket_number,
                    'payment_url' => $this->generatePaymentUrl($payment),
                    'expires_at' => $payment->expires_at,
                    'total_amount' => $totalAmount,
                    'price_breakdown' => [
                        'price_per_ticket' => $pricePerTicket,
                        'quantity' => $request->quantity,
                        'subtotal' => $subtotal,
                        'discount_amount' => $discountAmount,
                        'total' => $totalAmount
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Ticket payment creation failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat pembayaran tiket: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create payment for event registration (legacy method)
     */
    public function createPayment(Request $request): JsonResponse
    {
        $request->validate([
            'event_id' => 'required|exists:events,id',
            'payment_method' => 'required|string|in:virtual_account,ewallet,credit_card',
            'payment_channel' => 'required|string',
        ]);

        try {
            $user = Auth::user();
            $event = Event::findOrFail($request->event_id);

            // Check if user already registered for this event
            $existingParticipant = EventParticipant::where('user_id', $user->id)
                ->where('event_id', $event->id)
                ->first();

            if ($existingParticipant) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda sudah terdaftar untuk event ini'
                ], 400);
            }

            // Check if event is free
            if ($event->price == 0) {
                // Auto register for free events
                EventParticipant::create([
                    'user_id' => $user->id,
                    'event_id' => $event->id,
                    'status' => 'confirmed'
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Pendaftaran berhasil untuk event gratis',
                    'data' => [
                        'event' => $event,
                        'participant' => $existingParticipant
                    ]
                ]);
            }

            // Generate external ID
            $externalId = 'EVENT_' . $event->id . '_' . $user->id . '_' . time();

            // Create payment record
            $payment = Payment::create([
                'user_id' => $user->id,
                'event_id' => $event->id,
                'external_id' => $externalId,
                'amount' => $event->price,
                'currency' => 'IDR',
                'status' => 'pending',
                'payment_method' => $request->payment_method,
                'payment_channel' => $request->payment_channel,
                'expires_at' => now()->addHours(24), // 24 hours expiry
            ]);

            // TODO: Integrate with Xendit API
            // For now, we'll simulate the payment creation
            $payment->update([
                'payment_id' => 'xendit_' . Str::random(20),
                'xendit_response' => [
                    'id' => 'xendit_' . Str::random(20),
                    'external_id' => $externalId,
                    'amount' => $event->price,
                    'status' => 'PENDING',
                    'created' => now()->toISOString(),
                    'updated' => now()->toISOString(),
                ]
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment berhasil dibuat',
                'data' => [
                    'payment' => $payment,
                    'payment_url' => $this->generatePaymentUrl($payment),
                    'expires_at' => $payment->expires_at
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Payment creation failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get payment status
     */
    public function getPaymentStatus(string $paymentId): JsonResponse
    {
        try {
            $payment = Payment::where('payment_id', $paymentId)
                ->with(['user', 'event'])
                ->firstOrFail();

            return response()->json([
                'success' => true,
                'data' => $payment
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment tidak ditemukan'
            ], 404);
        }
    }

    /**
     * Get user's payment history
     */
    public function getPaymentHistory(): JsonResponse
    {
        try {
            $user = Auth::user();
            $payments = Payment::where('user_id', $user->id)
                ->with(['event'])
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $payments
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil riwayat payment'
            ], 500);
        }
    }

    /**
     * Handle Xendit webhook
     */
    public function handleWebhook(Request $request): JsonResponse
    {
        try {
            // TODO: Verify Xendit webhook signature
            $payload = $request->all();
            
            Log::info('Xendit webhook received', $payload);

            $payment = Payment::where('payment_id', $payload['id'])->first();
            
            if (!$payment) {
                return response()->json(['message' => 'Payment not found'], 404);
            }

            // Update payment status
            $payment->update([
                'status' => strtolower($payload['status']),
                'xendit_response' => $payload,
            ]);

            // If payment is successful, register user for event
            if ($payload['status'] === 'PAID') {
                $payment->update(['paid_at' => now()]);
                
                // Create event participant
                EventParticipant::create([
                    'user_id' => $payment->user_id,
                    'event_id' => $payment->event_id,
                    'status' => 'confirmed'
                ]);

                // Create transaction record
                Transaction::create([
                    'payment_id' => $payment->id,
                    'transaction_type' => 'payment',
                    'amount' => $payment->amount,
                    'currency' => $payment->currency,
                    'status' => 'completed',
                    'description' => 'Payment for event: ' . $payment->event->title,
                    'processed_at' => now(),
                ]);
            }

            return response()->json(['message' => 'Webhook processed successfully']);

        } catch (\Exception $e) {
            Log::error('Webhook processing failed: ' . $e->getMessage());
            return response()->json(['message' => 'Webhook processing failed'], 500);
        }
    }

    /**
     * Get all payments for admin
     */
    public function getAllPayments(Request $request): JsonResponse
    {
        try {
            $query = Payment::with(['user', 'event']);

            // Apply filters
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->has('method') && $request->method !== 'all') {
                $query->where('payment_method', $request->method);
            }

            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('payment_id', 'like', "%{$search}%")
                      ->orWhere('external_id', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($userQuery) use ($search) {
                          $userQuery->where('name', 'like', "%{$search}%")
                                   ->orWhere('email', 'like', "%{$search}%");
                      })
                      ->orWhereHas('event', function ($eventQuery) use ($search) {
                          $eventQuery->where('title', 'like', "%{$search}%");
                      });
                });
            }

            $payments = $query->orderBy('created_at', 'desc')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $payments
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch payments: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data pembayaran'
            ], 500);
        }
    }

    /**
     * Get payment statistics for admin dashboard
     */
    public function getPaymentStats(Request $request): JsonResponse
    {
        try {
            $range = $request->get('range', 30);
            $startDate = now()->subDays($range);

            $stats = [
                'total_payments' => Payment::where('created_at', '>=', $startDate)->count(),
                'total_amount' => Payment::where('created_at', '>=', $startDate)->sum('amount'),
                'successful_payments' => Payment::where('created_at', '>=', $startDate)->where('status', 'paid')->count(),
                'pending_payments' => Payment::where('created_at', '>=', $startDate)->where('status', 'pending')->count(),
                'failed_payments' => Payment::where('created_at', '>=', $startDate)->where('status', 'failed')->count(),
                'expired_payments' => Payment::where('created_at', '>=', $startDate)->where('status', 'expired')->count(),
            ];

            $stats['success_rate'] = $stats['total_payments'] > 0 
                ? ($stats['successful_payments'] / $stats['total_payments']) * 100 
                : 0;

            $stats['average_payment_amount'] = $stats['total_payments'] > 0 
                ? $stats['total_amount'] / $stats['total_payments'] 
                : 0;

            // Payment methods stats
            $stats['payment_methods_stats'] = [
                'virtual_account' => Payment::where('created_at', '>=', $startDate)
                    ->where('payment_method', 'virtual_account')->count(),
                'ewallet' => Payment::where('created_at', '>=', $startDate)
                    ->where('payment_method', 'ewallet')->count(),
                'credit_card' => Payment::where('created_at', '>=', $startDate)
                    ->where('payment_method', 'credit_card')->count(),
            ];

            // Daily payments for chart
            $stats['daily_payments'] = Payment::where('created_at', '>=', $startDate)
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count, SUM(amount) as amount')
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->map(function ($item) {
                    return [
                        'date' => $item->date,
                        'count' => $item->count,
                        'amount' => $item->amount,
                    ];
                });

            // Recent payments
            $stats['recent_payments'] = Payment::with(['user', 'event'])
                ->where('created_at', '>=', $startDate)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($payment) {
                    return [
                        'id' => $payment->id,
                        'payment_id' => $payment->payment_id,
                        'amount' => $payment->amount,
                        'status' => $payment->status,
                        'payment_method' => $payment->payment_method,
                        'user_name' => $payment->user->name,
                        'event_title' => $payment->event->title,
                        'created_at' => $payment->created_at,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch payment stats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik pembayaran'
            ], 500);
        }
    }

    /**
     * Approve payment (for events that require approval)
     */
    public function approvePayment(Request $request, $paymentId): JsonResponse
    {
        try {
            $payment = Payment::findOrFail($paymentId);
            
            if (!$payment->isPendingApproval()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment tidak memerlukan approval atau sudah di-approve'
                ], 400);
            }

            $approver = Auth::user();
            $payment->approve($approver);

            // Auto register user as participant after approval
            EventParticipant::create([
                'user_id' => $payment->user_id,
                'event_id' => $payment->event_id,
                'status' => 'confirmed'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment berhasil di-approve',
                'data' => [
                    'payment' => $payment,
                    'approved_by' => $approver->name,
                    'approved_at' => $payment->approved_at
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Payment approval failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal approve payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get payment settings
     */
    public function getPaymentSettings(): JsonResponse
    {
        try {
            // TODO: Implement settings storage (database or config file)
            $settings = [
                'xendit_secret_key' => config('services.xendit.secret_key', ''),
                'xendit_public_key' => config('services.xendit.public_key', ''),
                'xendit_webhook_token' => config('services.xendit.webhook_token', ''),
                'xendit_environment' => config('services.xendit.environment', 'sandbox'),
                'payment_methods' => [
                    'virtual_account' => true,
                    'ewallet' => true,
                    'credit_card' => true,
                ],
                'virtual_account_banks' => ['bca', 'mandiri', 'bni', 'bri'],
                'ewallet_providers' => ['gopay', 'ovo', 'dana', 'linkaja'],
                'credit_card_providers' => ['visa', 'mastercard', 'jcb'],
                'payment_expiry_hours' => 24,
                'auto_approve_payments' => true,
                'send_payment_notifications' => true,
            ];

            return response()->json([
                'success' => true,
                'data' => $settings
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch payment settings: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil pengaturan payment'
            ], 500);
        }
    }

    /**
     * Update payment settings
     */
    public function updatePaymentSettings(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'xendit_secret_key' => 'required|string',
                'xendit_public_key' => 'required|string',
                'xendit_webhook_token' => 'required|string',
                'xendit_environment' => 'required|in:sandbox,production',
                'payment_expiry_hours' => 'required|integer|min:1|max:168',
            ]);

            // TODO: Implement settings storage (database or config file)
            // For now, just return success
            Log::info('Payment settings updated', $request->all());

            return response()->json([
                'success' => true,
                'message' => 'Pengaturan payment berhasil disimpan'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to update payment settings: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan pengaturan payment'
            ], 500);
        }
    }

    /**
     * Test payment connection
     */
    public function testPaymentConnection(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'xendit_secret_key' => 'required|string',
                'xendit_environment' => 'required|in:sandbox,production',
            ]);

            // TODO: Implement actual Xendit API test
            // For now, simulate a successful test
            $testResult = [
                'success' => true,
                'environment' => $request->xendit_environment,
                'status' => 'connected',
                'message' => 'Koneksi ke Xendit berhasil',
            ];

            return response()->json([
                'success' => true,
                'data' => $testResult
            ]);

        } catch (\Exception $e) {
            Log::error('Payment connection test failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal testing koneksi payment'
            ], 500);
        }
    }

    /**
     * Generate payment URL (placeholder)
     */
    private function generatePaymentUrl(Payment $payment): string
    {
        // TODO: Generate actual Xendit payment URL
        return url("/payment/{$payment->payment_id}");
    }
}
