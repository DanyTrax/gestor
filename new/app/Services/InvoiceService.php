<?php

namespace App\Services;

use App\Models\Payment;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class InvoiceService
{
    public function generateInvoice(Payment $payment): \Barryvdh\DomPDF\PDF
    {
        $payment->load(['user', 'service']);
        
        // Generar número de factura si no existe
        if (!$payment->invoice_number) {
            $payment->invoice_number = 'INV-' . strtoupper(substr($payment->id, -8));
            $payment->save();
        }

        $data = [
            'payment' => $payment,
            'user' => $payment->user,
            'service' => $payment->service,
            'company' => \App\Models\CompanySetting::getSettings(),
        ];

        $pdf = Pdf::loadView('invoices.pdf', $data);
        
        // Guardar PDF
        $filename = "invoices/{$payment->invoice_number}.pdf";
        Storage::disk('public')->put($filename, $pdf->output());
        
        $payment->update([
            'invoice_url' => Storage::url($filename),
        ]);

        return $pdf;
    }
}

