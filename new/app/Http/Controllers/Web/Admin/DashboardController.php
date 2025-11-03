<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Service;
use App\Models\Payment;
use App\Models\Ticket;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('role:admin|superadmin');
    }

    public function index()
    {
        $stats = [
            'total_users' => User::count(),
            'active_users' => User::where('status', 'active')->count(),
            'total_services' => Service::count(),
            'active_services' => Service::where('status', 'activo')->count(),
            'total_payments' => Payment::count(),
            'pending_payments' => Payment::where('status', 'Pendiente')->count(),
            'completed_payments' => Payment::where('status', 'Completado')->count(),
            'total_tickets' => Ticket::count(),
            'open_tickets' => Ticket::where('status', 'abierto')->count(),
        ];

        // Pagos recientes
        $recentPayments = Payment::with(['user', 'service'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Servicios próximos a vencer
        $expiringServices = Service::with('user')
            ->where('status', 'activo')
            ->whereBetween('end_date', [now(), now()->addDays(30)])
            ->orderBy('end_date', 'asc')
            ->limit(10)
            ->get();

        // Tickets abiertos
        $openTickets = Ticket::with('user')
            ->where('status', 'abierto')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return view('admin.dashboard', compact('stats', 'recentPayments', 'expiringServices', 'openTickets'));
    }
}

