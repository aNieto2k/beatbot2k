import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(App)
  })

  describe('Inicialización', () => {
    it('debería renderizar correctamente', () => {
      expect(wrapper.find('.wrap').exists()).toBe(true)
      expect(wrapper.find('.card').exists()).toBe(true)
      expect(wrapper.find('h1').text()).toBe('🥁 BeatBot — Vue + Web Audio')
    })

    it('debería tener 3 pistas por defecto', () => {
      expect(wrapper.vm.tracks).toHaveLength(3)
      expect(wrapper.vm.tracks[0].name).toBe('Kick')
      expect(wrapper.vm.tracks[1].name).toBe('Snare')
      expect(wrapper.vm.tracks[2].name).toBe('Hat')
    })

    it('debería tener valores por defecto correctos', () => {
      expect(wrapper.vm.bpm).toBe(100)
      expect(wrapper.vm.swing).toBe(0.1)
      expect(wrapper.vm.masterGain).toBe(0.85)
      expect(wrapper.vm.density).toBe(0.35)
      expect(wrapper.vm.isPlaying).toBe(false)
    })
  })

  describe('Controles básicos', () => {
    it('debería cambiar el estado de reproducción al hacer toggle', async () => {
      const playButton = wrapper.find('.primary')
      await playButton.trigger('click')
      expect(wrapper.vm.isPlaying).toBe(true)
      
      await playButton.trigger('click')
      expect(wrapper.vm.isPlaying).toBe(false)
    })

    it('debería limpiar todas las pistas', async () => {
      // Activar algunos pasos
      wrapper.vm.tracks[0].steps[0] = true
      wrapper.vm.tracks[1].steps[4] = true
      
      await wrapper.find('button').trigger('click')
      wrapper.vm.clearAll()
      
      expect(wrapper.vm.tracks[0].steps.every(step => !step)).toBe(true)
      expect(wrapper.vm.tracks[1].steps.every(step => !step)).toBe(true)
      expect(wrapper.vm.tracks[2].steps.every(step => !step)).toBe(true)
    })

    it('debería aleatorizar las pistas', async () => {
      const originalSteps = JSON.parse(JSON.stringify(wrapper.vm.tracks[0].steps))
      wrapper.vm.randomize()
      
      // Verificar que al menos algunos pasos cambiaron
      const newSteps = wrapper.vm.tracks[0].steps
      const hasChanges = originalSteps.some((step, index) => step !== newSteps[index])
      expect(hasChanges).toBe(true)
    })
  })

  describe('Gestión de pistas', () => {
    it('debería añadir una nueva pista', async () => {
      const initialTrackCount = wrapper.vm.tracks.length
      wrapper.vm.showAddTrackModal = true
      
      const trackType = wrapper.vm.availableTrackTypes[0]
      wrapper.vm.addTrack(trackType)
      
      expect(wrapper.vm.tracks).toHaveLength(initialTrackCount + 1)
      expect(wrapper.vm.tracks[initialTrackCount].name).toContain(trackType.name)
      expect(wrapper.vm.tracks[initialTrackCount].type).toBe(trackType.id)
    })

    it('debería eliminar una pista', async () => {
      const initialTrackCount = wrapper.vm.tracks.length
      wrapper.vm.removeTrack(0)
      
      expect(wrapper.vm.tracks).toHaveLength(initialTrackCount - 1)
      expect(wrapper.vm.tracks[0].name).toBe('Snare')
    })

    it('no debería eliminar la última pista', async () => {
      // Eliminar todas las pistas excepto una
      while (wrapper.vm.tracks.length > 1) {
        wrapper.vm.removeTrack(0)
      }
      
      const lastTrackCount = wrapper.vm.tracks.length
      wrapper.vm.removeTrack(0)
      
      expect(wrapper.vm.tracks).toHaveLength(lastTrackCount)
    })
  })

  describe('Toggle de pasos', () => {
    it('debería cambiar el estado de un paso', async () => {
      const trackIndex = 0
      const stepIndex = 5
      
      expect(wrapper.vm.tracks[trackIndex].steps[stepIndex]).toBe(false)
      
      wrapper.vm.toggleStep(trackIndex, stepIndex)
      expect(wrapper.vm.tracks[trackIndex].steps[stepIndex]).toBe(true)
      
      wrapper.vm.toggleStep(trackIndex, stepIndex)
      expect(wrapper.vm.tracks[trackIndex].steps[stepIndex]).toBe(false)
    })
  })

  describe('Cálculos', () => {
    it('debería calcular correctamente los segundos por paso', () => {
      wrapper.vm.bpm = 120
      const secondsPerStep = wrapper.vm.secondsPerStep()
      expect(secondsPerStep).toBe(0.125) // 60/120/4 = 0.125
    })

    it('debería generar un seed válido', () => {
      const seed = wrapper.vm.currentSeed
      expect(typeof seed).toBe('string')
      expect(seed.length).toBeGreaterThan(0)
    })
  })

  describe('Sistema de temas', () => {
    it('debería cambiar entre temas', async () => {
      // El tema inicial depende de la preferencia del sistema, así que verificamos que existe
      expect(wrapper.vm.isLightMode).toBeDefined()
      
      const initialTheme = wrapper.vm.isLightMode
      wrapper.vm.toggleTheme()
      expect(wrapper.vm.isLightMode).toBe(!initialTheme)
      
      wrapper.vm.toggleTheme()
      expect(wrapper.vm.isLightMode).toBe(initialTheme)
    })

    it('debería guardar el tema en localStorage', async () => {
      const initialTheme = wrapper.vm.isLightMode
      wrapper.vm.toggleTheme()
      expect(localStorage.setItem).toHaveBeenCalledWith('beatbot-theme', initialTheme ? 'dark' : 'light')
    })
  })

  describe('Exportación/Importación', () => {
    it('debería exportar un patrón válido', () => {
      const seed = wrapper.vm.currentSeed
      expect(seed).toBeDefined()
      
      // Verificar que es un string base64 válido
      expect(() => atob(seed)).not.toThrow()
    })

    it('debería importar un patrón válido', async () => {
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
      
      wrapper.vm.importSeed = testSeed
      wrapper.vm.importPattern()
      
      expect(wrapper.vm.bpm).toBe(120)
      expect(wrapper.vm.swing).toBe(0.2)
      expect(wrapper.vm.density).toBe(0.5)
      expect(wrapper.vm.tracks[0].name).toBe('Test Track')
    })

    it('debería manejar errores de importación', async () => {
      wrapper.vm.importSeed = 'invalid-seed'
      wrapper.vm.importPattern()
      
      // Verificar que se estableció un error
      expect(wrapper.vm.importError).toBeDefined()
      expect(wrapper.vm.importError.length).toBeGreaterThan(0)
    })
  })

  describe('Sintetizadores', () => {
    it('debería reproducir kick correctamente', () => {
      const time = 0
      // Mock the audio context
      wrapper.vm.audio = new AudioContext()
      expect(() => wrapper.vm.playKick(time)).not.toThrow()
    })

    it('debería reproducir snare correctamente', () => {
      const time = 0
      wrapper.vm.audio = new AudioContext()
      expect(() => wrapper.vm.playSnare(time)).not.toThrow()
    })

    it('debería reproducir hat correctamente', () => {
      const time = 0
      wrapper.vm.audio = new AudioContext()
      expect(() => wrapper.vm.playHat(time)).not.toThrow()
    })

    it('debería reproducir tom correctamente', () => {
      const time = 0
      wrapper.vm.audio = new AudioContext()
      expect(() => wrapper.vm.playTom(time)).not.toThrow()
    })

    it('debería reproducir clap correctamente', () => {
      const time = 0
      wrapper.vm.audio = new AudioContext()
      expect(() => wrapper.vm.playClap(time)).not.toThrow()
    })

    it('debería reproducir cymbal correctamente', () => {
      const time = 0
      wrapper.vm.audio = new AudioContext()
      expect(() => wrapper.vm.playCymbal(time)).not.toThrow()
    })

    it('debería reproducir bass correctamente', () => {
      const time = 0
      wrapper.vm.audio = new AudioContext()
      expect(() => wrapper.vm.playBass(time)).not.toThrow()
    })

    it('debería reproducir lead correctamente', () => {
      const time = 0
      wrapper.vm.audio = new AudioContext()
      expect(() => wrapper.vm.playLead(time)).not.toThrow()
    })
  })

  describe('Scheduler', () => {
    it('debería avanzar correctamente los pasos', () => {
      wrapper.vm.currentStep = 0
      wrapper.vm.advanceStep()
      expect(wrapper.vm.currentStep).toBe(1)
      
      wrapper.vm.currentStep = 15
      wrapper.vm.advanceStep()
      expect(wrapper.vm.currentStep).toBe(0)
    })

    it('debería programar pasos correctamente', () => {
      const step = 0
      const time = 0
      wrapper.vm.audio = new AudioContext()
      expect(() => wrapper.vm.scheduleStep(step, time)).not.toThrow()
    })
  })
})
