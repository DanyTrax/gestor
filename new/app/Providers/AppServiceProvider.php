<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Registrar middleware de roles
        $this->app['router']->aliasMiddleware('role', \App\Http\Middleware\CheckRole::class);
    }
}

