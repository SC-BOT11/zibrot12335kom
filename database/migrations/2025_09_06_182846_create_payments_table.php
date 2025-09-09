<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->string('payment_id')->unique(); // Xendit payment ID
            $table->string('external_id')->unique(); // Our internal payment ID
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('IDR');
            $table->string('status')->default('pending'); // pending, paid, failed, expired, cancelled
            $table->string('payment_method')->nullable(); // virtual_account, ewallet, credit_card, etc
            $table->string('payment_channel')->nullable(); // bca, mandiri, gopay, ovo, etc
            $table->json('payment_details')->nullable(); // Store payment method specific details
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->text('failure_reason')->nullable();
            $table->json('xendit_response')->nullable(); // Store full Xendit response
            $table->timestamps();
            
            $table->index(['user_id', 'event_id']);
            $table->index(['status']);
            $table->index(['payment_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
