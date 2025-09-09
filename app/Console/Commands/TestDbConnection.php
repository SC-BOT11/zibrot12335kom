<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use PDOException;

class TestDbConnection extends Command
{
    protected $signature = 'db:test-connection';
    protected $description = 'Test the database connection';

    public function handle()
    {
        try {
            $this->info('Testing database connection...');
            
            // Test PDO connection
            $pdo = DB::connection()->getPdo();
            $this->info('Database connection successful!');
            $this->info('Database name: ' . $pdo->query('select database()')->fetchColumn());
            
            // Test simple query
            $result = DB::select('SELECT 1 as test');
            $this->info('Test query result: ' . json_encode($result));
            
            return 0;
        } catch (PDOException $e) {
            $this->error('Database connection failed: ' . $e->getMessage());
            return 1;
        }
    }
}
