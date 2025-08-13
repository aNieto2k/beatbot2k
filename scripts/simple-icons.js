#!/usr/bin/env node

/**
 * Script simple para generar iconos básicos de la PWA
 * Usa solo Node.js nativo sin dependencias externas
 */

const fs = require('fs');
const path = require('path');

// Configuración de iconos
const iconSizes = [
  16, 32, 72, 96, 128, 144, 152, 192, 384, 512
];

// Función para crear un icono simple como SVG
function createSVGIcon(size) {
  const center = size / 2;
  const radius = size * 0.3;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4a90e2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#357abd;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="drum" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f0f0f0;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fondo circular -->
  <circle cx="${center}" cy="${center}" r="${size * 0.45}" fill="url(#bg)" stroke="#2d2d2d" stroke-width="${Math.max(1, size * 0.02)}"/>
  
  <!-- Tambor principal -->
  <circle cx="${center}" cy="${center}" r="${radius}" fill="url(#drum)" stroke="#2d2d2d" stroke-width="${Math.max(1, size * 0.01)}"/>
  
  <!-- Detalles del tambor -->
  <circle cx="${center}" cy="${center}" r="${radius * 0.8}" fill="none" stroke="#4a90e2" stroke-width="${Math.max(1, size * 0.008)}"/>
  <circle cx="${center}" cy="${center}" r="${radius * 0.6}" fill="none" stroke="#4a90e2" stroke-width="${Math.max(1, size * 0.005)}"/>
  
  <!-- Baquetas -->
  <line x1="${center - radius * 0.6}" y1="${center - radius * 0.6}" x2="${center - radius * 0.3}" y2="${center - radius * 0.3}" stroke="#8B4513" stroke-width="${Math.max(2, size * 0.04)}" stroke-linecap="round"/>
  <line x1="${center + radius * 0.6}" y1="${center - radius * 0.6}" x2="${center + radius * 0.3}" y2="${center - radius * 0.3}" stroke="#8B4513" stroke-width="${Math.max(2, size * 0.04)}" stroke-linecap="round"/>
  
  <!-- Notas musicales -->
  <g fill="#4a90e2">
    <circle cx="${size * 0.23}" cy="${size * 0.23}" r="${Math.max(2, size * 0.02)}"/>
    <rect x="${size * 0.23 - 2}" y="${size * 0.25}" width="${Math.max(2, size * 0.04)}" height="${Math.max(5, size * 0.04)}"/>
    <circle cx="${size * 0.77}" cy="${size * 0.23}" r="${Math.max(2, size * 0.02)}"/>
    <rect x="${size * 0.77 - 2}" y="${size * 0.25}" width="${Math.max(2, size * 0.04)}" height="${Math.max(5, size * 0.04)}"/>
  </g>
  
  <!-- Ondas de sonido -->
  <g fill="none" stroke="#4a90e2" stroke-width="${Math.max(1, size * 0.005)}" opacity="0.6">
    <path d="M ${size * 0.16} ${center} Q ${size * 0.23} ${center - size * 0.08} ${size * 0.31} ${center} Q ${size * 0.39} ${center + size * 0.08} ${size * 0.47} ${center}"/>
    <path d="M ${size * 0.53} ${center} Q ${size * 0.61} ${center - size * 0.08} ${size * 0.69} ${center} Q ${size * 0.77} ${center + size * 0.08} ${size * 0.84} ${center}"/>
  </g>
</svg>`;
}

// Función para crear iconos especiales
function createSpecialIcon(size, type) {
  const center = size / 2;
  const radius = size * 0.3;
  
  if (type === 'play') {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#28a745;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#218838;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fondo circular -->
  <circle cx="${center}" cy="${center}" r="${size * 0.45}" fill="url(#bg)" stroke="#2d2d2d" stroke-width="${Math.max(1, size * 0.02)}"/>
  
  <!-- Triángulo de play -->
  <polygon points="${center - radius * 0.3},${center - radius * 0.4} ${center - radius * 0.3},${center + radius * 0.4} ${center + radius * 0.4},${center}" fill="white"/>
</svg>`;
  }
  
  if (type === 'new') {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ffc107;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e0a800;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fondo circular -->
  <circle cx="${center}" cy="${center}" r="${size * 0.45}" fill="url(#bg)" stroke="#2d2d2d" stroke-width="${Math.max(1, size * 0.02)}"/>
  
  <!-- Símbolo de plus -->
  <rect x="${center - radius * 0.2}" y="${center - radius * 0.6}" width="${radius * 0.4}" height="${radius * 1.2}" fill="white" rx="${radius * 0.1}"/>
  <rect x="${center - radius * 0.6}" y="${center - radius * 0.2}" width="${radius * 1.2}" height="${radius * 0.4}" fill="white" rx="${radius * 0.1}"/>
</svg>`;
  }
  
  return createSVGIcon(size);
}

// Función principal
function generateIcons() {
  console.log('🎨 Generando iconos SVG para BeatBot2k PWA...');
  
  const iconsDir = path.join(__dirname, '../public/icons');
  
  // Crear directorio si no existe
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  
  // Generar iconos principales
  for (const size of iconSizes) {
    try {
      console.log(`Generando icono ${size}x${size}...`);
      
      const svgContent = createSVGIcon(size);
      const filename = `icon-${size}x${size}.svg`;
      const filepath = path.join(iconsDir, filename);
      
      fs.writeFileSync(filepath, svgContent);
      console.log(`✅ ${filename} generado`);
      
    } catch (error) {
      console.error(`❌ Error generando icono ${size}x${size}:`, error.message);
    }
  }
  
  // Generar iconos especiales
  try {
    console.log('Generando iconos especiales...');
    
    // Icono de play
    const playIcon = createSpecialIcon(96, 'play');
    fs.writeFileSync(path.join(iconsDir, 'play-96x96.svg'), playIcon);
    console.log('✅ play-96x96.svg generado');
    
    // Icono de nueva sesión
    const newIcon = createSpecialIcon(96, 'new');
    fs.writeFileSync(path.join(iconsDir, 'new-96x96.svg'), newIcon);
    console.log('✅ new-96x96.svg generado');
    
    // Iconos adicionales
    const additionalSizes = [16, 32, 180];
    for (const size of additionalSizes) {
      const icon = createSVGIcon(size);
      const filename = `icon-${size}x${size}.svg`;
      const filepath = path.join(iconsDir, filename);
      fs.writeFileSync(filepath, icon);
      console.log(`✅ ${filename} generado`);
    }
    
  } catch (error) {
    console.error('❌ Error generando iconos especiales:', error.message);
  }
  
  console.log('\n🎉 ¡Iconos SVG generados exitosamente!');
  console.log(`📁 Ubicación: ${iconsDir}`);
  console.log('💡 Nota: Los iconos están en formato SVG. Para PNG, puedes usar herramientas online o convertir manualmente.');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generateIcons();
}

module.exports = { generateIcons };
