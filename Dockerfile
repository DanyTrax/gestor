# ----------------------------------------------------
# ETAPA 1: CONSTRUCCIÓN DEL FRONTEND (React)
# ----------------------------------------------------
    FROM node:20-alpine AS frontend-builder

    WORKDIR /app
    
    # Copiar archivos esenciales para la compilación
    COPY package*.json ./
    COPY . .
    
    # Instalar y compilar React (output: /app/dist)
    RUN npm install
    RUN npm run build
    
    
    # ----------------------------------------------------
    # ETAPA 2: SERVIDOR HÍBRIDO (PHP + Apache)
    # Usaremos una imagen oficial de PHP con Apache
    # ----------------------------------------------------
    FROM php:8.2-apache
    
    # 1. Instalar dependencias esenciales
    RUN apt-get update && apt-get install -y \
        git \
        unzip \
        libzip-dev \
        # Limpiar cache
        && rm -rf /var/lib/apt/lists/*
    
    # 2. Configurar el módulo Apache rewrite (necesario para React Router)
    RUN a2enmod rewrite
    
    # 3. Descargar dependencias de PHP (PHPMailer)
    # Como usas PHPMailer y es una dependencia, instalaremos Composer.
    RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
    
    # Crea un composer.json temporal para PHPMailer si no lo tienes
    # Si ya tienes el composer.json, omite la línea RUN y solo COPIA y ejecuta composer install
    RUN echo '{"require": {"phpmailer/phpmailer": "^6.8"}}' > /tmp/composer.json
    RUN cd /tmp && composer install --no-dev --optimize-autoloader
    
    # ----------------------------------------------------
    # 4. COPIAR ARCHIVOS DEL PROYECTO
    # El directorio de servicio en Apache es /var/www/html
    # ----------------------------------------------------
    WORKDIR /var/www/html
    
    # A. Copiar el PHP y la carpeta uploads
    # Esto incluye send-email.php, upload.php, uploads/
    COPY send-email.php upload.php uploads/ ./
    # Si tienes una carpeta 'vendor' con PHPMailer, cópiala
    # COPY vendor/ ./vendor/ 
    
    # B. Copiar los archivos compilados de React desde la etapa 'frontend-builder'
    # Los archivos de React deben ir a la raíz del servidor
    COPY --from=frontend-builder /app/dist/ ./
    
    # C. Copiar los archivos PHP de PHPMailer (desde la instalación temporal)
    COPY --from=/tmp/vendor/ /var/www/html/vendor/ ./vendor/
    
    # 5. Configurar Apache para React Router (index.html)
    # Si no usas .htaccess, crea uno en la raíz de tu repo
    COPY .htaccess /var/www/html/
    
    # Exponer el puerto predeterminado de Apache
    EXPOSE 80
    
    # Apache ya se inicia automáticamente