<?php

namespace App\Http\Controllers\Web\Client;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PaymentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('role:client');
    }

    public function index()
    {
        $payments = Auth::user()->payments()
            ->with('service')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return view('client.payments.index', compact('payments'));
    }

    public function create()
    {
        $services = Auth::user()->services()
            ->where('status', 'activo')
            ->whereDoesntHave('payments', function($query) {
                $query->whereIn('status', ['Pendiente', 'Procesando']);
            })
            ->get();

        return view('client.payments.create', compact('services'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
            'proof' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120', // 5MB
        ]);

        // Verificar que el servicio pertenece al usuario
        $service = Service::where('id', $validated['service_id'])
            ->where('user_id', Auth::id())
            ->firstOrFail();

        // Verificar que no hay pagos pendientes
        if ($service->hasPendingPayment()) {
            return back()->withErrors(['service_id' => 'Este servicio ya tiene un pago pendiente o en procesamiento']);
        }

        $payment = Payment::create([
            'user_id' => Auth::id(),
            'service_id' => $validated['service_id'],
            'payment_number' => 'PAY-' . strtoupper(uniqid()),
            'amount' => $validated['amount'],
            'currency' => $service->currency,
            'payment_method' => $validated['payment_method'],
            'status' => 'Pendiente',
        ]);

        // Subir comprobante si existe
        if ($request->hasFile('proof')) {
            $path = $request->file('proof')->store('payments/proofs', 'public');
            $payment->update([
                'proof_url' => Storage::url($path),
                'status' => 'Procesando',
            ]);
        }

        return redirect()->route('client.payments.index')
            ->with('success', 'Pago creado exitosamente');
    }

    public function show(Payment $payment)
    {
        // Verificar que el pago pertenece al usuario
        if ($payment->user_id !== Auth::id()) {
            abort(403);
        }

        $payment->load('service');
        return view('client.payments.show', compact('payment'));
    }

    public function uploadProof(Request $request, Payment $payment)
    {
        // Verificar que el pago pertenece al usuario
        if ($payment->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'proof' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $path = $request->file('proof')->store('payments/proofs', 'public');
        
        $payment->update([
            'proof_url' => Storage::url($path),
            'status' => 'Procesando',
        ]);

        return back()->with('success', 'Comprobante subido exitosamente');
    }
}

