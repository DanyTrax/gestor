# Instalar Composer Localmente

## 🍎 macOS (tu sistema)

### Opción A: Homebrew (Recomendado)

```bash
# Instalar Homebrew si no lo tienes
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Composer
brew install composer
```

### Opción B: Descarga Directa

```bash
# Descargar e instalar Composer
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
php -r "unlink('composer-setup.php');"

# Mover a /usr/local/bin para que esté disponible globalmente
sudo mv composer.phar /usr/local/bin/composer
chmod +x /usr/local/bin/composer
```

## 🪟 Windows

1. Descargar desde: https://getcomposer.org/download/
2. Ejecutar el instalador
3. Seguir las instrucciones

## 🐧 Linux

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install composer

# O descarga directa
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
sudo mv composer.phar /usr/local/bin/composer
```

## ✅ Verificar Instalación

```bash
composer --version
```

Debería mostrar: `Composer version X.X.X`

## 🚀 Después de Instalar Composer

Ejecutar el script:

```bash
./scripts/install-laravel-complete.sh
```

---

¿Quieres instalar Composer ahora o prefieres hacerlo manualmente?

