<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Service;
use App\Services\InvoiceService;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('role:admin|superadmin');
    }

    public function index(Request $request)
    {
        $query = Payment::with(['user', 'service']);

        // Filtros
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('payment_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function($q) use ($search) {
                      $q->where('email', 'like', "%{$search}%")
                        ->orWhere('full_name', 'like', "%{$search}%");
                  });
            });
        }

        $payments = $query->orderBy('created_at', 'desc')->paginate(15);

        return view('admin.payments.index', compact('payments'));
    }

    public function show(Payment $payment)
    {
        $payment->load(['user', 'service']);
        return view('admin.payments.show', compact('payment'));
    }

    public function updateStatus(Request $request, Payment $payment)
    {
        $validated = $request->validate([
            'status' => 'required|in:Pendiente,Procesando,Completado,Fallido,Cancelado',
        ]);

        $payment->update(['status' => $validated['status']]);

        // Si se aprueba, generar factura y actualizar servicio
        if ($validated['status'] === 'Completado') {
            $invoiceService = new InvoiceService();
            $invoice = $invoiceService->generateInvoice($payment);
            
            $payment->service->update(['status' => 'activo']);
        }

        return back()->with('success', 'Estado del pago actualizado');
    }

    public function generateInvoice(Payment $payment)
    {
        $invoiceService = new InvoiceService();
        $pdf = $invoiceService->generateInvoice($payment);
        
        return $pdf->download("factura-{$payment->invoice_number}.pdf");
    }

    public function destroy(Payment $payment)
    {
        $payment->delete();
        
        return redirect()->route('admin.payments.index')
            ->with('success', 'Pago eliminado exitosamente');
    }
}

