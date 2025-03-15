// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })


// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Change to your desired port
    strictPort: true, // Optional: Fails if port is already in use instead of auto-incrementing
  },
});

// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 3000, // Your desired port (already set)
//     strictPort: true, // Fails if port is in use (kept as is)
//     host: '0.0.0.0', // Allow access from any IP, not just localhost
//     allowedHosts: [
//       'localhost', // Default local access
      
//     ],
//   },
// });