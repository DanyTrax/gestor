<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\InvoiceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PaymentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request)
    {
        $query = Payment::with(['user', 'service']);

        // Clientes solo ven sus pagos
        if (Auth::user()->role === 'client') {
            $query->where('user_id', Auth::id());
        }

        // Filtros
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $payments = $query->orderBy('created_at', 'desc')->get();

        return response()->json($payments);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_id' => 'required|exists:services,id',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'required|string',
            'proof' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $service = \App\Models\Service::findOrFail($validated['service_id']);

        // Verificar que el servicio pertenece al usuario (si es cliente)
        if (Auth::user()->role === 'client' && $service->user_id !== Auth::id()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $payment = Payment::create([
            'user_id' => $service->user_id,
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

        return response()->json($payment, 201);
    }

    public function show(Payment $payment)
    {
        // Clientes solo pueden ver sus pagos
        if (Auth::user()->role === 'client' && $payment->user_id !== Auth::id()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $payment->load(['user', 'service']);
        return response()->json($payment);
    }

    public function uploadProof(Request $request, Payment $payment)
    {
        // Verificar que el pago pertenece al usuario
        if (Auth::user()->role === 'client' && $payment->user_id !== Auth::id()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'proof' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $path = $request->file('proof')->store('payments/proofs', 'public');
        
        $payment->update([
            'proof_url' => Storage::url($path),
            'status' => 'Procesando',
        ]);

        return response()->json($payment);
    }

    public function updateStatus(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'status' => 'required|in:Pendiente,Procesando,Completado,Fallido,Cancelado',
        ]);

        $payment->update(['status' => $validated['status']]);

        // Si se aprueba, generar factura
        if ($validated['status'] === 'Completado') {
            $invoiceService = new InvoiceService();
            $invoiceService->generateInvoice($payment);
            
            $payment->service->update(['status' => 'activo']);
        }

        return response()->json($payment);
    }

    public function generateInvoice(Payment $payment)
    {
        $invoiceService = new InvoiceService();
        $pdf = $invoiceService->generateInvoice($payment);
        
        return response($pdf->output(), 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', "attachment; filename=factura-{$payment->invoice_number}.pdf");
    }
}

