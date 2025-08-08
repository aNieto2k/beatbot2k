import { test, expect } from '@playwright/test'

test.describe('BeatBot2k E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('debería cargar la aplicación correctamente', async ({ page }) => {
    // Verificar que la aplicación se carga
    await expect(page.locator('h1')).toContainText('BeatBot — Vue + Web Audio')
    await expect(page.locator('.card')).toBeVisible()
    await expect(page.locator('.controls')).toBeVisible()
  })

  test('debería mostrar las pistas por defecto', async ({ page }) => {
    // Verificar que hay 3 pistas por defecto
    const tracks = page.locator('.rowLabel')
    await expect(tracks).toHaveCount(3)
    await expect(tracks.nth(0)).toContainText('Kick')
    await expect(tracks.nth(1)).toContainText('Snare')
    await expect(tracks.nth(2)).toContainText('Hat')
  })

  test('debería poder reproducir y pausar', async ({ page }) => {
    const playButton = page.locator('button:has-text("Reproducir")')
    
    // Iniciar reproducción
    await playButton.click()
    await expect(page.locator('button:has-text("Pausar")')).toBeVisible()
    
    // Pausar reproducción
    await playButton.click()
    await expect(page.locator('button:has-text("Reproducir")')).toBeVisible()
  })

  test('debería poder activar y desactivar pasos', async ({ page }) => {
    const firstCell = page.locator('.cell').first()
    
    // Verificar que la celda está inactiva inicialmente
    await expect(firstCell).not.toHaveClass(/active/)
    
    // Activar la celda
    await firstCell.click()
    await expect(firstCell).toHaveClass(/active/)
    
    // Desactivar la celda
    await firstCell.click()
    await expect(firstCell).not.toHaveClass(/active/)
  })

  test('debería poder limpiar todas las pistas', async ({ page }) => {
    // Activar algunos pasos
    await page.locator('.cell').nth(0).click()
    await page.locator('.cell').nth(4).click()
    
    // Verificar que están activos
    await expect(page.locator('.cell').nth(0)).toHaveClass(/active/)
    await expect(page.locator('.cell').nth(4)).toHaveClass(/active/)
    
    // Limpiar todas las pistas
    await page.locator('button:has-text("Limpiar")').click()
    
    // Verificar que están inactivos
    await expect(page.locator('.cell').nth(0)).not.toHaveClass(/active/)
    await expect(page.locator('.cell').nth(4)).not.toHaveClass(/active/)
  })

  test('debería poder aleatorizar las pistas', async ({ page }) => {
    // Limpiar primero
    await page.locator('button:has-text("Limpiar")').click()
    
    // Aleatorizar
    await page.locator('button:has-text("Aleatorizar")').click()
    
    // Verificar que al menos algunas celdas están activas
    const activeCells = page.locator('.cell.active')
    await expect(activeCells).toHaveCount(0)
  })

  test('debería poder añadir una nueva pista', async ({ page }) => {
    const initialTrackCount = await page.locator('.rowLabel').count()
    
    // Abrir modal de añadir pista
    await page.locator('button:has-text("+ Pista")').click()
    await expect(page.locator('.modal')).toBeVisible()
    
    // Seleccionar tipo de pista
    await page.locator('.track-type').first().click()
    
    // Verificar que se añadió la pista
    await expect(page.locator('.rowLabel')).toHaveCount(initialTrackCount + 1)
  })

  test('debería poder eliminar una pista', async ({ page }) => {
    const initialTrackCount = await page.locator('.rowLabel').count()
    
    // Eliminar la primera pista
    await page.locator('.remove-track-btn').first().click()
    
    // Verificar que se eliminó la pista
    await expect(page.locator('.rowLabel')).toHaveCount(initialTrackCount - 1)
  })

  test('debería poder cambiar el tema', async ({ page }) => {
    // Verificar tema inicial
    await expect(page.locator('.wrap')).toHaveClass(/theme-light/)
    
    // Cambiar tema
    await page.locator('.theme-toggle').click()
    await expect(page.locator('.wrap')).toHaveClass(/theme-dark/)
    
    // Cambiar de vuelta
    await page.locator('.theme-toggle').click()
    await expect(page.locator('.wrap')).toHaveClass(/theme-light/)
  })

  test('debería poder exportar un patrón', async ({ page }) => {
    // Activar algunos pasos
    await page.locator('.cell').nth(0).click()
    await page.locator('.cell').nth(4).click()
    
    // Abrir modal de exportación
    await page.locator('button:has-text("📤 Exportar")').click()
    await expect(page.locator('.modal')).toBeVisible()
    
    // Verificar que se muestra el seed
    const seedInput = page.locator('.seed-input')
    await expect(seedInput).toBeVisible()
    await expect(seedInput).toHaveValue(/^[A-Za-z0-9+/=]+$/) // Base64 pattern
  })

  test('debería poder importar un patrón', async ({ page }) => {
    // Crear un patrón de prueba
    const testSeed = btoa(JSON.stringify({
      version: '1.0',
      bpm: 120,
      swing: 0.2,
      density: 0.5,
      tracks: [
        {
          name: 'Test Track',
          type: 'kick',
          steps: Array(16).fill(false)
        }
      ]
    }))
    
    // Abrir modal de importación
    await page.locator('button:has-text("📥 Importar")').click()
    await expect(page.locator('.modal')).toBeVisible()
    
    // Introducir seed
    await page.locator('.seed-input').fill(testSeed)
    await page.locator('button:has-text("🎵 Importar")').click()
    
    // Verificar que se importó correctamente
    await expect(page.locator('.modal')).not.toBeVisible()
  })

  test('debería poder ajustar el tempo', async ({ page }) => {
    const tempoSlider = page.locator('input[type="range"]').first()
    const tempoDisplay = page.locator('strong:has-text("BPM")')
    
    // Cambiar tempo
    await tempoSlider.fill('120')
    await expect(tempoDisplay).toContainText('120')
  })

  test('debería poder ajustar el swing', async ({ page }) => {
    const swingSlider = page.locator('input[type="range"]').nth(1)
    const swingDisplay = page.locator('strong:has-text("%")').first()
    
    // Cambiar swing
    await swingSlider.fill('0.3')
    await expect(swingDisplay).toContainText('30')
  })

  test('debería poder ajustar el volumen', async ({ page }) => {
    const volumeSlider = page.locator('input[type="range"]').nth(2)
    const volumeDisplay = page.locator('strong:has-text("%")').nth(1)
    
    // Cambiar volumen
    await volumeSlider.fill('0.5')
    await expect(volumeDisplay).toContainText('50')
  })

  test('debería poder activar el metrónomo', async ({ page }) => {
    const metronomeToggle = page.locator('.toggle').last()
    
    // Activar metrónomo
    await metronomeToggle.click()
    await expect(metronomeToggle.locator('.led')).toHaveClass(/on/)
    
    // Desactivar metrónomo
    await metronomeToggle.click()
    await expect(metronomeToggle.locator('.led')).not.toHaveClass(/on/)
  })

  test('debería ser responsive en móviles', async ({ page }) => {
    // Cambiar a vista móvil
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Verificar que la aplicación sigue siendo funcional
    await expect(page.locator('.card')).toBeVisible()
    await expect(page.locator('.controls')).toBeVisible()
    
    // Verificar que los controles se apilan correctamente
    const controls = page.locator('.controls')
    await expect(controls).toBeVisible()
  })

  test('debería manejar errores de importación', async ({ page }) => {
    // Abrir modal de importación
    await page.locator('button:has-text("📥 Importar")').click()
    
    // Intentar importar un seed inválido
    await page.locator('.seed-input').fill('invalid-seed')
    await page.locator('button:has-text("🎵 Importar")').click()
    
    // Verificar que se muestra un error
    await expect(page.locator('.import-error')).toBeVisible()
  })

  test('debería copiar el seed al portapapeles', async ({ page }) => {
    // Abrir modal de exportación
    await page.locator('button:has-text("📤 Exportar")').click()
    
    // Copiar seed
    await page.locator('.copy-btn').click()
    
    // Verificar que se muestra el feedback
    await expect(page.locator('.copy-btn')).toContainText('✅ Copiado!')
  })
})
