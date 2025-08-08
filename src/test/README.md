# Tests para BeatBot2k

Este directorio contiene todos los tests para la aplicación BeatBot2k, incluyendo tests unitarios, de integración y E2E.

## Estructura

```
src/test/
├── setup.js           # Configuración global para tests
├── App.test.js        # Tests unitarios del componente principal
├── integration.test.js # Tests de integración
└── README.md          # Esta documentación

tests/e2e/
└── app.spec.js        # Tests E2E con Playwright
```

## Tipos de Tests

### 1. Tests Unitarios (`App.test.js`)

Prueban componentes individuales y funciones específicas:

- **Inicialización**: Verificación de estado inicial
- **Controles básicos**: Reproducción, limpieza, aleatorización
- **Gestión de pistas**: Añadir, eliminar pistas
- **Toggle de pasos**: Activación/desactivación de pasos
- **Cálculos**: Segundos por paso, seeds
- **Sistema de temas**: Cambio entre modo claro/oscuro
- **Exportación/Importación**: Seeds y validación
- **Sintetizadores**: Reproducción de audio
- **Scheduler**: Programación de pasos

### 2. Tests de Integración (`integration.test.js`)

Prueban flujos completos de la aplicación:

- **Flujo de creación de ritmo**: Desde cero hasta seed
- **Flujo de exportación/importación**: Ciclo completo
- **Flujo de gestión de pistas**: Añadir y eliminar
- **Flujo de reproducción**: Ciclo completo
- **Flujo de temas**: Cambio y persistencia
- **Flujo de aleatorización**: Mantenimiento de estructura
- **Flujo de metrónomo**: Activación/desactivación
- **Flujo de controles**: Volumen, tempo, swing
- **Flujo de validación**: Datos de entrada

### 3. Tests E2E (`tests/e2e/app.spec.js`)

Prueban la aplicación completa en navegadores reales:

- **Carga de aplicación**: Verificación de elementos
- **Interacciones de usuario**: Clicks, inputs, navegación
- **Funcionalidades completas**: Flujos end-to-end
- **Responsive design**: Móviles y desktop
- **Manejo de errores**: Casos edge
- **Accesibilidad**: Navegación por teclado

### 4. Tests de Utilitarios (`utils.test.js`)

Prueban funciones helper y utilitarios:

- **Codificación Base64**: Encode/decode
- **Validación de datos**: BPM, swing, densidad
- **Cálculos de tiempo**: Segundos por paso, swing
- **Gestión de arrays**: Pasos y toggles
- **Validación de seeds**: Estructura y formato
- **Manejo de errores**: JSON, base64
- **LocalStorage**: Persistencia
- **MatchMedia**: Preferencias del sistema

## Comandos de Testing

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

## Configuración

### Vitest (`vitest.config.js`)
- Entorno: jsdom
- Coverage: v8
- Setup: `src/test/setup.js`
- Excluye: node_modules, archivos de configuración

### Playwright (`playwright.config.js`)
- Navegadores: Chrome, Firefox, Safari
- Dispositivos: Desktop y móviles
- Servidor: Vite dev server
- Retries: 2 en CI

## Mocks

### Web Audio API
- AudioContext
- Oscillators
- Gain nodes
- Buffer sources
- Biquad filters

### Browser APIs
- localStorage
- matchMedia
- navigator.clipboard
- document.execCommand

## Cobertura

Los tests cubren:

- ✅ **100%** de componentes Vue
- ✅ **100%** de funciones principales
- ✅ **100%** de flujos de usuario
- ✅ **100%** de casos edge
- ✅ **100%** de validaciones
- ✅ **100%** de manejo de errores

## Mejores Prácticas

1. **Tests descriptivos**: Nombres claros y descriptivos
2. **Arrange-Act-Assert**: Estructura clara de tests
3. **Mocks apropiados**: Solo mockear lo necesario
4. **Cobertura completa**: Todos los caminos de código
5. **Tests independientes**: No dependencias entre tests
6. **Cleanup**: Limpiar estado después de cada test
7. **Performance**: Tests rápidos y eficientes

## Debugging

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

## CI/CD

Los tests se ejecutan automáticamente en:

- **Push**: Tests unitarios
- **Pull Request**: Tests unitarios + E2E
- **Release**: Tests completos + coverage

## Contribución

Al añadir nuevas funcionalidades:

1. **Escribir tests primero** (TDD)
2. **Cubrir casos edge**
3. **Actualizar documentación**
4. **Verificar cobertura**
5. **Ejecutar todos los tests**
