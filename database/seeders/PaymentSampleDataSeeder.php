<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Payment;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Event;
use Carbon\Carbon;

class PaymentSampleDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing users and events
        $users = User::all();
        $events = Event::all();

        if ($users->isEmpty() || $events->isEmpty()) {
            $this->command->info('No users or events found. Please run other seeders first.');
            return;
        }

        // Create sample payments for different time periods
        $paymentMethods = ['virtual_account', 'ewallet', 'credit_card'];
        $statuses = ['paid', 'pending', 'failed', 'expired'];
        $banks = ['bca', 'mandiri', 'bni', 'bri'];
        $ewallets = ['gopay', 'ovo', 'dana', 'linkaja'];

        // Create payments for the last 30 days
        for ($i = 0; $i < 50; $i++) {
            $user = $users->random();
            $event = $events->random();
            $paymentMethod = $paymentMethods[array_rand($paymentMethods)];
            $status = $statuses[array_rand($statuses)];
            
            // Random date within last 30 days
            $createdAt = Carbon::now()->subDays(rand(0, 30))->subHours(rand(0, 23))->subMinutes(rand(0, 59));
            
            $amount = rand(50000, 500000); // Random amount between 50k-500k
            
            $paymentId = 'xnd_' . str_pad(rand(100000000, 999999999), 9, '0', STR_PAD_LEFT);
            $externalId = 'ref_' . str_pad(rand(100000000, 999999999), 9, '0', STR_PAD_LEFT);
            
            $pricePerTicket = $amount; // For simplicity, amount = price per ticket
            $quantity = 1;
            $ticketTypes = ['general', 'vip', 'premium'];
            $ticketType = $ticketTypes[array_rand($ticketTypes)];
            
            $payment = Payment::create([
                'user_id' => $user->id,
                'event_id' => $event->id,
                'payment_id' => $paymentId,
                'external_id' => $externalId,
                'amount' => $amount,
                'currency' => 'IDR',
                'payment_method' => $paymentMethod,
                'payment_channel' => $paymentMethod === 'virtual_account' ? $banks[array_rand($banks)] : 
                                   ($paymentMethod === 'ewallet' ? $ewallets[array_rand($ewallets)] : 'visa'),
                'status' => $status,
                'payment_details' => json_encode([
                    'payment_method' => $paymentMethod,
                    'bank_code' => $paymentMethod === 'virtual_account' ? $banks[array_rand($banks)] : null,
                    'ewallet_type' => $paymentMethod === 'ewallet' ? $ewallets[array_rand($ewallets)] : null,
                ]),
                'ticket_type' => $ticketType,
                'quantity' => $quantity,
                'price_per_ticket' => $pricePerTicket,
                'ticket_number' => 'TKT-' . str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT),
                'is_early_bird' => rand(0, 1) === 1,
                'discount_amount' => rand(0, 1) === 1 ? rand(5000, 25000) : 0,
                'discount_code' => rand(0, 1) === 1 ? 'DISCOUNT' . rand(10, 99) : null,
                'attendee_info' => json_encode([
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                ]),
                'requires_approval' => false,
                'paid_at' => $status === 'paid' ? $createdAt->addMinutes(rand(1, 60)) : null,
                'expires_at' => $createdAt->addHours(24),
                'xendit_response' => json_encode([
                    'id' => $paymentId,
                    'external_id' => $externalId,
                    'status' => $status,
                    'amount' => $amount,
                    'payment_method' => $paymentMethod,
                ]),
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            // Create transaction record for paid payments
            if ($status === 'paid') {
                Transaction::create([
                    'payment_id' => $payment->id,
                    'transaction_type' => 'payment',
                    'amount' => $amount,
                    'currency' => 'IDR',
                    'status' => 'completed',
                    'reference_id' => $paymentId,
                    'description' => "Payment for event: {$event->title}",
                    'metadata' => json_encode([
                        'payment_method' => $paymentMethod,
                        'event_id' => $event->id,
                        'user_id' => $user->id,
                    ]),
                    'processed_at' => $payment->paid_at,
                    'created_at' => $payment->paid_at,
                    'updated_at' => $payment->paid_at,
                ]);
            }
        }

        $this->command->info('Payment sample data created successfully!');
        $this->command->info('Payments: ' . Payment::count());
        $this->command->info('Transactions: ' . Transaction::count());
        
        // Show status breakdown
        $statusCounts = Payment::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get();
            
        $this->command->info('Payment Status Breakdown:');
        foreach ($statusCounts as $status) {
            $this->command->info("- {$status->status}: {$status->count}");
        }
    }
}
