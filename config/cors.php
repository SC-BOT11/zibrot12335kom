<?php


return [
    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'login',
        'register',
        'forgot-password',
        'reset-password',
        'email/verify/*',
        'verify-email'
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => [
        'Origin',
        'Content-Type',
        'X-Auth-Token',
        'X-Requested-With',
        'X-CSRF-TOKEN',
        'Authorization',
        'Accept',
        'X-XSRF-TOKEN',
        'X-Socket-Id'
    ],

    'exposed_headers' => [
        'Authorization',
        'X-CSRF-TOKEN',
        'X-XSRF-TOKEN',
    ],

    'max_age' => 0,

    'supports_credentials' => true,

];
