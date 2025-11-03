<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('role:admin|superadmin');
    }

    public function index()
    {
        $services = Service::with('user')
            ->withCount('payments')
            ->orderBy('created_at', 'desc')
            ->paginate(15);
        
        return view('admin.services.index', compact('services'));
    }

    public function create()
    {
        $users = User::where('role', 'client')->where('status', 'active')->get();
        return view('admin.services.create', compact('users'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'service_number' => 'required|string|unique:services',
            'service_name' => 'required|string|max:255',
            'service_type' => 'required|string',
            'service_description' => 'nullable|string',
            'currency' => 'required|in:COP,USD',
            'amount' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'renewal_period' => 'nullable|string',
            'status' => 'required|in:activo,vencido,suspendido',
            'auto_renew' => 'boolean',
        ]);

        $validated['auto_renew'] = $request->has('auto_renew');

        Service::create($validated);

        return redirect()->route('admin.services.index')
            ->with('success', 'Servicio creado exitosamente');
    }

    public function show(Service $service)
    {
        $service->load(['user', 'payments']);
        return view('admin.services.show', compact('service'));
    }

    public function edit(Service $service)
    {
        $users = User::where('role', 'client')->where('status', 'active')->get();
        return view('admin.services.edit', compact('service', 'users'));
    }

    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'service_number' => 'required|string|unique:services,service_number,' . $service->id,
            'service_name' => 'required|string|max:255',
            'service_type' => 'required|string',
            'service_description' => 'nullable|string',
            'currency' => 'required|in:COP,USD',
            'amount' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'renewal_period' => 'nullable|string',
            'status' => 'required|in:activo,vencido,suspendido',
            'auto_renew' => 'boolean',
        ]);

        $validated['auto_renew'] = $request->has('auto_renew');

        $service->update($validated);

        return redirect()->route('admin.services.index')
            ->with('success', 'Servicio actualizado exitosamente');
    }

    public function destroy(Service $service)
    {
        $service->delete();
        
        return redirect()->route('admin.services.index')
            ->with('success', 'Servicio eliminado exitosamente');
    }
}

