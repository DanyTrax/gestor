<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ServiceController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    public function index(Request $request)
    {
        $query = Service::with('user');

        // Clientes solo ven sus servicios
        if (Auth::user()->role === 'client') {
            $query->where('user_id', Auth::id());
        }

        $services = $query->get();
        return response()->json($services);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'service_number' => 'required|string|unique:services',
            'service_name' => 'required|string|max:255',
            'service_type' => 'required|string',
            'currency' => 'required|in:COP,USD',
            'amount' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'required|in:activo,vencido,suspendido',
        ]);

        $service = Service::create($validated);

        return response()->json($service, 201);
    }

    public function show(Service $service)
    {
        // Clientes solo pueden ver sus servicios
        if (Auth::user()->role === 'client' && $service->user_id !== Auth::id()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $service->load(['user', 'payments']);
        return response()->json($service);
    }

    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'service_name' => 'sometimes|string|max:255',
            'service_type' => 'sometimes|string',
            'currency' => 'sometimes|in:COP,USD',
            'amount' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:activo,vencido,suspendido',
        ]);

        $service->update($validated);

        return response()->json($service);
    }

    public function destroy(Service $service)
    {
        $service->delete();
        return response()->json(['message' => 'Servicio eliminado exitosamente']);
    }
}

