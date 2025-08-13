#!/usr/bin/env node

/**
 * Script para generar iconos de la PWA
 * Este script crea iconos en diferentes tamaños para la PWA
 */

const fs = require('fs');
const path = require('path');

// Configuración de iconos
const iconSizes = [
  16, 32, 72, 96, 128, 144, 152, 192, 384, 512
];

// SVG base para el icono (un tambor simple)
const iconSVG = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
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
  <circle cx="256" cy="256" r="240" fill="url(#bg)" stroke="#2d2d2d" stroke-width="8"/>
  
  <!-- Tambor principal -->
  <circle cx="256" cy="256" r="120" fill="url(#drum)" stroke="#2d2d2d" stroke-width="4"/>
  
  <!-- Detalles del tambor -->
  <circle cx="256" cy="256" r="100" fill="none" stroke="#4a90e2" stroke-width="3"/>
  <circle cx="256" cy="256" r="80" fill="none" stroke="#4a90e2" stroke-width="2"/>
  
  <!-- Baquetas -->
  <line x1="180" y1="180" x2="220" y2="220" stroke="#8B4513" stroke-width="8" stroke-linecap="round"/>
  <line x1="332" y1="180" x2="292" y2="220" stroke="#8B4513" stroke-width="8" stroke-linecap="round"/>
  
  <!-- Notas musicales -->
  <g fill="#4a90e2">
    <circle cx="120" cy="120" r="8"/>
    <rect x="116" y="128" width="8" height="20"/>
    <circle cx="392" cy="120" r="8"/>
    <rect x="388" y="128" width="8" height="20"/>
  </g>
  
  <!-- Ondas de sonido -->
  <g fill="none" stroke="#4a90e2" stroke-width="2" opacity="0.6">
    <path d="M 80 256 Q 120 216 160 256 Q 200 296 240 256"/>
    <path d="M 272 256 Q 312 216 352 256 Q 392 296 432 256"/>
  </g>
</svg>
`;

// Función para crear un icono simple usando Canvas API
function createIcon(size) {
  const canvas = require('canvas');
  const c = canvas.createCanvas(size, size);
  const ctx = c.getContext('2d');
  
  // Fondo
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#4a90e2');
  gradient.addColorStop(1, '#357abd');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Círculo central (tambor)
  const center = size / 2;
  const radius = size * 0.3;
  
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.strokeStyle = '#2d2d2d';
  ctx.lineWidth = Math.max(1, size * 0.01);
  ctx.stroke();
  
  // Detalles del tambor
  ctx.strokeStyle = '#4a90e2';
  ctx.lineWidth = Math.max(1, size * 0.005);
  
  ctx.beginPath();
  ctx.arc(center, center, radius * 0.8, 0, 2 * Math.PI);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(center, center, radius * 0.6, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Baquetas
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = Math.max(2, size * 0.02);
  ctx.lineCap = 'round';
  
  ctx.beginPath();
  ctx.moveTo(center - radius * 0.6, center - radius * 0.6);
  ctx.lineTo(center - radius * 0.3, center - radius * 0.3);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(center + radius * 0.6, center - radius * 0.6);
  ctx.lineTo(center + radius * 0.3, center - radius * 0.3);
  ctx.stroke();
  
  return c.toBuffer('image/png');
}

// Función para crear iconos usando librería sharp (más profesional)
async function createIconWithSharp(size) {
  try {
    const sharp = require('sharp');
    
    // Crear un SVG del tamaño especificado
    const svgBuffer = Buffer.from(iconSVG.replace('512', size.toString()));
    
    // Convertir SVG a PNG
    const pngBuffer = await sharp(svgBuffer)
      .png()
      .toBuffer();
    
    return pngBuffer;
  } catch (error) {
    console.log(`Sharp no disponible, usando Canvas para ${size}x${size}`);
    return createIcon(size);
  }
}

// Función principal
async function generateIcons() {
  console.log('🎨 Generando iconos para BeatBot2k PWA...');
  
  const iconsDir = path.join(__dirname, '../public/icons');
  
  // Crear directorio si no existe
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  
  // Generar iconos
  for (const size of iconSizes) {
    try {
      console.log(`Generando icono ${size}x${size}...`);
      
      let iconBuffer;
      try {
        iconBuffer = await createIconWithSharp(size);
      } catch (error) {
        iconBuffer = createIcon(size);
      }
      
      const filename = `icon-${size}x${size}.png`;
      const filepath = path.join(iconsDir, filename);
      
      fs.writeFileSync(filepath, iconBuffer);
      console.log(`✅ ${filename} generado`);
      
    } catch (error) {
      console.error(`❌ Error generando icono ${size}x${size}:`, error.message);
    }
  }
  
  // Crear iconos especiales
  try {
    console.log('Generando iconos especiales...');
    
    // Icono de play
    const playIcon = createIcon(96);
    fs.writeFileSync(path.join(iconsDir, 'play-96x96.png'), playIcon);
    console.log('✅ play-96x96.png generado');
    
    // Icono de nueva sesión
    const newIcon = createIcon(96);
    fs.writeFileSync(path.join(iconsDir, 'new-96x96.png'), newIcon);
    console.log('✅ new-96x96.png generado');
    
    // Favicon
    const favicon = createIcon(32);
    fs.writeFileSync(path.join(iconsDir, 'icon-32x32.png'), favicon);
    console.log('✅ icon-32x32.png generado');
    
    // Apple touch icon
    const appleIcon = createIcon(180);
    fs.writeFileSync(path.join(iconsDir, 'icon-180x180.png'), appleIcon);
    console.log('✅ icon-180x180.png generado');
    
  } catch (error) {
    console.error('❌ Error generando iconos especiales:', error.message);
  }
  
  console.log('\n🎉 ¡Iconos generados exitosamente!');
  console.log(`📁 Ubicación: ${iconsDir}`);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generateIcons().catch(console.error);
}

module.exports = { generateIcons };
