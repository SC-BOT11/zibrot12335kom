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
        Schema::table('events', function (Blueprint $table) {
            // Add ticket pricing fields
            $table->boolean('is_paid_event')->default(false); // Whether event requires payment
            $table->decimal('ticket_price', 10, 2)->default(0); // Base ticket price
            $table->json('ticket_types')->nullable(); // Different ticket types and prices
            $table->boolean('early_bird_enabled')->default(false); // Early bird discount available
            $table->decimal('early_bird_discount', 5, 2)->default(0); // Early bird discount percentage
            $table->timestamp('early_bird_deadline')->nullable(); // Early bird deadline
            $table->integer('max_tickets_per_user')->default(1); // Max tickets per user
            $table->boolean('requires_approval')->default(false); // Whether ticket purchases require approval
            $table->text('payment_instructions')->nullable(); // Payment instructions for users
            
            // Add indexes
            $table->index(['is_paid_event']);
            $table->index(['early_bird_enabled']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropIndex(['is_paid_event']);
            $table->dropIndex(['early_bird_enabled']);
            
            $table->dropColumn([
                'is_paid_event',
                'ticket_price',
                'ticket_types',
                'early_bird_enabled',
                'early_bird_discount',
                'early_bird_deadline',
                'max_tickets_per_user',
                'requires_approval',
                'payment_instructions'
            ]);
        });
    }
};