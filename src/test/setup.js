import { vi } from 'vitest'

// Mock Web Audio API
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

global.AudioContext = vi.fn().mockImplementation(() => mockAudioContext)
global.webkitAudioContext = global.AudioContext

// Mock localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

// Mock matchMedia
global.matchMedia = vi.fn().mockImplementation(query => ({
  matches: query.includes('light'),
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn()
}))

// Mock navigator.clipboard
global.navigator.clipboard = {
  writeText: vi.fn().mockResolvedValue(undefined)
}

// Mock document.execCommand
global.document.execCommand = vi.fn().mockReturnValue(true)

// Mock setTimeout and clearTimeout
global.setTimeout = vi.fn((fn, delay) => {
  const id = Math.random()
  return id
})

global.clearTimeout = vi.fn((id) => {
  // No-op
})

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((fn) => {
  const id = Math.random()
  return id
})

global.cancelAnimationFrame = vi.fn((id) => {
  // No-op
})
