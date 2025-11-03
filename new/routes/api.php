<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\v1\AuthController;
use App\Http\Controllers\Api\v1\UserController;
use App\Http\Controllers\Api\v1\ServiceController;
use App\Http\Controllers\Api\v1\PaymentController;

/*
|--------------------------------------------------------------------------
| API Routes - REST API
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    
    // Rutas públicas
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Rutas protegidas
    Route::middleware('auth:sanctum')->group(function () {
        
        // Autenticación
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);

        // Usuarios (solo admin)
        Route::middleware('role:admin|superadmin')->prefix('users')->group(function () {
            Route::get('/', [UserController::class, 'index']);
            Route::post('/', [UserController::class, 'store']);
            Route::get('/{user}', [UserController::class, 'show']);
            Route::put('/{user}', [UserController::class, 'update']);
            Route::delete('/{user}', [UserController::class, 'destroy']);
        });

        // Servicios
        Route::prefix('services')->group(function () {
            Route::get('/', [ServiceController::class, 'index']);
            Route::get('/{service}', [ServiceController::class, 'show']);
            
            // Solo admin puede crear/editar/eliminar
            Route::middleware('role:admin|superadmin')->group(function () {
                Route::post('/', [ServiceController::class, 'store']);
                Route::put('/{service}', [ServiceController::class, 'update']);
                Route::delete('/{service}', [ServiceController::class, 'destroy']);
            });
        });

        // Pagos
        Route::prefix('payments')->group(function () {
            Route::get('/', [PaymentController::class, 'index']);
            Route::get('/{payment}', [PaymentController::class, 'show']);
            Route::post('/', [PaymentController::class, 'store']);
            Route::post('/{payment}/proof', [PaymentController::class, 'uploadProof']);
            
            // Solo admin puede actualizar estado
            Route::middleware('role:admin|superadmin')->group(function () {
                Route::put('/{payment}/status', [PaymentController::class, 'updateStatus']);
                Route::get('/{payment}/invoice', [PaymentController::class, 'generateInvoice']);
            });
        });
    });
});

