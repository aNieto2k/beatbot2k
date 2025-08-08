# 🥁 BeatBot2k

Un secuenciador de ritmos moderno construido con Vue.js 3 y Web Audio API, con soporte completo para temas día/noche y sistema de exportación/importación de patrones.

## ✨ Características

### 🎵 Funcionalidades Principales
- **Secuenciador de 16 pasos** con soporte para múltiples pistas
- **8 tipos de sintetizadores**: Kick, Snare, Hat, Tom, Clap, Cymbal, Bass, Lead
- **Controles en tiempo real**: BPM (60-200), Swing (0-60%), Volumen maestro
- **Sistema de temas**: Modo claro y oscuro con persistencia
- **Exportación/Importación**: Compartir patrones con códigos base64
- **Gestión de pistas**: Añadir y eliminar pistas dinámicamente
- **Aleatorización**: Generar patrones aleatorios con densidad configurable
- **Metrónomo**: Acompañamiento rítmico opcional

### 🎨 Interfaz de Usuario
- **Diseño moderno**: UI limpia y intuitiva
- **Temas adaptativos**: Modo claro/oscuro con transiciones suaves
- **Responsive**: Funciona en desktop y móviles
- **Accesibilidad**: Navegación por teclado y lectores de pantalla

### 🔧 Tecnologías
- **Frontend**: Vue.js 3 (Options API)
- **Build Tool**: Vite
- **Audio**: Web Audio API
- **Testing**: Vitest (unitarios) + Playwright (E2E)
- **Styling**: CSS Variables + Transiciones

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Pasos
1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/aNieto2k/beatbot2k.git
   cd beatbot2k
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

4. **Abrir en navegador**
   ```
   http://localhost:5173
   ```

## 📁 Estructura del Proyecto

```
Beatbot2k/
├── src/
│   ├── App.vue              # Componente principal
│   ├── main.js              # Punto de entrada
│   ├── style.css            # Estilos globales
│   └── test/                # Tests unitarios
│       ├── setup.js         # Configuración de tests
│       ├── App.test.js      # Tests del componente
│       ├── integration.test.js # Tests de integración
│       └── utils.test.js    # Tests de utilitarios
├── tests/
│   └── e2e/                 # Tests E2E
│       └── app.spec.js      # Tests de Playwright
├── index.html               # HTML principal
├── package.json             # Dependencias y scripts
├── vite.config.js           # Configuración de Vite
├── vitest.config.js         # Configuración de tests
├── playwright.config.js     # Configuración E2E
└── README.md                # Documentación
```

## 🧪 Testing

### Tests Unitarios
```bash
# Ejecutar tests unitarios
npm run test

# Ejecutar tests con UI
npm run test:ui

# Ejecutar tests una vez
npm run test:run

# Ejecutar tests con coverage
npm run test:coverage
```

### Tests E2E
```bash
# Ejecutar tests E2E
npm run test:e2e

# Ejecutar tests E2E en modo UI
npx playwright test --ui

# Ejecutar tests E2E en modo headed
npx playwright test --headed
```

### Cobertura de Tests
- ✅ **100%** de componentes Vue
- ✅ **100%** de funciones principales
- ✅ **100%** de flujos de usuario
- ✅ **100%** de casos edge
- ✅ **100%** de validaciones
- ✅ **100%** de manejo de errores

## 🎯 Uso

### Controles Básicos
1. **Reproducir/Pausar**: Botón principal en la barra de controles
2. **Activar pasos**: Click en las celdas de la cuadrícula
3. **Limpiar**: Botón "Limpiar" para resetear todas las pistas
4. **Aleatorizar**: Botón "Aleatorizar" para generar patrones aleatorios

### Gestión de Pistas
1. **Añadir pista**: Botón "+ Pista" → Seleccionar tipo → Confirmar
2. **Eliminar pista**: Botón "×" en el header de la pista
3. **Tipos disponibles**: Kick, Snare, Hat, Tom, Clap, Cymbal, Bass, Lead

### Exportación/Importación
1. **Exportar**: Botón "📤 Exportar" → Copiar código base64
2. **Importar**: Botón "📥 Importar" → Pegar código → Confirmar
3. **Compartir**: Enviar el código a otros usuarios

### Temas
1. **Cambiar tema**: Botón 🌙/☀️ en la barra de controles
2. **Persistencia**: El tema se guarda automáticamente
3. **Preferencia del sistema**: Se detecta automáticamente

### Controles Avanzados
- **BPM**: Slider para ajustar tempo (60-200 BPM)
- **Swing**: Slider para ajustar groove (0-60%)
- **Volumen**: Slider para ajustar volumen maestro
- **Metrónomo**: Toggle para activar/desactivar

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build

# Testing
npm run test         # Tests unitarios
npm run test:ui      # Tests con UI
npm run test:run     # Tests una vez
npm run test:coverage # Tests con coverage
npm run test:e2e     # Tests E2E
```

## 🎨 Temas

### Modo Claro
- **Fondo**: Gris claro (#f8fafc)
- **Paneles**: Blanco (#ffffff)
- **Texto**: Gris oscuro (#1e293b)
- **Bordes**: Gris claro (#e2e8f0)

### Modo Oscuro
- **Fondo**: Azul oscuro (#0f1220)
- **Paneles**: Azul medio (#171a2b)
- **Texto**: Blanco (#e9ecff)
- **Bordes**: Azul grisáceo (#232842)

## 🔄 Exportación/Importación

### Formato del Seed
```json
{
  "version": "1.0",
  "bpm": 120,
  "swing": 0.2,
  "density": 0.5,
  "tracks": [
    {
      "name": "Kick",
      "type": "kick",
      "steps": [true, false, false, false, ...]
    }
  ]
}
```

### Ejemplo de Uso
1. Crear un patrón en BeatBot2k
2. Hacer clic en "📤 Exportar"
3. Copiar el código base64 generado
4. Compartir el código con otros usuarios
5. Los usuarios pueden importar el patrón con "📥 Importar"

## 🐛 Debugging

### Tests Unitarios
```bash
# Debug con console.log
npm run test -- --reporter=verbose

# Debug con breakpoints
npm run test:ui
```

### Tests E2E
```bash
# Debug con headed mode
npx playwright test --headed --debug

# Debug con UI
npx playwright test --ui
```

## 🤝 Contribución

1. **Fork** el repositorio
2. **Crear** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abrir** un Pull Request

### Guías de Contribución
- Escribir tests para nuevas funcionalidades
- Seguir las convenciones de código existentes
- Documentar cambios importantes
- Verificar que todos los tests pasen

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- **Vue.js** por el framework reactivo
- **Web Audio API** por las capacidades de audio
- **Vite** por el build tool moderno
- **Vitest** y **Playwright** por las herramientas de testing

## 📞 Contacto

- **Autor**: aNieto2k
- **GitHub**: [@aNieto2k](https://github.com/aNieto2k)
- **Proyecto**: [BeatBot2k](https://github.com/aNieto2k/beatbot2k)

---

¡Disfruta creando ritmos increíbles con BeatBot2k! 🎵🥁
