<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();
        
        // Si es superadmin, permitir todo
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        // Verificar si el usuario tiene alguno de los roles requeridos
        if (!in_array($user->role, $roles)) {
            abort(403, 'No tienes permisos para acceder a esta página');
        }

        return $next($request);
    }
}

