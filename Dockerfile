# Multi-stage build para Gestor de Cobros

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Construir aplicación
RUN npm run build

# Stage 2: Production - PHP + Apache
FROM php:8.2-apache

# Instalar extensiones PHP necesarias y Composer
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd \
    && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Habilitar mod_rewrite para SPA routing
RUN a2enmod rewrite

# Configurar Apache para SPA
RUN echo '<VirtualHost *:80>\n\
    ServerAdmin webmaster@localhost\n\
    DocumentRoot /var/www/html\n\
    \n\
    <Directory /var/www/html>\n\
        Options Indexes FollowSymLinks\n\
        AllowOverride All\n\
        Require all granted\n\
        \n\
        # SPA routing - redirigir todo a index.html\n\
        RewriteEngine On\n\
        RewriteBase /\n\
        RewriteRule ^index\.html$ - [L]\n\
        RewriteCond %{REQUEST_FILENAME} !-f\n\
        RewriteCond %{REQUEST_FILENAME} !-d\n\
        RewriteRule . /index.html [L]\n\
    </Directory>\n\
    \n\
    # Configurar tipos MIME\n\
    AddType application/javascript .js .mjs\n\
    AddType text/css .css\n\
    AddType image/svg+xml .svg\n\
    \n\
    ErrorLog ${APACHE_LOG_DIR}/error.log\n\
    CustomLog ${APACHE_LOG_DIR}/access.log combined\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

# Copiar archivos construidos desde builder
COPY --from=builder /app/dist /var/www/html

# Copiar upload.php y send-email.php
COPY upload.php /var/www/html/
COPY send-email.php /var/www/html/

# Copiar composer.json e instalar PHPMailer
COPY composer.json /var/www/html/
RUN cd /var/www/html && composer install --no-dev --optimize-autoloader

# Copiar .htaccess si existe (para SPA routing)
# El .htaccess se copia desde dist si existe, o se crea en Apache config

# Crear directorio uploads y configurar permisos
RUN mkdir -p /var/www/html/uploads/payments && \
    chown -R www-data:www-data /var/www/html/uploads && \
    chmod -R 775 /var/www/html/uploads

# Crear .htaccess para uploads (seguridad)
RUN echo '<FilesMatch "\.(php|phtml|php3|php4|php5|php7|phps|cgi|pl|py|rb|asp|aspx|shtml|shtm|fcgi|fpl|jsp|js|mjs|css)$">\n\
    Require all denied\n\
</FilesMatch>\n\
<FilesMatch "\.(jpg|jpeg|png|gif|pdf|webp|svg)$">\n\
    Require all granted\n\
</FilesMatch>\n\
AddType image/jpeg .jpg .jpeg\n\
AddType image/png .png\n\
AddType application/pdf .pdf\n\
AddType image/svg+xml .svg' > /var/www/html/uploads/.htaccess

# Configurar permisos
RUN chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html

EXPOSE 80

CMD ["apache2-foreground"]

