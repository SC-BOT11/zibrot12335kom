<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\User;
use Carbon\Carbon;

class TestEventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get admin user
        $admin = User::where('role', 'admin')->first();
        
        if (!$admin) {
            $this->command->error('Admin user not found. Please run AdminUserSeeder first.');
            return;
        }

        // Create test events
        $events = [
            [
                'title' => 'Workshop Web Development',
                'description' => 'Pelatihan lengkap tentang pengembangan website modern menggunakan React dan Laravel. Cocok untuk pemula hingga menengah.',
                'date' => Carbon::now()->addDays(7)->format('Y-m-d'),
                'start_time' => '09:00:00',
                'end_time' => '17:00:00',
                'location' => 'Gedung A, Ruang 101',
                'max_participants' => 50,
                'registration_deadline' => Carbon::now()->addDays(5)->format('Y-m-d H:i:s'),
                'is_active' => true,
                'user_id' => $admin->id,
            ],
            [
                'title' => 'Seminar Digital Marketing',
                'description' => 'Pelajari strategi digital marketing yang efektif untuk meningkatkan penjualan bisnis Anda.',
                'date' => Carbon::now()->addDays(14)->format('Y-m-d'),
                'start_time' => '13:00:00',
                'end_time' => '16:00:00',
                'location' => 'Auditorium Utama',
                'max_participants' => 100,
                'registration_deadline' => Carbon::now()->addDays(12)->format('Y-m-d H:i:s'),
                'is_active' => true,
                'user_id' => $admin->id,
            ],
            [
                'title' => 'Bootcamp Data Science',
                'description' => 'Intensive bootcamp untuk mempelajari data science dari dasar hingga advanced. Termasuk hands-on project.',
                'date' => Carbon::now()->addDays(21)->format('Y-m-d'),
                'start_time' => '08:00:00',
                'end_time' => '18:00:00',
                'location' => 'Lab Komputer 1',
                'max_participants' => 30,
                'registration_deadline' => Carbon::now()->addDays(19)->format('Y-m-d H:i:s'),
                'is_active' => true,
                'user_id' => $admin->id,
            ],
            [
                'title' => 'Networking Event Tech Community',
                'description' => 'Acara networking untuk para profesional di bidang teknologi. Meet & greet dengan industry experts.',
                'date' => Carbon::now()->addDays(28)->format('Y-m-d'),
                'start_time' => '18:00:00',
                'end_time' => '21:00:00',
                'location' => 'Hotel Grand Ballroom',
                'max_participants' => 200,
                'registration_deadline' => Carbon::now()->addDays(26)->format('Y-m-d H:i:s'),
                'is_active' => true,
                'user_id' => $admin->id,
            ],
            [
                'title' => 'UI/UX Design Workshop',
                'description' => 'Workshop mendalam tentang prinsip-prinsip UI/UX design dan tools yang digunakan dalam industri.',
                'date' => Carbon::now()->addDays(35)->format('Y-m-d'),
                'start_time' => '10:00:00',
                'end_time' => '15:00:00',
                'location' => 'Design Studio',
                'max_participants' => 25,
                'registration_deadline' => Carbon::now()->addDays(33)->format('Y-m-d H:i:s'),
                'is_active' => true,
                'user_id' => $admin->id,
            ],
        ];

        foreach ($events as $eventData) {
            Event::create($eventData);
        }

        $this->command->info('Test events created successfully!');
    }
}