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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained()->onDelete('cascade');
            $table->string('transaction_type'); // payment, refund, partial_refund
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('IDR');
            $table->string('status'); // pending, completed, failed, cancelled
            $table->string('reference_id')->nullable(); // External reference
            $table->text('description')->nullable();
            $table->json('metadata')->nullable(); // Additional transaction data
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            
            $table->index(['payment_id']);
            $table->index(['status']);
            $table->index(['transaction_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
