<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Web\Auth\LoginController;
use App\Http\Controllers\Web\Auth\RegisterController;
use App\Http\Controllers\Web\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Web\Admin\UserController;
use App\Http\Controllers\Web\Admin\ServiceController;
use App\Http\Controllers\Web\Admin\PaymentController;
use App\Http\Controllers\Web\Client\DashboardController as ClientDashboardController;
use App\Http\Controllers\Web\Client\PaymentController as ClientPaymentController;

/*
|--------------------------------------------------------------------------
| Web Routes - MVC Routes
|--------------------------------------------------------------------------
*/

// Rutas de autenticación
Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

Route::get('/register', [RegisterController::class, 'showRegistrationForm'])->name('register');
Route::post('/register', [RegisterController::class, 'register']);

// Rutas protegidas
Route::middleware(['auth'])->group(function () {
    
    // Dashboard según rol
    Route::get('/dashboard', function () {
        if (auth()->user()->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }
        return redirect()->route('client.dashboard');
    })->name('dashboard');

    // Rutas de Administrador
    Route::prefix('admin')->middleware('role:admin|superadmin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        
        // Usuarios
        Route::resource('users', UserController::class);
        Route::post('/users/{user}/activate', [UserController::class, 'activate'])->name('users.activate');
        Route::post('/users/{user}/deactivate', [UserController::class, 'deactivate'])->name('users.deactivate');
        
        // Servicios
        Route::resource('services', ServiceController::class);
        
        // Pagos
        Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
        Route::get('/payments/{payment}', [PaymentController::class, 'show'])->name('payments.show');
        Route::put('/payments/{payment}/status', [PaymentController::class, 'updateStatus'])->name('payments.update-status');
        Route::get('/payments/{payment}/invoice', [PaymentController::class, 'generateInvoice'])->name('payments.invoice');
        Route::delete('/payments/{payment}', [PaymentController::class, 'destroy'])->name('payments.destroy');
    });

    // Rutas de Cliente
    Route::prefix('client')->middleware('role:client')->name('client.')->group(function () {
        Route::get('/dashboard', [ClientDashboardController::class, 'index'])->name('dashboard');
        
        // Pagos
        Route::get('/payments', [ClientPaymentController::class, 'index'])->name('payments.index');
        Route::get('/payments/create', [ClientPaymentController::class, 'create'])->name('payments.create');
        Route::post('/payments', [ClientPaymentController::class, 'store'])->name('payments.store');
        Route::get('/payments/{payment}', [ClientPaymentController::class, 'show'])->name('payments.show');
        Route::post('/payments/{payment}/proof', [ClientPaymentController::class, 'uploadProof'])->name('payments.upload-proof');
    });
});

// Ruta raíz
Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
});

