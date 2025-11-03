import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Nota: si despliegas en la raíz del dominio en cPanel, `base` debe ser '/'.
// Si usas un subdirectorio (p. ej. dominio apunta a public_html/clients/),
// cambia a '/clients/'. Luego ejecuta `npm run build` y sube la carpeta dist.
export default defineConfig({
  base: '/',
  plugins: [react()],
})
