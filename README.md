# BeatBot2k - Vue.js + Web Audio

Un secuenciador de ritmos (drum machine) construido con Vue.js 3 y Web Audio API.

## Características

- 🥁 Secuenciador de 16 pasos
- 🎵 Tres pistas: Kick, Snare y Hi-Hat
- 🎛️ Control de tempo (60-200 BPM)
- 🎶 Control de swing
- 🔊 Control de volumen maestro
- 🎲 Función de aleatorización
- ⏱️ Metrónomo integrado
- 🎨 Interfaz moderna y responsive

## Tecnologías

- **Vue.js 3** - Framework de JavaScript
- **Vite** - Herramienta de construcción
- **Web Audio API** - API de audio del navegador
- **CSS3** - Estilos modernos con variables CSS

## Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd Beatbot2k
```

2. Instala las dependencias:
```bash
npm install
```

3. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

4. Abre tu navegador en `http://localhost:5173`

## Scripts disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción

## Estructura del proyecto

```
Beatbot2k/
├── src/
│   ├── App.vue          # Componente principal
│   ├── main.js          # Punto de entrada
│   ├── style.css        # Estilos globales
│   ├── components/      # Componentes adicionales
│   └── assets/          # Recursos estáticos
├── index.html           # HTML principal
├── package.json         # Dependencias y scripts
├── vite.config.js       # Configuración de Vite
└── README.md           # Este archivo
```

## Uso

1. **Reproducir/Pausar**: Haz clic en el botón "Reproducir" para iniciar el secuenciador
2. **Activar pasos**: Haz clic en cualquier celda de la cuadrícula para activar/desactivar un paso
3. **Ajustar tempo**: Usa el slider de tempo para cambiar la velocidad (60-200 BPM)
4. **Añadir swing**: Usa el slider de swing para añadir groove al ritmo
5. **Control de volumen**: Ajusta el volumen maestro con el slider correspondiente
6. **Aleatorizar**: Haz clic en "Aleatorizar" para generar patrones aleatorios
7. **Metrónomo**: Activa el metrónomo para escuchar los beats principales

## Desarrollo

El proyecto está estructurado siguiendo las mejores prácticas de Vue.js:

- **Separación de responsabilidades**: HTML, CSS y JavaScript están separados
- **Componentes reutilizables**: La lógica está encapsulada en componentes Vue
- **Estilos modulares**: CSS organizado con variables CSS para fácil personalización
- **Configuración moderna**: Vite para desarrollo rápido y builds optimizadas

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.
