<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CertificateController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\PaymentController;

// Public Routes
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/search', [EventController::class, 'search']);
Route::get('/events/{id}', [EventController::class, 'show']);

// Auth Routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/verify-otp', [AuthController::class, 'verifyOTP']);
Route::post('/resend-otp', [AuthController::class, 'resendOTP']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Email Verification
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->middleware(['signed'])->name('verification.verify');

// Certificate Search (Public)
Route::get('/certificates/search', [CertificateController::class, 'search']);
Route::get('/certificates/verify/{certificateNumber}', [CertificateController::class, 'verify']);
Route::get('/certificates/{id}/download', [CertificateController::class, 'download']);

// Protected Routes (butuh token Sanctum)
Route::middleware(['auth:sanctum', 'session.timeout'])->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // User Profile
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/password', [AuthController::class, 'updatePassword']);

    // Dashboard
    Route::get('/dashboard/stats', [EventController::class, 'statistics']);
    Route::get('/dashboard/chart-data', [EventController::class, 'chartData']);
    Route::get('/dashboard/export', [EventController::class, 'exportDashboard']);

    // Events
    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);
    Route::post('/events/{id}/register', [EventController::class, 'register']);
    Route::post('/events/{id}/attendance', [EventController::class, 'attendance']);

    // User Events
    Route::get('/my-events', [EventController::class, 'myEvents']);
    Route::get('/my-certificates', [EventController::class, 'myCertificates']);

    // User Management (Admin only)
    Route::middleware(['admin'])->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        Route::post('/users/bulk-action', [UserController::class, 'bulkAction']);
        Route::get('/users/statistics', [UserController::class, 'statistics']);

        // Admin Dashboard
        Route::get('/admin/dashboard/stats', [App\Http\Controllers\Admin\DashboardController::class, 'statistics']);
        Route::get('/admin/dashboard/chart-data', [App\Http\Controllers\Admin\DashboardController::class, 'chartData']);
        
        // Export Data
        Route::get('/admin/export/events', [App\Http\Controllers\Admin\DashboardController::class, 'exportEvents']);
        Route::get('/admin/export/participants', [App\Http\Controllers\Admin\DashboardController::class, 'exportParticipants']);
        Route::get('/admin/export/users', [App\Http\Controllers\Admin\DashboardController::class, 'exportUsers']);

        // Payment Management
        Route::get('/admin/payments', [PaymentController::class, 'getAllPayments']);
        Route::get('/admin/payment-stats', [PaymentController::class, 'getPaymentStats']);
        Route::get('/admin/payment-settings', [PaymentController::class, 'getPaymentSettings']);
        Route::put('/admin/payment-settings', [PaymentController::class, 'updatePaymentSettings']);
        Route::post('/admin/payment-settings/test', [PaymentController::class, 'testPaymentConnection']);
        
        // Admin certificate management routes
        Route::get('/admin/events/certificates', [CertificateController::class, 'getEventsWithCertificates']);
        Route::get('/admin/events/{eventId}/certificates', [CertificateController::class, 'getEventCertificates']);
        Route::put('/admin/events/{eventId}/certificate-settings', [CertificateController::class, 'updateEventCertificateSettings']);
        Route::post('/admin/events/{eventId}/certificates/generate', [CertificateController::class, 'generateCertificate']);
        Route::post('/admin/events/{eventId}/certificates/generate-all', [CertificateController::class, 'generateAllCertificates']);
        Route::get('/admin/certificates/{certificateId}/download', [CertificateController::class, 'downloadCertificate']);
    });

    // Attendance
    Route::get('/events/{event}/attendance', [AttendanceController::class, 'index']);
    Route::post('/events/{event}/attendance/{participant}', [AttendanceController::class, 'markAttendance']);
    
    // Attendance Token System
    Route::get('/events/{eventId}/attendance-token', [AttendanceController::class, 'getAttendanceToken']);
    Route::post('/attendance/verify', [AttendanceController::class, 'verifyAttendance']);
    Route::get('/attendance/status', [AttendanceController::class, 'getAttendanceStatus']);

    // Resend Email Verification
    Route::post('/email/verification-notification', [AuthController::class, 'resendVerificationEmail'])
        ->middleware(['throttle:6,1']);

    // Payment Routes
    Route::post('/payments/create', [PaymentController::class, 'createPayment']);
    Route::post('/payments/ticket/create', [PaymentController::class, 'createTicketPayment']);
    Route::get('/payments/history', [PaymentController::class, 'getPaymentHistory']);
    Route::get('/payments/{paymentId}/status', [PaymentController::class, 'getPaymentStatus']);
    Route::post('/payments/{paymentId}/approve', [PaymentController::class, 'approvePayment']);
});

// Webhook Routes (no auth required)
Route::post('/webhooks/xendit', [PaymentController::class, 'handleWebhook']);
