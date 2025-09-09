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
        Schema::table('payments', function (Blueprint $table) {
            // Add fields specific to event ticket payments
            $table->string('ticket_type')->default('general'); // general, vip, premium, etc
            $table->integer('quantity')->default(1); // Number of tickets
            $table->decimal('price_per_ticket', 10, 2); // Price per individual ticket
            $table->string('ticket_number')->nullable(); // Generated ticket number
            $table->boolean('is_early_bird')->default(false); // Early bird discount
            $table->decimal('discount_amount', 10, 2)->default(0); // Discount amount
            $table->string('discount_code')->nullable(); // Discount/promo code
            $table->json('attendee_info')->nullable(); // Attendee information (name, email, phone)
            $table->boolean('requires_approval')->default(false); // Whether payment requires admin approval
            $table->timestamp('approved_at')->nullable(); // When payment was approved
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null'); // Who approved the payment
            
            // Add indexes
            $table->index(['ticket_type']);
            $table->index(['ticket_number']);
            $table->index(['discount_code']);
            $table->index(['requires_approval']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex(['ticket_type']);
            $table->dropIndex(['ticket_number']);
            $table->dropIndex(['discount_code']);
            $table->dropIndex(['requires_approval']);
            
            $table->dropColumn([
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
                'approved_by'
            ]);
        });
    }
};