<?php

namespace App\Http\Controllers\Web\Client;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\Payment;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('role:client');
    }

    public function index()
    {
        $user = Auth::user();

        $stats = [
            'total_services' => $user->services()->count(),
            'active_services' => $user->services()->where('status', 'activo')->count(),
            'total_payments' => $user->payments()->count(),
            'pending_payments' => $user->payments()->where('status', 'Pendiente')->count(),
            'open_tickets' => $user->tickets()->where('status', 'abierto')->count(),
        ];

        // Servicios activos
        $services = $user->services()
            ->where('status', 'activo')
            ->orderBy('end_date', 'asc')
            ->limit(5)
            ->get();

        // Pagos recientes
        $payments = $user->payments()
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Tickets recientes
        $tickets = $user->tickets()
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return view('client.dashboard', compact('stats', 'services', 'payments', 'tickets'));
    }
}

