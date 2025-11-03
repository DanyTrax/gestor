#!/bin/bash
# Script para configurar el webhook server automáticamente

echo "🔧 Configurando webhook server para actualización automática..."

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Instálalo primero."
    exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install express

# Generar secret aleatorio
SECRET=$(openssl rand -hex 32)
echo "🔑 Secret generado: $SECRET"

# Crear archivo .env
cat > .env << EOF
WEBHOOK_SECRET=$SECRET
STACK_DIR=/data/stacks/gestor-cobros
PORT=3001
EOF

echo "✅ Configuración completada!"
echo ""
echo "📝 Siguiente paso: Configura el webhook en GitHub:"
echo "   URL: http://tu-servidor:3001/webhook"
echo "   Secret: $SECRET"
echo "   Content type: application/json"
echo "   Events: Solo 'push'"
echo ""
echo "🚀 Para iniciar el servidor:"
echo "   node webhook-server.js"
echo ""
echo "   O con PM2 (recomendado):"
echo "   npm install -g pm2"
echo "   pm2 start webhook-server.js --name gestor-webhook"
echo "   pm2 save"

