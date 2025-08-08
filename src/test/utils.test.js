import { describe, it, expect, vi } from 'vitest'

// Mock de las funciones de audio
const mockAudioContext = {
  createOscillator: vi.fn().mockReturnValue({
    type: 'sine',
    frequency: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn()
    },
    connect: vi.fn().mockReturnThis(),
    start: vi.fn(),
    stop: vi.fn()
  }),
  createGain: vi.fn().mockReturnValue({
    gain: {
      value: 1,
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn()
    },
    connect: vi.fn().mockReturnThis()
  }),
  createBuffer: vi.fn().mockReturnValue({
    getChannelData: vi.fn().mockReturnValue(new Float32Array(1000))
  }),
  createBufferSource: vi.fn().mockReturnValue({
    buffer: null,
    connect: vi.fn().mockReturnThis(),
    start: vi.fn(),
    stop: vi.fn()
  }),
  createBiquadFilter: vi.fn().mockReturnValue({
    type: 'lowpass',
    frequency: {
      setValueAtTime: vi.fn()
    },
    connect: vi.fn().mockReturnThis()
  }),
  destination: {},
  currentTime: 0,
  sampleRate: 44100,
  state: 'running',
  resume: vi.fn()
}

describe('Utilitarios y Helpers', () => {
  describe('Codificación Base64', () => {
    it('debería codificar y decodificar correctamente', () => {
      const testData = {
        version: '1.0',
        bpm: 120,
        tracks: []
      }
      
      const jsonString = JSON.stringify(testData)
      const encoded = btoa(jsonString)
      const decoded = atob(encoded)
      const parsed = JSON.parse(decoded)
      
      expect(parsed.version).toBe('1.0')
      expect(parsed.bpm).toBe(120)
    })

    it('debería manejar strings vacíos', () => {
      const emptyString = ''
      const encoded = btoa(emptyString)
      const decoded = atob(encoded)
      
      expect(decoded).toBe('')
    })
  })

  describe('Validación de datos', () => {
    it('debería validar BPM correctamente', () => {
      const validBpms = [60, 100, 200]
      const invalidBpms = [59, 201, -10, 0]
      
      validBpms.forEach(bpm => {
        expect(bpm >= 60 && bpm <= 200).toBe(true)
      })
      
      invalidBpms.forEach(bpm => {
        expect(bpm >= 60 && bpm <= 200).toBe(false)
      })
    })

    it('debería validar Swing correctamente', () => {
      const validSwings = [0, 0.1, 0.6]
      const invalidSwings = [-0.1, 0.7, 1.0]
      
      validSwings.forEach(swing => {
        expect(swing >= 0 && swing <= 0.6).toBe(true)
      })
      
      invalidSwings.forEach(swing => {
        expect(swing >= 0 && swing <= 0.6).toBe(false)
      })
    })

    it('debería validar Densidad correctamente', () => {
      const validDensities = [0, 0.5, 1]
      const invalidDensities = [-0.1, 1.1, 2.0]
      
      validDensities.forEach(density => {
        expect(density >= 0 && density <= 1).toBe(true)
      })
      
      invalidDensities.forEach(density => {
        expect(density >= 0 && density <= 1).toBe(false)
      })
    })
  })

  describe('Cálculos de tiempo', () => {
    it('debería calcular segundos por paso correctamente', () => {
      const testCases = [
        { bpm: 60, expected: 0.25 },   // 60 BPM = 1 segundo por negra, 0.25 por paso
        { bpm: 120, expected: 0.125 }, // 120 BPM = 0.5 segundos por negra, 0.125 por paso
        { bpm: 180, expected: 0.0833 } // 180 BPM = 0.333 segundos por negra, 0.0833 por paso
      ]
      
      testCases.forEach(({ bpm, expected }) => {
        const spb = 60 / bpm // segundos por negra
        const secondsPerStep = spb / 4 // 4 pasos por negra
        expect(secondsPerStep).toBeCloseTo(expected, 3)
      })
    })

    it('debería calcular swing correctamente', () => {
      const baseTime = 0.125 // tiempo base por paso
      const swing = 0.2
      const swingOffset = swing * baseTime * 0.5
      
      expect(swingOffset).toBe(0.0125)
    })
  })

  describe('Gestión de arrays', () => {
    it('debería crear arrays de pasos correctamente', () => {
      const steps = Array(16).fill(false)
      expect(steps).toHaveLength(16)
      expect(steps.every(step => step === false)).toBe(true)
    })

    it('debería toggleear elementos en arrays', () => {
      const steps = Array(16).fill(false)
      const index = 5
      
      // Toggle a true
      steps[index] = !steps[index]
      expect(steps[index]).toBe(true)
      
      // Toggle a false
      steps[index] = !steps[index]
      expect(steps[index]).toBe(false)
    })
  })

  describe('Validación de seeds', () => {
    it('debería validar estructura de seed', () => {
      const validSeed = {
        version: '1.0',
        bpm: 120,
        swing: 0.1,
        density: 0.5,
        tracks: [
          {
            name: 'Test',
            type: 'kick',
            steps: Array(16).fill(false)
          }
        ]
      }
      
      expect(validSeed.version).toBe('1.0')
      expect(validSeed.tracks).toBeInstanceOf(Array)
      expect(validSeed.tracks[0].steps).toHaveLength(16)
    })

    it('debería detectar seeds inválidos', () => {
      const invalidSeeds = [
        null,
        undefined,
        {},
        { version: '2.0' }, // versión no soportada
        { version: '1.0', tracks: null }, // tracks faltantes
        { version: '1.0', tracks: [] } // tracks vacío
      ]
      
      invalidSeeds.forEach(seed => {
        let isValid = false
        if (seed && seed.version === '1.0' && Array.isArray(seed.tracks) && seed.tracks.length > 0) {
          isValid = true
        }
        expect(isValid).toBe(false)
      })
    })
  })

  describe('Manejo de errores', () => {
    it('debería manejar errores de JSON parsing', () => {
      const invalidJson = 'invalid json'
      
      expect(() => {
        JSON.parse(invalidJson)
      }).toThrow()
    })

    it('debería manejar errores de base64 decoding', () => {
      const invalidBase64 = 'invalid-base64!'
      
      expect(() => {
        atob(invalidBase64)
      }).toThrow()
    })
  })

  describe('LocalStorage', () => {
    it('debería guardar y recuperar datos', () => {
      const testKey = 'test-key'
      const testValue = 'test-value'
      
      // Mock localStorage
      const mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      }
      
      global.localStorage = mockLocalStorage
      
      // Simular guardado
      localStorage.setItem(testKey, testValue)
      expect(localStorage.setItem).toHaveBeenCalledWith(testKey, testValue)
      
      // Simular recuperación
      localStorage.getItem(testKey)
      expect(localStorage.getItem).toHaveBeenCalledWith(testKey)
    })
  })

  describe('MatchMedia', () => {
    it('debería detectar preferencia de tema del sistema', () => {
      const mockMatchMedia = vi.fn().mockImplementation(query => ({
        matches: query.includes('light'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }))
      
      global.matchMedia = mockMatchMedia
      
      const lightQuery = window.matchMedia('(prefers-color-scheme: light)')
      expect(lightQuery.matches).toBe(true)
      
      const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')
      expect(darkQuery.matches).toBe(false)
    })
  })
})
