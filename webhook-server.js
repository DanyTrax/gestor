#!/usr/bin/env node
/**
 * Webhook server para actualizar automáticamente el stack en Dockge
 * cuando hay cambios en GitHub
 * 
 * Instalación:
 * npm install express body-parser
 * 
 * Ejecutar:
 * node webhook-server.js
 * 
 * O con PM2:
 * pm2 start webhook-server.js --name gestor-webhook
 */

const express = require('express');
const { exec } = require('child_process');
const crypto = require('crypto');
const app = express();

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'tu-secreto-aqui-cambiame';
const STACK_DIR = process.env.STACK_DIR || '/data/stacks/gestor-cobros';
const PORT = process.env.PORT || 3001;

// Middleware para parsear JSON
app.use(express.json());

// Middleware para verificar el webhook secret (opcional pero recomendado)
const verifySignature = (req, res, next) => {
  const signature = req.headers['x-hub-signature-256'];
  
  if (!signature) {
    return res.status(401).send('Missing signature');
  }

  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');

  if (signature !== digest) {
    return res.status(401).send('Invalid signature');
  }

  next();
};

// Endpoint para el webhook
app.post('/webhook', verifySignature, (req, res) => {
  const event = req.headers['x-github-event'];
  
  console.log(`[${new Date().toISOString()}] Webhook recibido: ${event}`);

  // Solo procesar eventos de push
  if (event !== 'push') {
    return res.status(200).send('Event ignored');
  }

  const branch = req.body.ref?.replace('refs/heads/', '');
  
  // Solo procesar si es el branch main
  if (branch !== 'main') {
    console.log(`Branch ${branch} ignorado, solo procesamos main`);
    return res.status(200).send(`Branch ${branch} ignored`);
  }

  console.log(`Iniciando actualización del stack en ${STACK_DIR}...`);

  // Ejecutar git pull y rebuild
  const commands = [
    `cd ${STACK_DIR}`,
    'git pull origin main',
    'docker-compose build --no-cache',
    'docker-compose up -d'
  ].join(' && ');

  exec(commands, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error ejecutando comandos: ${error}`);
      console.error(`stderr: ${stderr}`);
      return res.status(500).json({ 
        error: 'Failed to update',
        message: error.message,
        stderr: stderr 
      });
    }

    console.log(`✅ Stack actualizado exitosamente`);
    console.log(`stdout: ${stdout}`);
    
    res.status(200).json({ 
      success: true,
      message: 'Stack updated successfully',
      output: stdout 
    });
  });
});

// Endpoint de health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Webhook server corriendo en puerto ${PORT}`);
  console.log(`📁 Stack directory: ${STACK_DIR}`);
  console.log(`🔗 Endpoint: http://localhost:${PORT}/webhook`);
  console.log(`\n⚠️  No olvides configurar WEBHOOK_SECRET en GitHub!`);
});

