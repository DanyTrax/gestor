<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('role:admin|superadmin');
    }

    public function index()
    {
        $users = User::withCount(['services', 'payments', 'tickets'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);
        
        return view('admin.users.index', compact('users'));
    }

    public function create()
    {
        return view('admin.users.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'identification' => 'nullable|string',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'role' => 'required|in:superadmin,admin,client',
            'status' => 'required|in:active,inactive,pending',
            'password' => 'required|min:6',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['is_profile_complete'] = true;

        User::create($validated);

        return redirect()->route('admin.users.index')
            ->with('success', 'Usuario creado exitosamente');
    }

    public function show(User $user)
    {
        $user->load(['services', 'payments', 'tickets']);
        return view('admin.users.show', compact('user'));
    }

    public function edit(User $user)
    {
        return view('admin.users.edit', compact('user'));
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'identification' => 'nullable|string',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'role' => 'required|in:superadmin,admin,client',
            'status' => 'required|in:active,inactive,pending',
            'password' => 'nullable|min:6',
        ]);

        if ($request->filled('password')) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return redirect()->route('admin.users.index')
            ->with('success', 'Usuario actualizado exitosamente');
    }

    public function destroy(User $user)
    {
        $user->delete();
        
        return redirect()->route('admin.users.index')
            ->with('success', 'Usuario eliminado exitosamente');
    }

    public function activate(User $user)
    {
        $user->update(['status' => 'active']);
        
        return back()->with('success', 'Usuario activado exitosamente');
    }

    public function deactivate(User $user)
    {
        $user->update(['status' => 'inactive']);
        
        return back()->with('success', 'Usuario desactivado exitosamente');
    }
}

