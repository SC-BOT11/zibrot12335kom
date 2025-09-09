@extends('admin.layouts.app')

@section('title', 'Events Management')

@section('content')
<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h1 class="h3 mb-0">Events Management</h1>
        <a href="{{ route('admin.events.create') }}" class="btn btn-primary">
            <i class="fas fa-plus me-1"></i> Create Event
        </a>
    </div>

    <div class="card shadow-sm">
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>Title</th>
                            <th>Date & Time</th>
                            <th>Location</th>
                            <th>Participants</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($events as $event)
                            <tr>
                                <td>
                                    <div class="fw-bold">{{ $event->title }}</div>
                                    <div class="text-muted small">{{ Str::limit($event->description, 50) }}</div>
                                </td>
                                <td>
                                    <div>{{ $event->date->format('M d, Y') }}</div>
                                    <div class="text-muted small">
                                        {{ $event->start_time->format('h:i A') }} - {{ $event->end_time->format('h:i A') }}
                                    </div>
                                </td>
                                <td>{{ $event->location }}</td>
                                <td>
                                    <span class="badge bg-primary">
                                        {{ $event->event_participants_count }} / {{ $event->max_participants ?? '∞' }}
                                    </span>
                                </td>
                                <td>
                                    @if($event->is_active)
                                        <span class="badge bg-success">Active</span>
                                    @else
                                        <span class="badge bg-secondary">Inactive</span>
                                    @endif
                                    
                                    @if($event->date->isPast())
                                        <div class="text-muted small mt-1">Ended</div>
                                    @elseif($event->registration_deadline->isPast())
                                        <div class="text-warning small mt-1">Registration Closed</div>
                                    @else
                                        <div class="text-success small mt-1">Open for Registration</div>
                                    @endif
                                </td>
                                <td>
                                    <div class="btn-group">
                                        <a href="{{ route('admin.events.show', $event) }}" class="btn btn-sm btn-outline-primary">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                        <a href="{{ route('admin.events.edit', $event) }}" class="btn btn-sm btn-outline-secondary">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                        <form action="{{ route('admin.events.destroy', $event) }}" method="POST" class="d-inline">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-sm btn-outline-danger delete-btn">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="text-center py-4">
                                    <div class="text-muted">No events found. <a href="{{ route('admin.events.create') }}">Create one now</a>.</div>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div class="d-flex justify-content-center mt-4">
                {{ $events->links() }}
            </div>
        </div>
    </div>
</div>
@endsection

@push('styles')
<style>
    .table th, .table td {
        vertical-align: middle;
    }
    .btn-group .btn {
        margin-right: 2px;
    }
    .badge {
        font-size: 0.75em;
    }
</style>
@endpush
