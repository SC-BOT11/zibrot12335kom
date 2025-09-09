@extends('admin.layouts.app')

@section('title', 'Admin Dashboard')

@section('content')
<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 mb-0">Dashboard</h1>
        <div class="btn-group">
            <a href="{{ route('admin.events.create') }}" class="btn btn-primary">
                <i class="fas fa-plus me-1"></i> Create Event
            </a>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="row mb-4">
        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-primary shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                Total Events</div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $stats['total_events'] }}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-calendar-alt fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-success shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                                Upcoming Events</div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $stats['upcoming_events'] }}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-calendar-check fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-info shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                                Total Participants</div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $stats['total_participants'] }}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-users fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-3 col-md-6 mb-4">
            <div class="card border-left-warning shadow h-100 py-2">
                <div class="card-body">
                    <div class="row no-gutters align-items-center">
                        <div class="col mr-2">
                            <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                Certificates Issued</div>
                            <div class="h5 mb-0 font-weight-bold text-gray-800">{{ $stats['certificates_issued'] }}</div>
                        </div>
                        <div class="col-auto">
                            <i class="fas fa-certificate fa-2x text-gray-300"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Charts Row -->
    <div class="row">
        <!-- Events by Month Chart -->
        <div class="col-xl-8 col-lg-7">
            <div class="card shadow mb-4">
                <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                    <h6 class="m-0 font-weight-bold text-primary">Events Overview</h6>
                    <div class="dropdown no-arrow">
                        <a class="dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-bs-toggle="dropdown"
                            aria-haspopup="true" aria-expanded="false">
                            <i class="fas fa-ellipsis-v fa-sm fa-fw text-gray-400"></i>
                        </a>
                        <div class="dropdown-menu dropdown-menu-right shadow animated--fade-in"
                            aria-labelledby="dropdownMenuLink">
                            <div class="dropdown-header">View Options:</div>
                            <a class="dropdown-item" href="#" id="eventsYearly">Yearly</a>
                            <a class="dropdown-item" href="#" id="eventsMonthly">Monthly</a>
                            <a class="dropdown-item" href="#" id="eventsWeekly">Weekly</a>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="chart-area">
                        <canvas id="eventsChart"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <!-- Upcoming Events -->
        <div class="col-xl-4 col-lg-5">
            <div class="card shadow mb-4">
                <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                    <h6 class="m-0 font-weight-bold text-primary">Upcoming Events</h6>
                    <a href="{{ route('admin.events.index') }}" class="btn btn-sm btn-link">View All</a>
                </div>
                <div class="card-body">
                    @if($upcomingEvents->count() > 0)
                        <div class="list-group list-group-flush">
                            @foreach($upcomingEvents as $event)
                                <a href="{{ route('admin.events.show', $event) }}" class="list-group-item list-group-item-action">
                                    <div class="d-flex w-100 justify-content-between">
                                        <h6 class="mb-1">{{ $event->title }}</h6>
                                        <small>{{ $event->date->diffForHumans() }}</small>
                                    </div>
                                    <p class="mb-1 text-muted small">
                                        <i class="far fa-calendar-alt me-1"></i> {{ $event->date->format('M j, Y') }}
                                        <span class="mx-2">•</span>
                                        <i class="far fa-clock me-1"></i> {{ $event->start_time->format('g:i A') }} - {{ $event->end_time->format('g:i A') }}
                                    </p>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <small class="text-muted">
                                            <i class="fas fa-users me-1"></i> {{ $event->eventParticipants->count() }} participants
                                        </small>
                                        <span class="badge bg-{{ $event->is_active ? 'success' : 'secondary' }} rounded-pill">
                                            {{ $event->is_active ? 'Active' : 'Inactive' }}
                                        </span>
                                    </div>
                                </a>
                            @endforeach
                        </div>
                    @else
                        <div class="text-center py-4">
                            <i class="fas fa-calendar-alt fa-3x text-gray-300 mb-3"></i>
                            <p class="text-muted">No upcoming events scheduled.</p>
                            <a href="{{ route('admin.events.create') }}" class="btn btn-primary btn-sm">
                                <i class="fas fa-plus me-1"></i> Create Event
                            </a>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Activity -->
    <div class="row">
        <div class="col-12">
            <div class="card shadow mb-4">
                <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                    <h6 class="m-0 font-weight-bold text-primary">Recent Activity</h6>
                </div>
                <div class="card-body">
                    @if($recentActivities->count() > 0)
                        <div class="timeline">
                            @foreach($recentActivities as $activity)
                                <div class="timeline-item">
                                    <div class="timeline-marker">
                                        @switch($activity->type)
                                            @case('event_created')
                                                <i class="fas fa-calendar-plus text-primary"></i>
                                                @break
                                            @case('participant_registered')
                                                <i class="fas fa-user-plus text-success"></i>
                                                @break
                                            @case('certificate_issued')
                                                <i class="fas fa-certificate text-warning"></i>
                                                @break
                                            @default
                                                <i class="fas fa-info-circle text-info"></i>
                                        @endswitch
                                    </div>
                                    <div class="timeline-content">
                                        <h6 class="mb-1">{{ $activity->title }}</h6>
                                        <p class="text-muted small mb-1">{{ $activity->description }}</p>
                                        <span class="small text-muted">
                                            <i class="far fa-clock me-1"></i> {{ $activity->created_at->diffForHumans() }}
                                        </span>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                        <div class="text-end mt-3">
                            <a href="#" class="btn btn-sm btn-outline-primary">View All Activity</a>
                        </div>
                    @else
                        <div class="text-center py-4">
                            <i class="fas fa-history fa-3x text-gray-300 mb-3"></i>
                            <p class="text-muted">No recent activity to display.</p>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<script>
    // Events Chart
    document.addEventListener('DOMContentLoaded', function() {
        // Chart data from PHP (passed as JSON)
        const chartData = @json($chartData);
        
        // Chart configuration
        const ctx = document.getElementById('eventsChart').getContext('2d');
        const eventsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Events',
                    data: chartData.data,
                    backgroundColor: 'rgba(78, 115, 223, 0.5)',
                    borderColor: 'rgba(78, 115, 223, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                }
            }
        });

        // Chart period toggles
        document.getElementById('eventsYearly').addEventListener('click', function(e) {
            e.preventDefault();
            // Update chart with yearly data
            updateChart('yearly');
        });

        document.getElementById('eventsMonthly').addEventListener('click', function(e) {
            e.preventDefault();
            // Update chart with monthly data
            updateChart('monthly');
        });

        document.getElementById('eventsWeekly').addEventListener('click', function(e) {
            e.preventDefault();
            // Update chart with weekly data
            updateChart('weekly');
        });

        // Function to update chart data via AJAX
        function updateChart(period) {
            fetch(`/admin/dashboard/chart-data?period=${period}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            })
            .then(response => response.json())
            .then(data => {
                eventsChart.data.labels = data.labels;
                eventsChart.data.datasets[0].data = data.data;
                eventsChart.update();
            })
            .catch(error => console.error('Error fetching chart data:', error));
        }
    });
</script>
@endpush

@push('styles')
<style>
    .card {
        border: none;
        box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
        margin-bottom: 1.5rem;
    }
    
    .card-header {
        background-color: #f8f9fc;
        border-bottom: 1px solid #e3e6f0;
    }
    
    .border-left-primary {
        border-left: 0.25rem solid #4e73df !important;
    }
    
    .border-left-success {
        border-left: 0.25rem solid #1cc88a !important;
    }
    
    .border-left-info {
        border-left: 0.25rem solid #36b9cc !important;
    }
    
    .border-left-warning {
        border-left: 0.25rem solid #f6c23e !important;
    }
    
    .chart-area {
        position: relative;
        height: 20rem;
        width: 100%;
    }
    
    @media (min-width: 1200px) {
        .chart-area {
            height: 25rem;
        }
    }
    
    /* Timeline styling */
    .timeline {
        position: relative;
        padding-left: 3rem;
        margin: 0 0 0 2rem;
        color: #5a5c69;
    }
    
    .timeline:before {
        content: '';
        position: absolute;
        left: 0.75rem;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #e3e6f0;
    }
    
    .timeline-item {
        position: relative;
        padding-bottom: 1.5rem;
    }
    
    .timeline-marker {
        position: absolute;
        left: -3rem;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        background: #fff;
        text-align: center;
        line-height: 2.5rem;
        font-size: 1.2rem;
        z-index: 1;
        box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
    }
    
    .timeline-content {
        padding: 1rem 1.5rem;
        background-color: #f8f9fc;
        border-radius: 0.35rem;
        box-shadow: 0 0.15rem 0.5rem rgba(0, 0, 0, 0.05);
    }
    
    .timeline-content h6 {
        color: #4e73df;
        margin-bottom: 0.5rem;
    }
    
    .timeline-item:last-child .timeline-content {
        margin-bottom: 0;
    }
    
    /* Custom scrollbar for dropdowns */
    .dropdown-menu {
        max-height: 300px;
        overflow-y: auto;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
        .chart-area {
            height: 15rem;
        }
        
        .timeline {
            padding-left: 2rem;
            margin-left: 1rem;
        }
        
        .timeline-marker {
            left: -2.5rem;
            width: 2rem;
            height: 2rem;
            line-height: 2rem;
            font-size: 1rem;
        }
    }
</style>
@endpush
