<template>
  <div class="wrap" :class="{ 'theme-light': isLightMode, 'playing': isPlaying || isPlayingSession }">
    <!-- Efectos de fondo para reproducción -->
    <div v-if="isPlaying || isPlayingSession" class="background-effects">
      <div class="pulse-circles">
        <div class="pulse-circle" v-for="i in 6" :key="i" :style="{ 
          animationDelay: `${i * 0.5}s`,
          animationDuration: `${60 / bpm * 4}s`
        }"></div>
      </div>
      <div class="floating-particles">
        <div class="particle" v-for="i in 12" :key="i" :style="{ 
          left: `${Math.random() * 100}%`, 
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${60 / bpm * 6 + Math.random() * 2}s`
        }"></div>
      </div>
      <div class="beat-waves">
        <div class="beat-wave" v-for="i in 4" :key="i" :style="{ 
          animationDelay: `${i * (60 / bpm / 4)}s`,
          animationDuration: `${60 / bpm * 2}s`
        }"></div>
      </div>
      <div class="rhythm-grid">
        <div class="grid-line" v-for="i in 8" :key="i" :style="{ 
          animationDelay: `${i * (60 / bpm / 8)}s`,
          animationDuration: `${60 / bpm}s`
        }"></div>
      </div>
      <div class="active-step-effects">
        <div v-for="(track, trackIndex) in tracks" :key="trackIndex" class="track-effect">
          <div v-for="(step, stepIndex) in track.steps" :key="stepIndex" 
               class="step-effect" 
               :class="{ 'active': step && currentStep === stepIndex }"
               :style="{ 
                 left: `${(stepIndex / 15) * 100}%`,
                 top: `${(trackIndex / (tracks.length - 1)) * 100}%`,
                 animationDelay: `${stepIndex * (60 / bpm / 16)}s`
               }">
          </div>
        </div>
      </div>
    </div>
    
    <div class="card">
      <header>
        <h1>🥁 BeatBot2k</h1>
        <div v-if="isPlayingSession" class="session-playback-header">
          <span class="session-playback-header-dot"></span>
          <span>Reproduciendo sesión</span>
        </div>
        <div class="controls">
          <button class="primary" @click="toggle()">{{ isPlaying ? 'Pausar' : 'Reproducir' }}</button>
          <button @click="randomize()">Aleatorizar</button>
          <button @click="clearAll()">Limpiar</button>
          <button @click="showAddTrackModal = true" class="add-track-btn">+ Pista</button>
          <button @click="showExportModal = true" class="export-btn">📤 Exportar</button>
          <button @click="showImportModal = true" class="import-btn">📥 Importar</button>
          <div class="theme-toggle" @click="toggleTheme" :title="isLightMode ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'">
            <span class="theme-icon">{{ isLightMode ? '🌙' : '☀️' }}</span>
          </div>
          <div class="toggle" @click="toggleMetronome()">
            <span class="led" :class="{on: metronomeOn}"></span>
            <span> Metrónomo </span>
          </div>
        </div>
      </header>

      <section class="panel">
        <div class="grid">
          <table>
            <tbody>
              <tr v-for="(track, trackIndex) in tracks" :key="trackIndex">
                <td class="rowLabel">
                  <div class="track-header">
                    <span>{{ track.name }}</span>
                    <button v-if="tracks.length > 1" @click="removeTrack(trackIndex)" class="remove-track-btn" :title="`Eliminar ${track.name}`">×</button>
                  </div>
                </td>
                <td class="steps" :data-track-index="trackIndex">
                  <div 
                    v-for="(step, stepIndex) in track.steps" 
                    :key="stepIndex"
                    class="cell" 
                    :class="{ 
                      active: step, 
                      now: currentStep === stepIndex,
                      'session-playing': isPlayingSession && step
                    }"
                    @click="toggleStep(trackIndex, stepIndex)"
                    :title="`${step ? 'Desactivar' : 'Activar'} paso ${stepIndex + 1} de ${track.name}`"
                  >
                    <div class="dot"></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="sliders">
          <div class="slider">
            <label><span>Tempo</span><strong>{{ bpm }} BPM</strong></label>
            <input type="range" min="60" max="200" v-model.number="bpm" />
          </div>
          <div class="slider">
            <label><span>Swing</span><strong>{{ Math.round(swing * 100) }}%</strong></label>
            <input type="range" min="0" max="0.6" step="0.01" v-model.number="swing" />
          </div>
          <div class="slider">
            <label><span>Volumen</span><strong>{{ Math.round(masterGain * 100) }}%</strong></label>
            <input type="range" min="0" max="1" step="0.01" v-model.number="masterGain" @input="updateMasterGain" />
          </div>
          <div class="slider">
            <label><span>Densidad aleatoria</span><strong>{{ Math.round(density * 100) }}%</strong></label>
            <input type="range" min="0" max="1" step="0.01" v-model.number="density" />
          </div>
        </div>

        <div class="badges">
          <span class="badge">16 pasos</span>
          <span class="badge">{{ tracks.length }} pistas</span>
          <span class="badge">Sin muestras · síntesis</span>
        </div>
      </section>

      <!-- Sección de Sesiones -->
      <section class="sessions-section">
        <div class="sessions-header">
          <h3>🎙️ Sesiones</h3>
          <div class="sessions-controls">
            <button 
              @click="isRecording ? stopRecording() : startRecording()" 
              :class="['recording-btn', { 'recording': isRecording }]"
              :title="isRecording ? 'Detener grabación' : 'Iniciar grabación'"
            >
              {{ isRecording ? '⏹️ Detener' : '🎙️ Grabar' }}
            </button>
            <button @click="showSessionsModal = true" class="sessions-btn">
              📁 Sesiones Guardadas ({{ savedSessions.length }})
            </button>
          </div>
        </div>
        
        <div v-if="isRecording" class="recording-status">
          <div class="recording-indicator">
            <span class="recording-dot"></span>
            <span>Grabando... {{ getCurrentSessionTime() }}</span>
          </div>
        </div>
        
        <div v-if="isPlayingSession" class="session-playback-status">
          <div class="session-playback-indicator">
            <span class="session-playback-dot"></span>
            <span>Reproduciendo sesión: {{ currentSession?.sessionId || 'Sesión' }}</span>
            <span class="session-playback-time">{{ getSessionPlaybackTime() }}</span>
          </div>
          <div class="session-playback-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: getSessionPlaybackProgress() + '%' }"
              ></div>
            </div>
            <button @click="stopSessionPlayback()" class="stop-session-btn">
              ⏹️ Detener Reproducción
            </button>
          </div>
        </div>
        
        <div v-if="showSaveSuccess" class="save-success">
          ✅ Sesión guardada correctamente
        </div>
        <div v-if="showCopySuccess" class="copy-success-message">
          ✅ Sesión copiada al portapapeles
        </div>
        <div v-if="showShareSuccess" class="share-success-message">
          🐦 ¡Sesión compartida en X/Twitter!
        </div>
      </section>

      <div class="footer">
        <div>Hecho con <code>Vue 3</code> + <code>WebAudio API</code></div>
        <div class="small">Tip: pulsa cualquier celda para activarla. Usa "Aleatorizar" para inspiración rápida.</div>
      </div>
    </div>

    <!-- Modal para añadir pistas -->
    <div v-if="showAddTrackModal" class="modal-overlay" @click="showAddTrackModal = false">
      <div class="modal" @click.stop>
        <h3>Añadir nueva pista</h3>
        <div class="track-types">
          <div v-for="trackType in availableTrackTypes" :key="trackType.id" 
               class="track-type" @click="addTrack(trackType)">
            <div class="track-type-icon">{{ trackType.icon }}</div>
            <div class="track-type-info">
              <div class="track-type-name">{{ trackType.name }}</div>
              <div class="track-type-desc">{{ trackType.description }}</div>
            </div>
          </div>
        </div>
        <button @click="showAddTrackModal = false" class="modal-close">Cancelar</button>
      </div>
    </div>

    <!-- Modal para exportar patrones -->
    <div v-if="showExportModal" class="modal-overlay" @click="showExportModal = false">
      <div class="modal" @click.stop>
        <h3>📤 Exportar Patrón</h3>
        <div class="export-section">
          <p class="export-description">Comparte tu ritmo con amigos usando este código:</p>
          <div class="seed-container">
            <input 
              :value="currentSeed" 
              readonly 
              class="seed-input" 
              ref="seedInput"
              @click="copySeed"
            />
            <button @click="copySeed" class="copy-btn">
              {{ showCopySuccess ? '✅ Copiado!' : '📋 Copiar' }}
            </button>
          </div>
          <div class="seed-info">
            <p><strong>Seed:</strong> {{ currentSeed.substring(0, 20) }}...</p>
            <p><strong>Pistas:</strong> {{ tracks.length }}</p>
            <p><strong>Tempo:</strong> {{ bpm }} BPM</p>
            <p><strong>Swing:</strong> {{ Math.round(swing * 100) }}%</p>
          </div>
        </div>
        <button @click="showExportModal = false" class="modal-close">Cerrar</button>
      </div>
    </div>

    <!-- Modal para importar patrones -->
    <div v-if="showImportModal" class="modal-overlay" @click="showImportModal = false">
      <div class="modal" @click.stop>
        <h3>📥 Importar Patrón</h3>
        <div class="import-section">
          <p class="import-description">Pega el código del patrón que quieres importar:</p>
          <div class="seed-container">
            <input 
              v-model="importSeed" 
              placeholder="Pega aquí el código del patrón..." 
              class="seed-input"
              @keyup.enter="importPattern"
            />
            <button @click="importPattern" class="import-pattern-btn">🎵 Importar</button>
          </div>
          <div v-if="importError" class="import-error">
            {{ importError }}
          </div>
          <div v-if="showImportSuccess" class="import-success">
            ✅ Patrón importado exitosamente!
          </div>
        </div>
        <button @click="showImportModal = false" class="modal-close">Cancelar</button>
      </div>
    </div>

    <!-- Modal de grabación -->
    <div v-if="showRecordingModal" class="modal-overlay" @click="showRecordingModal = false">
      <div class="modal" @click.stop>
        <h3>🎙️ Sesión Grabada</h3>
        <div class="recording-info">
          <div class="recording-stats">
            <div class="stat">
              <span class="stat-label">Duración:</span>
              <span class="stat-value">{{ formatTime(recordingSessionData?.duration || 0) }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Eventos:</span>
              <span class="stat-value">{{ recordingSessionData?.events?.length || 0 }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">ID de Sesión:</span>
              <span class="stat-value">{{ recordingSessionData?.sessionId || 'N/A' }}</span>
            </div>
          </div>
          
          <div class="recording-events">
            <h4>Eventos de la sesión:</h4>
            <div class="events-list">
              <div v-for="event in recordingSessionData?.events" :key="event.timestamp" class="event-item">
                <span class="event-time">{{ event.sessionTime }}</span>
                <span class="event-type">{{ getEventTypeName(event.type) }}</span>
                <span class="event-details">{{ getEventDetails(event) }}</span>
              </div>
            </div>
          </div>
          
          <div class="recording-actions">
            <button @click="copySessionSeed()" class="copy-btn">
              📋 Copiar Sesión
            </button>
            <button @click="playSession(recordingSessionData)" class="play-btn">
              ▶️ Reproducir Sesión
            </button>
          </div>
        </div>
        <button @click="showRecordingModal = false" class="modal-close">Cerrar</button>
      </div>
    </div>

    <!-- Modal de nombre para la sesión grabada -->
    <div v-if="showRecordingNameModal" class="modal-overlay" @click="showRecordingNameModal = false">
      <div class="modal" @click.stop>
        <h3>🎙️ Nombre para la Sesión Grabada</h3>
        <div class="recording-summary">
          <div class="summary-item">
            <span class="summary-label">Duración:</span>
            <span class="summary-value">{{ formatTime(recordingSessionData?.duration || 0) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Eventos:</span>
            <span class="summary-value">{{ recordingSessionData?.events?.length || 0 }}</span>
          </div>
        </div>
        <div class="name-input-container">
          <label for="session-name">Nombre de la sesión:</label>
          <input 
            id="session-name"
            type="text" 
            v-model="recordingSessionName" 
            placeholder="Ej: Mi ritmo favorito, Sesión de prueba, etc."
            @keyup.enter="saveRecordingWithName"
            autofocus
          />
        </div>
        <div class="modal-actions">
          <button @click="saveRecordingWithName" class="primary" :disabled="!recordingSessionName.trim()">
            💾 Guardar Sesión
          </button>
          <button @click="cancelRecording" class="modal-close">
            ❌ Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de sesiones guardadas -->
    <div v-if="showSessionsModal" class="modal-overlay" @click="showSessionsModal = false">
      <div class="modal" @click.stop>
        <h3>Sesiones Guardadas</h3>
        <div v-if="showCopySuccess" class="copy-success-message">
          ✅ Sesión copiada al portapapeles
        </div>
        <div v-if="showShareSuccess" class="share-success-message">
          🐦 ¡Sesión compartida en X/Twitter!
        </div>
        <div class="sessions-modal-controls">
          <button @click="showImportSessionModal = true" class="import-session-btn">
            📥 Importar Sesión de Amigo
          </button>
        </div>
        <div class="saved-sessions-list">
          <div v-if="savedSessions.length === 0" class="no-sessions-message">
            No hay sesiones guardadas.
          </div>
          <div v-for="session in savedSessions" :key="session.id" class="saved-session-item">
            <div class="session-header">
              <span class="session-name">{{ session.name }}</span>
              <span class="session-date">{{ formatSessionDate(session.timestamp) }}</span>
              <span class="session-duration">{{ formatSessionDuration(session.duration) }}</span>
            </div>
            <div class="session-actions">
              <button @click="playSavedSession(session.id)" class="play-btn">▶️ Reproducir</button>
              <button @click="exportSavedSession(session.id)" class="export-btn">
                {{ session.exporting ? '✅ Copiado!' : '📤 Exportar' }}
              </button>
              <button @click="showShareModal = true; currentShareSession = session; generateShareUrl(session.id)" class="share-btn">
                📤 Compartir
              </button>
              <button @click="deleteSession(session.id)" class="delete-btn">🗑️ Eliminar</button>
            </div>
          </div>
        </div>
        <button @click="showSessionsModal = false" class="modal-close">Cerrar</button>
      </div>
    </div>

    <!-- Modal para importar sesión de amigo -->
    <div v-if="showImportSessionModal" class="modal-overlay" @click="showImportSessionModal = false">
      <div class="modal" @click.stop>
        <h3>📥 Importar Sesión de Amigo</h3>
        <div class="import-session-content">
          <p class="import-instructions">
            Pega aquí el código de sesión que te compartió tu amigo:
          </p>
          <div class="import-input-container">
            <textarea 
              v-model="importSessionSeed" 
              placeholder="Pega el código de sesión aquí..."
              class="import-session-textarea"
              rows="6"
            ></textarea>
          </div>
          <div v-if="importSessionError" class="import-error">
            ❌ {{ importSessionError }}
          </div>
          <div v-if="importSessionSuccess" class="import-success">
            ✅ Sesión importada correctamente: {{ importedSessionName }}
          </div>
          <div class="import-session-actions">
            <button @click="importSessionFromSeed()" class="import-btn" :disabled="!importSessionSeed.trim()">
              📥 Importar Sesión
            </button>
            <button @click="showImportSessionModal = false" class="cancel-btn">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para sesiones compartidas -->
    <div v-if="showSharedSessionModalFlag" class="modal-overlay" @click="showSharedSessionModalFlag = false">
      <div class="modal" @click.stop>
        <h3>🎙️ Sesión Compartida</h3>
        <div class="recording-info">
          <div class="recording-stats">
            <div class="stat">
              <span class="stat-label">Duración:</span>
              <span class="stat-value">{{ formatTime(sharedSessionData?.duration || 0) }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Eventos:</span>
              <span class="stat-value">{{ sharedSessionData?.events?.length || 0 }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">ID de Sesión:</span>
              <span class="stat-value">{{ sharedSessionData?.sessionId || 'N/A' }}</span>
            </div>
          </div>
          
          <div class="recording-events">
            <h4>Eventos de la sesión:</h4>
            <div class="events-list">
              <div v-for="event in sharedSessionData?.events" :key="event.timestamp" class="event-item">
                <span class="event-time">{{ event.sessionTime }}</span>
                <span class="event-type">{{ getEventTypeName(event.type) }}</span>
                <span class="event-details">{{ getEventDetails(event) }}</span>
              </div>
            </div>
          </div>
          
          <div class="recording-actions">
            <button @click="importSharedSession()" class="primary">
              📥 Importar Sesión
            </button>
            <button @click="showSharedSessionModalFlag = false" class="modal-close">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de compartir -->
    <div v-if="showShareModal" class="modal-overlay" @click="showShareModal = false">
      <div class="modal" @click.stop>
        <h3>📤 Compartir Sesión</h3>
        <div class="share-section">
          <div v-if="currentShareSession" class="share-session-info">
            <div class="session-summary">
              <h4>{{ currentShareSession.name }}</h4>
              <div class="session-details">
                <span class="detail-item">⏱️ Duración: {{ formatTime(currentShareSession.duration) }}</span>
                <span class="detail-item">🎯 Eventos: {{ currentShareSession.eventsCount }}</span>
                <span class="detail-item">🎼 Tempo: {{ currentShareSession.data?.finalState?.bpm || 100 }} BPM</span>
              </div>
            </div>
          </div>
          
          <div class="share-url-section">
            <p class="share-description">Comparte esta sesión con amigos usando el siguiente enlace:</p>
            <div class="url-container">
              <input 
                :value="shareUrl" 
                readonly 
                class="url-input" 
                ref="shareUrlInput"
                @click="copyShareUrl"
              />
              <button @click="copyShareUrl" class="copy-url-btn">
                {{ showCopyUrlSuccess ? '✅ Copiado!' : '📋 Copiar' }}
              </button>
            </div>
          </div>
          
          <div class="share-actions">
            <button @click="showShareModal = false" class="modal-close">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive } from 'vue'

export default {
  name: 'App',
  data() {
    return {
      // Audio
      audio: null,
      master: null,
      masterGain: 0.85,
      isPlaying: false,
      currentStep: 0,
      timerID: null,
      metronomeOn: false,
      scheduleAheadTime: 0.2,
      lookahead: 50,
      nextNoteTime: 0,
      
      // Tracks
      tracks: [
        { name: 'Kick', type: 'kick', steps: Array(16).fill(false) },
        { name: 'Snare', type: 'snare', steps: Array(16).fill(false) },
        { name: 'Hat', type: 'hat', steps: Array(16).fill(false) }
      ],
      
      // Controls
      bpm: 100,
      swing: 0.1,
      density: 0.35,
      
      // Modals
      showAddTrackModal: false,
      showExportModal: false,
      showImportModal: false,
      showRecordingModal: false,
      showRecordingNameModal: false,
      showSessionsModal: false,
      showImportSessionModal: false, // Nuevo modal para importar sesión
      showSharedSessionModalFlag: false, // Nuevo modal para sesiones compartidas
      
      // Export/Import
      importSeed: '',
      importError: '',
      showCopySuccess: false,
      showImportSuccess: false,
      showSaveSuccess: false,
      
      // Theme
      isLightMode: true,
      currentTrackIndex: 0,
      
      // Recording system
      isRecording: false,
      recordingStartTime: 0,
      recordingEvents: [],
      recordingSessionId: null,
      recordingSessionData: null,
      recordingSessionName: '',
      
      // Sessions management
      savedSessions: [],
      showSessionsModal: false,
      showImportSessionModal: false,
      
      // Import session modal
      importSessionSeed: '',
      importSessionError: '',
      importSessionSuccess: false,
      importedSessionName: '',
      
      // Session playback state
      isPlayingSession: false,
      currentSession: null,
      sessionPlaybackStartTime: 0,
      sessionPlaybackProgress: 0,
      
      // Available track types
      availableTrackTypes: [
        { id: 'kick', name: 'Kick', description: 'Bajo profundo y potente', icon: '🥁' },
        { id: 'snare', name: 'Snare', description: 'Caja seca y crujiente', icon: '🥁' },
        { id: 'hat', name: 'Hi-Hat', description: 'Platillo agudo y brillante', icon: '🥁' },
        { id: 'tom', name: 'Tom', description: 'Tom medio y resonante', icon: '🥁' },
        { id: 'clap', name: 'Clap', description: 'Aplauso electrónico', icon: '👏' },
        { id: 'cymbal', name: 'Cymbal', description: 'Platillo crash', icon: '🥁' },
        { id: 'bass', name: 'Bass', description: 'Bajo sintético', icon: '🎸' },
        { id: 'lead', name: 'Lead', description: 'Lead sintético', icon: '🎹' }
      ],

      // New data for import session modal
      importSessionSeed: '',
      importSessionError: '',
      importSessionSuccess: false,
      importedSessionName: '',

      // Shared session data
      sharedSessionData: null,
      
      // Share functionality
      isSharingSession: false,
      showShareSuccess: false,
      
      // New share modal
      showShareModal: false,
      currentShareSession: null,
      shareUrl: '',
      showCopyUrlSuccess: false,
    }
  },
  computed: {
    currentSeed() {
      // Crear un seed más robusto que incluya toda la información del patrón
      const patternData = {
        version: '1.0',
        bpm: this.bpm,
        swing: this.swing,
        density: this.density,
        tracks: this.tracks.map(track => ({
          name: track.name,
          type: track.type,
          steps: track.steps
        }))
      };
      
      // Convertir a string y codificar en base64
      const jsonString = JSON.stringify(patternData);
      return btoa(jsonString);
    }
  },
  watch: {
    bpm() {
      this.updateBpm();
    },
    swing() {
      this.updateSwing();
    },
    masterGain() {
      this.updateMasterGain();
    },
    density() {
      this.updateDensity();
    }
  },
  mounted() {
    // Prefill con un patrón básico
    this.tracks[0].steps = [true,false,false,false, true,false,false,false, true,false,false,false, true,false,false,false]; // kick a negras
    this.tracks[1].steps = [false,false,false,false, true,false,false,false, false,false,false,false, true,false,false,false]; // snare en 2 y 4
    this.tracks[2].steps = [true,true,true,true, true,true,true,true, true,true,true,true, true,true,true,true]; // hats a corcheas

    // Inicializar tema desde localStorage
    const savedTheme = localStorage.getItem('beatbot-theme');
    if (savedTheme) {
      this.isLightMode = savedTheme === 'light';
    } else {
      // Detectar preferencia del sistema
      this.isLightMode = window.matchMedia('(prefers-color-scheme: light)').matches;
    }
    this.applyTheme();

    // Pausar si se oculta la pestaña (evita desincronía)
    document.addEventListener('visibilitychange', () => {
      if(document.hidden && this.isPlaying) {
        this.toggle();
      }
    });

    // Mejoras para móviles
    this.setupMobileFeatures();
    
    // Escuchar cambios de orientación
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleOrientationChange();
      }, 100);
    });
    
    // Escuchar cambios de tamaño de ventana
    window.addEventListener('resize', () => {
      this.handleResize();
    });

    // Cargar sesiones guardadas al montar
    this.loadSavedSessions();
    
    // Iniciar timer para actualizar progreso de sesión
    this.startSessionProgressTimer();

    // Check for shared session URL
    this.checkForSharedSession();
  },
  methods: {
    // Original methods that were overridden
    start() {
      if (!this.isPlaying) {
        this.ensureAudio();
        this.isPlaying = true;
        this.currentStep = 0;
        this.nextNoteTime = this.audio.currentTime + 0.05;
        this.scheduler();
        this.timerID = setInterval(() => this.scheduler(), this.lookahead);
      }
    },
    
    stop() {
      this.isPlaying = false;
      if (this.timerID) {
        clearInterval(this.timerID);
        this.timerID = null;
      }
    },
    
    ensureAudio() {
      if (!this.audio) {
        this.audio = new (window.AudioContext || window.webkitAudioContext)();
        this.master = this.audio.createGain();
        this.master.connect(this.audio.destination);
        this.master.gain.value = this.masterGain;
      }
    },
    
    secondsPerStep() {
      const spb = 60 / this.bpm;
      return spb / 4;
    },
    
    scheduler() {
      if (!this.isPlaying || !this.audio) return;
      while (this.nextNoteTime < this.audio.currentTime + this.scheduleAheadTime) {
        let playTime = this.nextNoteTime;
        if (this.currentStep % 2 === 1) {
          playTime += this.swing * this.secondsPerStep() * 0.5;
        }
        this.scheduleStep(this.currentStep, playTime);
        this.advanceStep();
      }
    },
    
    advanceStep() {
      const stepLen = this.secondsPerStep();
      this.nextNoteTime += stepLen;
      this.currentStep = (this.currentStep + 1) % 16;
    },
    
    scheduleStep(step, time) {
      this.currentStep = step;
      
      if (this.metronomeOn && step % 4 === 0) {
        this.playClick(time, step === 0 ? 1200 : 900);
      }
      
      this.tracks.forEach((t, idx) => {
        if (t.steps[step]) {
          this.playTrack(t, time);
        }
      });
    },
    
    playTrack(track, time) {
      switch (track.type) {
        case 'kick':
          this.playKick(time);
          break;
        case 'snare':
          this.playSnare(time);
          break;
        case 'hat':
          this.playHat(time);
          break;
        case 'tom':
          this.playTom(time);
          break;
        case 'clap':
          this.playClap(time);
          break;
        case 'cymbal':
          this.playCymbal(time);
          break;
        case 'bass':
          this.playBass(time);
          break;
        case 'lead':
          this.playLead(time);
          break;
        default:
          this.playKick(time);
      }
    },
    
    // Synthesizers
    playKick(time) {
      const o = this.audio.createOscillator();
      const g = this.audio.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(140, time);
      o.frequency.exponentialRampToValueAtTime(40, time + 0.12);
      g.gain.setValueAtTime(1, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.14);
      o.connect(g).connect(this.master);
      o.start(time);
      o.stop(time + 0.16);
    },
    
    playSnare(time) {
      const bufferSize = this.audio.sampleRate * 0.2;
      const buffer = this.audio.createBuffer(1, bufferSize, this.audio.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.audio.createBufferSource();
      noise.buffer = buffer;
      const bp = this.audio.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1800, time);
      const hp = this.audio.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(700, time);
      const g = this.audio.createGain();
      g.gain.setValueAtTime(0.6, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
      noise.connect(bp).connect(hp).connect(g).connect(this.master);
      noise.start(time);
      noise.stop(time + 0.2);
    },
    
    playHat(time) {
      const bufferSize = this.audio.sampleRate * 0.05;
      const buffer = this.audio.createBuffer(1, bufferSize, this.audio.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.6;
      }
      const noise = this.audio.createBufferSource();
      noise.buffer = buffer;
      const hp = this.audio.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(6000, time);
      const g = this.audio.createGain();
      g.gain.setValueAtTime(0.4, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
      noise.connect(hp).connect(g).connect(this.master);
      noise.start(time);
      noise.stop(time + 0.06);
    },
    
    playTom(time) {
      const o = this.audio.createOscillator();
      const g = this.audio.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(200, time);
      o.frequency.exponentialRampToValueAtTime(80, time + 0.15);
      g.gain.setValueAtTime(0.8, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
      o.connect(g).connect(this.master);
      o.start(time);
      o.stop(time + 0.2);
    },
    
    playClap(time) {
      const bufferSize = this.audio.sampleRate * 0.1;
      const buffer = this.audio.createBuffer(1, bufferSize, this.audio.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.8;
      }
      const noise = this.audio.createBufferSource();
      noise.buffer = buffer;
      const hp = this.audio.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(1000, time);
      const g = this.audio.createGain();
      g.gain.setValueAtTime(0.5, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
      noise.connect(hp).connect(g).connect(this.master);
      noise.start(time);
      noise.stop(time + 0.1);
    },
    
    playCymbal(time) {
      const bufferSize = this.audio.sampleRate * 0.3;
      const buffer = this.audio.createBuffer(1, bufferSize, this.audio.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.7;
      }
      const noise = this.audio.createBufferSource();
      noise.buffer = buffer;
      const hp = this.audio.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(8000, time);
      const g = this.audio.createGain();
      g.gain.setValueAtTime(0.3, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
      noise.connect(hp).connect(g).connect(this.master);
      noise.start(time);
      noise.stop(time + 0.3);
    },
    
    playBass(time) {
      const o = this.audio.createOscillator();
      const g = this.audio.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(80, time);
      o.frequency.exponentialRampToValueAtTime(40, time + 0.2);
      g.gain.setValueAtTime(0.6, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
      o.connect(g).connect(this.master);
      o.start(time);
      o.stop(time + 0.25);
    },
    
    playLead(time) {
      const o = this.audio.createOscillator();
      const g = this.audio.createGain();
      o.type = 'square';
      o.frequency.setValueAtTime(440, time);
      g.gain.setValueAtTime(0.4, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
      o.connect(g).connect(this.master);
      o.start(time);
      o.stop(time + 0.1);
    },
    
    playClick(time, freq = 1000) {
      const o = this.audio.createOscillator();
      const g = this.audio.createGain();
      o.type = 'square';
      o.frequency.setValueAtTime(freq, time);
      g.gain.setValueAtTime(0.15, time);
      g.gain.exponentialRampToValueAtTime(0.0001, time + 0.03);
      o.connect(g).connect(this.master);
      o.start(time);
      o.stop(time + 0.04);
    },
    
    // Recording methods
    startRecording() {
      this.isRecording = true;
      this.recordingStartTime = Date.now();
      this.recordingEvents = [];
      this.recordingSessionId = this.generateSessionId();
      this.recordingSessionName = '';
      
      // Record initial state
      this.recordEvent('session_start', {
        bpm: this.bpm,
        swing: this.swing,
        masterGain: this.masterGain,
        density: this.density,
        tracks: JSON.parse(JSON.stringify(this.tracks)),
        metronomeOn: this.metronomeOn
      });
      
      console.log('🎙️ Recording started:', this.recordingSessionId);
    },
    
    stopRecording() {
      if (!this.isRecording) return;
      
      this.isRecording = false;
      this.recordEvent('session_end', {});
      
      const sessionData = this.generateSessionData();
      this.recordingSessionData = sessionData;
      
      // Show naming modal
      this.showRecordingNameModal = true;
    },
    
    recordEvent(type, data) {
      if (!this.isRecording) return;
      
      const timestamp = Date.now() - this.recordingStartTime;
      const event = {
        type,
        timestamp,
        data,
        sessionTime: this.formatTime(timestamp)
      };
      
      this.recordingEvents.push(event);
      console.log('📝 Recorded event:', event);
    },
    
    generateSessionId() {
      return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    generateSessionData() {
      const sessionData = {
        version: '2.0',
        sessionId: this.recordingSessionId,
        startTime: this.recordingStartTime,
        duration: Date.now() - this.recordingStartTime,
        events: this.recordingEvents,
        finalState: {
          bpm: this.bpm,
          swing: this.swing,
          masterGain: this.masterGain,
          density: this.density,
          tracks: JSON.parse(JSON.stringify(this.tracks)),
          metronomeOn: this.metronomeOn
        }
      };
      
      return sessionData;
    },
    
    formatTime(milliseconds) {
      const seconds = Math.floor(milliseconds / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },
    
    getCurrentSessionTime() {
      if (!this.isRecording) return '0:00';
      const currentTime = Date.now() - this.recordingStartTime;
      return this.formatTime(currentTime);
    },
    
    // Export/Import methods
    copySeed() {
      const seedInput = this.$refs.seedInput;
      if (seedInput) {
        seedInput.select();
        seedInput.setSelectionRange(0, 99999);
        
        try {
          if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(this.currentSeed).then(() => {
              this.showCopySuccess = true;
              setTimeout(() => {
                this.showCopySuccess = false;
              }, 2000);
            });
          } else {
            document.execCommand('copy');
            this.showCopySuccess = true;
            setTimeout(() => {
              this.showCopySuccess = false;
            }, 2000);
          }
        } catch (err) {
          console.error('Error al copiar:', err);
        }
      }
    },
    
    importPattern() {
      if (!this.importSeed.trim()) {
        this.importError = 'Por favor, introduce un código de semilla válido.';
        return;
      }
      
      try {
        const jsonString = atob(this.importSeed.trim());
        const patternData = JSON.parse(jsonString);
        
        if (!patternData.version || patternData.version !== '1.0') {
          this.importError = 'Formato de semilla inválido. Versión no soportada.';
          return;
        }
        
        if (!patternData.tracks || !Array.isArray(patternData.tracks)) {
          this.importError = 'Formato de semilla inválido. Datos de pistas faltantes.';
          return;
        }
        
        if (patternData.bpm && patternData.bpm >= 60 && patternData.bpm <= 200) {
          this.bpm = patternData.bpm;
        }
        
        if (patternData.swing !== undefined && patternData.swing >= 0 && patternData.swing <= 0.6) {
          this.swing = patternData.swing;
        }
        
        if (patternData.density !== undefined && patternData.density >= 0 && patternData.density <= 1) {
          this.density = patternData.density;
        }
        
        this.tracks = patternData.tracks.map(track => ({
          name: track.name || 'Pista',
          type: track.type || 'kick',
          steps: Array.isArray(track.steps) ? track.steps : Array(16).fill(false)
        }));
        
        this.showImportModal = false;
        this.importError = '';
        this.importSeed = '';
        
        this.showImportSuccess = true;
        setTimeout(() => {
          this.showImportSuccess = false;
        }, 3000);
        
      } catch (error) {
        console.error('Error al importar:', error);
        this.importError = 'Error al importar el patrón. Verifica que el código sea válido.';
      }
    },
    
    // Override existing methods to record events
    toggle() {
      if (this.isPlaying) {
        this.stop();
        if (this.isRecording) {
          this.recordEvent('playback_stop', {});
        }
      } else {
        this.start();
        if (this.isRecording) {
          this.recordEvent('playback_start', {});
        }
      }
    },
    
    toggleStep(trackIndex, stepIndex) {
      this.tracks[trackIndex].steps[stepIndex] = !this.tracks[trackIndex].steps[stepIndex];
      
      if (this.isRecording) {
        this.recordEvent('step_toggle', {
          trackIndex,
          stepIndex,
          newState: this.tracks[trackIndex].steps[stepIndex]
        });
      }
    },
    
    updateBpm() {
      if (this.isRecording) {
        this.recordEvent('bpm_change', {
          oldBpm: this.bpm,
          newBpm: this.bpm
        });
      }
    },
    
    updateSwing() {
      if (this.isRecording) {
        this.recordEvent('swing_change', {
          oldSwing: this.swing,
          newSwing: this.swing
        });
      }
    },
    
    updateMasterGain() {
      if (this.master) {
        this.master.gain.setValueAtTime(this.masterGain, this.audio.currentTime);
      }
      
      if (this.isRecording) {
        this.recordEvent('volume_change', {
          oldVolume: this.masterGain,
          newVolume: this.masterGain
        });
      }
    },
    
    updateDensity() {
      if (this.isRecording) {
        this.recordEvent('density_change', {
          oldDensity: this.density,
          newDensity: this.density
        });
      }
    },
    
    toggleMetronome() {
      this.metronomeOn = !this.metronomeOn;
      
      if (this.isRecording) {
        this.recordEvent('metronome_toggle', {
          newState: this.metronomeOn
        });
      }
    },
    
    addTrack(trackType) {
      const newTrack = {
        name: `${trackType.name} ${this.tracks.length + 1}`,
        type: trackType.id,
        steps: Array(16).fill(false)
      };
      
      this.tracks.push(newTrack);
      this.showAddTrackModal = false;
      
      if (this.isRecording) {
        this.recordEvent('track_added', {
          trackType: trackType.id,
          trackName: newTrack.name,
          trackIndex: this.tracks.length - 1
        });
      }
    },
    
    removeTrack(index) {
      if (this.tracks.length > 1) {
        const removedTrack = this.tracks[index];
        this.tracks.splice(index, 1);
        
        if (this.isRecording) {
          this.recordEvent('track_removed', {
            trackIndex: index,
            trackName: removedTrack.name,
            trackType: removedTrack.type
          });
        }
      }
    },
    
    clearAll() {
      const oldTracks = JSON.parse(JSON.stringify(this.tracks));
      this.tracks.forEach(track => {
        track.steps.fill(false);
      });
      
      if (this.isRecording) {
        this.recordEvent('clear_all', {
          oldTracks
        });
      }
    },
    
    randomize() {
      const oldTracks = JSON.parse(JSON.stringify(this.tracks));
      
      this.tracks.forEach(track => {
        track.steps = track.steps.map(() => Math.random() < this.density);
      });
      
      if (this.isRecording) {
        this.recordEvent('randomize', {
          oldTracks,
          newTracks: JSON.parse(JSON.stringify(this.tracks)),
          density: this.density
        });
      }
    },
    
    // Session playback methods with feedback
    playSession(sessionData) {
      if (!sessionData || !sessionData.events) return;
      
      // Set session playback state
      this.isPlayingSession = true;
      this.currentSession = sessionData;
      this.sessionPlaybackStartTime = Date.now();
      this.sessionPlaybackProgress = 0;
      
      // Reset to initial state
      const initialEvent = sessionData.events.find(e => e.type === 'session_start');
      if (initialEvent) {
        this.bpm = initialEvent.data.bpm;
        this.swing = initialEvent.data.swing;
        this.masterGain = initialEvent.data.masterGain;
        this.density = initialEvent.data.density;
        this.tracks = JSON.parse(JSON.stringify(initialEvent.data.tracks));
        this.metronomeOn = initialEvent.data.metronomeOn;
      }
      
      // Play events in sequence
      sessionData.events.forEach(event => {
        setTimeout(() => {
          this.replayEvent(event);
          this.updateSessionPlaybackProgress(event.timestamp);
        }, event.timestamp);
      });
      
      // Set timeout to end session playback
      const totalDuration = sessionData.duration || 0;
      setTimeout(() => {
        this.stopSessionPlayback();
      }, totalDuration);
      
      console.log('▶️ Playing session:', sessionData.sessionId);
    },
    
    stopSessionPlayback() {
      this.isPlayingSession = false;
      this.currentSession = null;
      this.sessionPlaybackStartTime = 0;
      this.sessionPlaybackProgress = 0;
      console.log('⏹️ Session playback stopped');
    },
    
    updateSessionPlaybackProgress(timestamp) {
      if (this.currentSession) {
        this.sessionPlaybackProgress = timestamp;
      }
    },
    
    getSessionPlaybackTime() {
      if (!this.isPlayingSession || !this.sessionPlaybackStartTime) return '0:00';
      const currentTime = Date.now() - this.sessionPlaybackStartTime;
      return this.formatTime(currentTime);
    },
    
    getSessionPlaybackProgress() {
      if (!this.currentSession || !this.currentSession.duration) return 0;
      return (this.sessionPlaybackProgress / this.currentSession.duration) * 100;
    },
    
    // Override existing playSavedSession method
    playSavedSession(sessionId) {
      const session = this.savedSessions.find(s => s.id === sessionId);
      if (session) {
        this.playSession(session.data);
        console.log('▶️ Playing saved session:', session.name);
      }
    },
    
    replayEvent(event) {
      switch (event.type) {
        case 'step_toggle':
          this.tracks[event.data.trackIndex].steps[event.data.stepIndex] = event.data.newState;
          break;
        case 'bpm_change':
          this.bpm = event.data.newBpm;
          break;
        case 'swing_change':
          this.swing = event.data.newSwing;
          break;
        case 'volume_change':
          this.masterGain = event.data.newVolume;
          this.updateMasterGain();
          break;
        case 'density_change':
          this.density = event.data.newDensity;
          break;
        case 'metronome_toggle':
          this.metronomeOn = event.data.newState;
          break;
        case 'playback_start':
          if (!this.isPlaying) this.start();
          break;
        case 'playback_stop':
          if (this.isPlaying) this.stop();
          break;
        case 'clear_all':
          this.tracks = JSON.parse(JSON.stringify(event.data.oldTracks));
          break;
        case 'randomize':
          this.tracks = JSON.parse(JSON.stringify(event.data.newTracks));
          break;
      }
    },
    
    // Export/Import session methods
    exportSession() {
      const sessionData = this.generateSessionData();
      const sessionSeed = btoa(JSON.stringify(sessionData));
      return sessionSeed;
    },
    
    importSession(sessionSeed) {
      try {
        const sessionData = JSON.parse(atob(sessionSeed));
        
        if (!sessionData.version || sessionData.version !== '2.0') {
          throw new Error('Versión de sesión no soportada');
        }
        
        if (!sessionData.events || !Array.isArray(sessionData.events)) {
          throw new Error('Formato de sesión inválido');
        }
        
        // Apply final state
        const finalState = sessionData.finalState;
        this.bpm = finalState.bpm;
        this.swing = finalState.swing;
        this.masterGain = finalState.masterGain;
        this.density = finalState.density;
        this.tracks = JSON.parse(JSON.stringify(finalState.tracks));
        this.metronomeOn = finalState.metronomeOn;
        
        return sessionData;
      } catch (error) {
        console.error('Error importing session:', error);
        throw new Error('Error al importar la sesión. Verifica que el código sea válido.');
      }
    },
    toggleTheme() {
      this.isLightMode = !this.isLightMode;
      this.applyTheme();
      localStorage.setItem('beatbot-theme', this.isLightMode ? 'light' : 'dark');
    },
    applyTheme() {
      document.documentElement.classList.toggle('theme-light', this.isLightMode);
      document.documentElement.classList.toggle('theme-dark', !this.isLightMode);
    },
    setupMobileFeatures() {
      // Detectar si es móvil
      const isMobile = window.innerWidth <= 640;
      
      if (isMobile) {
        // Añadir clase para móviles
        document.body.classList.add('mobile-device');
        
        // Mejorar la experiencia táctil
        this.setupTouchInteractions();
        
        // Optimizar el scroll
        this.setupSmoothScroll();
        
        // Mejorar la accesibilidad
        this.setupMobileAccessibility();
      }
    },
    
    setupTouchInteractions() {
      // Mejorar feedback táctil para celdas
      const cells = document.querySelectorAll('.cell');
      cells.forEach(cell => {
        cell.addEventListener('touchstart', (e) => {
          cell.style.transform = 'scale(0.95)';
        });
        
        cell.addEventListener('touchend', (e) => {
          cell.style.transform = 'scale(1)';
        });
      });
      
      // Mejorar feedback táctil para botones
      const buttons = document.querySelectorAll('button, .btn');
      buttons.forEach(button => {
        button.addEventListener('touchstart', (e) => {
          button.style.transform = 'scale(0.98)';
        });
        
        button.addEventListener('touchend', (e) => {
          button.style.transform = 'scale(1)';
        });
      });
    },
    
    setupSmoothScroll() {
      // Scroll suave para el grid
      const grid = document.querySelector('.grid');
      if (grid) {
        grid.style.scrollBehavior = 'smooth';
        grid.style.webkitOverflowScrolling = 'touch';
      }
    },
    
    setupMobileAccessibility() {
      // Mejorar navegación por teclado en móviles
      const focusableElements = document.querySelectorAll('button, input, .cell, .track-type');
      focusableElements.forEach(element => {
        element.setAttribute('tabindex', '0');
      });
      
      // Añadir soporte para gestos de swipe (opcional)
      this.setupSwipeGestures();
    },
    
    setupSwipeGestures() {
      // Implementar gestos de swipe para navegar entre pistas
      let startX = 0;
      let startY = 0;
      
      document.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      });
      
      document.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        // Detectar swipe horizontal
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
          if (diffX > 0) {
            // Swipe izquierda - siguiente pista
            this.nextTrack();
          } else {
            // Swipe derecha - pista anterior
            this.previousTrack();
          }
        }
      });
    },
    
    nextTrack() {
      // Navegar a la siguiente pista
      const currentTrack = this.currentTrackIndex || 0;
      if (currentTrack < this.tracks.length - 1) {
        this.currentTrackIndex = currentTrack + 1;
        this.scrollToTrack(this.currentTrackIndex);
      }
    },
    
    previousTrack() {
      // Navegar a la pista anterior
      const currentTrack = this.currentTrackIndex || 0;
      if (currentTrack > 0) {
        this.currentTrackIndex = currentTrack - 1;
        this.scrollToTrack(this.currentTrackIndex);
      }
    },
    
    scrollToTrack(trackIndex) {
      // Scroll suave a la pista especificada
      const trackElement = document.querySelector(`[data-track-index="${trackIndex}"]`);
      if (trackElement) {
        trackElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    },

    handleOrientationChange() {
      // Reiniciar la reproducción si la orientación cambia
      if (this.isPlaying) {
        this.toggle();
      }
    },

    handleResize() {
      // Reiniciar la reproducción si el tamaño de la ventana cambia
      if (this.isPlaying) {
        this.toggle();
      }
    },

    copySessionSeed() {
      if (this.recordingSessionData) {
        const sessionSeed = this.exportSession();
        
        try {
          if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(sessionSeed).then(() => {
              this.showCopySuccess = true;
              setTimeout(() => {
                this.showCopySuccess = false;
              }, 2000);
            });
          } else {
            // Fallback para navegadores antiguos
            const textArea = document.createElement('textarea');
            textArea.value = sessionSeed;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            this.showCopySuccess = true;
            setTimeout(() => {
              this.showCopySuccess = false;
            }, 2000);
          }
        } catch (err) {
          console.error('Error al copiar sesión:', err);
        }
      }
    },

    getEventTypeName(type) {
      const eventNames = {
        'session_start': 'Inicio de Sesión',
        'session_end': 'Fin de Sesión',
        'step_toggle': 'Cambio de Paso',
        'bpm_change': 'Cambio de Tempo',
        'swing_change': 'Cambio de Swing',
        'volume_change': 'Cambio de Volumen',
        'density_change': 'Cambio de Densidad',
        'metronome_toggle': 'Cambio de Metrónomo',
        'playback_start': 'Reproducción Iniciada',
        'playback_stop': 'Reproducción Detenida',
        'clear_all': 'Limpiar Todos',
        'randomize': 'Aleatorizar',
        'track_added': 'Pista Añadida',
        'track_removed': 'Pista Eliminada',
      };
      
      return eventNames[type] || type;
    },
    
    getEventDetails(event) {
      switch (event.type) {
        case 'step_toggle':
          const trackName = this.tracks[event.data.trackIndex]?.name || 'Pista';
          return `Pista: ${trackName}, Paso: ${event.data.stepIndex + 1}, Estado: ${event.data.newState ? 'Activado' : 'Desactivado'}`;
        case 'bpm_change':
          return `Nuevo Tempo: ${event.data.newBpm} BPM`;
        case 'swing_change':
          return `Nuevo Swing: ${Math.round(event.data.newSwing * 100)}%`;
        case 'volume_change':
          return `Nuevo Volumen: ${Math.round(event.data.newVolume * 100)}%`;
        case 'density_change':
          return `Nueva Densidad: ${Math.round(event.data.newDensity * 100)}%`;
        case 'metronome_toggle':
          return `Metrónomo: ${event.data.newState ? 'Encendido' : 'Apagado'}`;
        case 'track_added':
          return `Tipo: ${event.data.trackType}, Nombre: ${event.data.trackName}`;
        case 'track_removed':
          return `Nombre: ${event.data.trackName}, Tipo: ${event.data.trackType}`;
        case 'clear_all':
          return 'Todas las pistas limpiadas';
        case 'randomize':
          return `Densidad: ${Math.round(event.data.density * 100)}%`;
        default:
          return '';
      }
    },

    // Sessions management methods
    loadSavedSessions() {
      const saved = localStorage.getItem('beatbot-sessions');
      if (saved) {
        try {
          this.savedSessions = JSON.parse(saved);
          // Initialize exporting state for each session
          this.savedSessions.forEach(session => {
            session.exporting = false;
          });
        } catch (error) {
          console.error('Error loading saved sessions:', error);
          this.savedSessions = [];
        }
      }
    },
    
    saveSessionsToStorage() {
      localStorage.setItem('beatbot-sessions', JSON.stringify(this.savedSessions));
    },
    
    saveSession(sessionData, name) {
      const session = {
        id: this.generateSessionId(),
        name: name || `Sesión ${new Date().toLocaleString()}`,
        timestamp: Date.now(),
        duration: sessionData.duration,
        eventsCount: sessionData.events.length,
        data: sessionData,
        exporting: false
      };
      
      this.savedSessions.unshift(session); // Añadir al principio
      this.saveSessionsToStorage();
      
      console.log('💾 Session saved:', session);
      return session;
    },
    
    deleteSession(sessionId) {
      const index = this.savedSessions.findIndex(s => s.id === sessionId);
      if (index !== -1) {
        this.savedSessions.splice(index, 1);
        this.saveSessionsToStorage();
        console.log('🗑️ Session deleted:', sessionId);
      }
    },
    
    exportSavedSession(sessionId) {
      const sessionIndex = this.savedSessions.findIndex(s => s.id === sessionId);
      if (sessionIndex !== -1) {
        const session = this.savedSessions[sessionIndex];
        const sessionSeed = btoa(JSON.stringify(session.data));
        
        // Set exporting state for this session
        this.savedSessions[sessionIndex] = { ...session, exporting: true };
        
        try {
          if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(sessionSeed).then(() => {
              // Show success feedback
              this.showCopySuccess = true;
              setTimeout(() => {
                this.savedSessions[sessionIndex] = { ...this.savedSessions[sessionIndex], exporting: false };
                this.showCopySuccess = false;
              }, 2000);
            }).catch(err => {
              console.error('Error al copiar sesión:', err);
              this.savedSessions[sessionIndex] = { ...this.savedSessions[sessionIndex], exporting: false };
            });
          } else {
            // Fallback para navegadores antiguos
            const textArea = document.createElement('textarea');
            textArea.value = sessionSeed;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            // Show success feedback
            this.showCopySuccess = true;
            setTimeout(() => {
              this.savedSessions[sessionIndex] = { ...this.savedSessions[sessionIndex], exporting: false };
              this.showCopySuccess = false;
            }, 2000);
          }
        } catch (err) {
          console.error('Error al copiar sesión:', err);
          this.savedSessions[sessionIndex] = { ...this.savedSessions[sessionIndex], exporting: false };
        }
        
        return sessionSeed;
      }
      return null;
    },
    
    formatSessionDuration(duration) {
      return this.formatTime(duration);
    },
    
    formatSessionDate(timestamp) {
      return new Date(timestamp).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
    saveRecordingWithName() {
      if (!this.recordingSessionData || !this.recordingSessionName.trim()) return;
      
      const session = this.saveSession(this.recordingSessionData, this.recordingSessionName.trim());
      this.showRecordingNameModal = false;
      this.recordingSessionName = '';
      this.recordingSessionData = null;
      
      // Show success message
      this.showSaveSuccess = true;
      setTimeout(() => {
        this.showSaveSuccess = false;
      }, 3000);
    },
    
    cancelRecording() {
      this.showRecordingNameModal = false;
      this.recordingSessionName = '';
      this.recordingSessionData = null;
    },

    // New methods for import session modal
    importSessionFromSeed() {
      if (!this.importSessionSeed.trim()) {
        this.importSessionError = 'Por favor, introduce un código de sesión válido.';
        return;
      }

      try {
        // Parse the session data without applying it to current state
        const sessionSeed = this.importSessionSeed.trim();
        const sessionData = JSON.parse(atob(sessionSeed));
        
        if (!sessionData.version || sessionData.version !== '2.0') {
          throw new Error('Versión de sesión no soportada');
        }
        
        if (!sessionData.events || !Array.isArray(sessionData.events)) {
          throw new Error('Formato de sesión inválido');
        }
        
        // Clear any previous errors
        this.importSessionError = '';
        this.importSessionSuccess = true;
        
        // Generate a name for the imported session
        const sessionName = sessionData.sessionId ? 
          `Sesión de ${sessionData.sessionId.split('_')[1] ? new Date(parseInt(sessionData.sessionId.split('_')[1])).toLocaleDateString() : 'Amigo'}` : 
          'Sesión Importada';
        
        this.importedSessionName = sessionName;

        // Add the imported session to savedSessions
        const importedSession = {
          id: this.generateSessionId(),
          name: sessionName,
          timestamp: Date.now(),
          duration: sessionData.duration || 0,
          eventsCount: sessionData.events ? sessionData.events.length : 0,
          data: sessionData,
          exporting: false
        };

        this.savedSessions.unshift(importedSession);
        this.saveSessionsToStorage();

        console.log('📥 Session imported:', importedSession);

        // Clear the form and show success message
        setTimeout(() => {
          this.importSessionSuccess = false;
          this.importedSessionName = '';
          this.importSessionSeed = '';
          this.showImportSessionModal = false;
        }, 3000);

      } catch (error) {
        console.error('Error importing session:', error);
        this.importSessionError = error.message || 'Error al importar la sesión. Verifica que el código sea válido.';
        this.importSessionSuccess = false;
        this.importedSessionName = '';
      }
    },

    // Shorten URL using TinyURL
    async shortenUrl(longUrl) {
      try {
        // Use TinyURL API (free, no API key required)
        const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
        
        if (!response.ok) {
          throw new Error('Error al acortar la URL');
        }
        
        const shortUrl = await response.text();
        
        // Validate that we got a proper URL back
        if (!shortUrl.startsWith('http')) {
          throw new Error('URL acortada inválida');
        }
        
        return shortUrl;
      } catch (error) {
        console.error('Error shortening URL:', error);
        
        // Fallback: try alternative URL shortener (is.gd)
        try {
          const response = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(longUrl)}`);
          
          if (!response.ok) {
            throw new Error('Error con URL shortener alternativo');
          }
          
          const shortUrl = await response.text();
          
          if (!shortUrl.startsWith('http')) {
            throw new Error('URL acortada inválida');
          }
          
          return shortUrl;
        } catch (fallbackError) {
          console.error('Error with fallback URL shortener:', fallbackError);
          
          // If all URL shorteners fail, return the original URL
          return longUrl;
        }
      }
    },

    // Compress session data for shorter URLs
    compressSessionData(sessionData) {
      try {
        // Create a minimal version of the session data
        const minimalData = {
          v: '2.0', // version
          n: sessionData.sessionId || 'session',
          d: sessionData.duration || 0,
          e: sessionData.events ? sessionData.events.length : 0,
          f: sessionData.finalState ? {
            b: sessionData.finalState.bpm || 100,
            s: sessionData.finalState.swing || 0.1,
            v: sessionData.finalState.masterGain || 0.85,
            d: sessionData.finalState.density || 0.35,
            t: sessionData.finalState.tracks || [],
            m: sessionData.finalState.metronomeOn || false
          } : null,
          ev: sessionData.events ? sessionData.events.map(event => ({
            t: event.type,
            ts: event.timestamp,
            d: event.data
          })) : []
        };

        // Convert to JSON
        const jsonData = JSON.stringify(minimalData);
        
        // Compress using a more efficient method
        let compressed = this.compressString(jsonData);
        
        // Make URL-safe
        compressed = compressed
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
        
        // If still too long, truncate and add hash
        if (compressed.length > 1500) {
          const hash = this.generateHash(jsonData);
          compressed = compressed.substring(0, 1200) + '_' + hash.substring(0, 8);
        }
        
        return compressed;
      } catch (error) {
        console.error('Error compressing session data:', error);
        throw new Error('Error al comprimir los datos de la sesión');
      }
    },

    // Simple string compression
    compressString(str) {
      // Remove unnecessary whitespace and quotes
      let compressed = str.replace(/\s+/g, '').replace(/"/g, '');
      
      // Replace common patterns with shorter codes
      const replacements = {
        'session_start': 'ss',
        'session_end': 'se',
        'step_toggle': 'st',
        'bpm_change': 'bc',
        'swing_change': 'sc',
        'volume_change': 'vc',
        'density_change': 'dc',
        'metronome_toggle': 'mt',
        'playback_start': 'ps',
        'playback_stop': 'pst',
        'clear_all': 'ca',
        'randomize': 'r',
        'track_added': 'ta',
        'track_removed': 'tr'
      };
      
      for (const [key, value] of Object.entries(replacements)) {
        compressed = compressed.replace(new RegExp(key, 'g'), value);
      }
      
      // Encode to base64
      return btoa(compressed);
    },

    // Decompress session data from URL
    decompressSessionData(compressedData) {
      try {
        // Restore URL-safe characters
        let decompressed = compressedData
          .replace(/-/g, '+')
          .replace(/_/g, '/');
        
        // Add padding if needed
        while (decompressed.length % 4) {
          decompressed += '=';
        }
        
        // Decode base64
        const jsonData = atob(decompressed);
        
        // Restore common patterns
        let restored = jsonData;
        const replacements = {
          'ss': 'session_start',
          'se': 'session_end',
          'st': 'step_toggle',
          'bc': 'bpm_change',
          'sc': 'swing_change',
          'vc': 'volume_change',
          'dc': 'density_change',
          'mt': 'metronome_toggle',
          'ps': 'playback_start',
          'pst': 'playback_stop',
          'ca': 'clear_all',
          'r': 'randomize',
          'ta': 'track_added',
          'tr': 'track_removed'
        };
        
        for (const [key, value] of Object.entries(replacements)) {
          restored = restored.replace(new RegExp(key, 'g'), value);
        }
        
        // Parse JSON
        const sessionData = JSON.parse(restored);
        
        // Restore full session data structure
        return {
          version: sessionData.v,
          sessionId: sessionData.n,
          duration: sessionData.d,
          events: sessionData.ev.map(event => ({
            type: event.t,
            timestamp: event.ts,
            data: event.d,
            sessionTime: this.formatTime(event.ts)
          })),
          finalState: sessionData.f ? {
            bpm: sessionData.f.b,
            swing: sessionData.f.s,
            masterGain: sessionData.f.v,
            density: sessionData.f.d,
            tracks: sessionData.f.t,
            metronomeOn: sessionData.f.m
          } : null
        };
      } catch (error) {
        console.error('Error decompressing session data:', error);
        throw new Error('Error al descomprimir los datos de la sesión');
      }
    },

    // Generate a simple hash for data integrity
    generateHash(data) {
      let hash = 0;
      if (data.length === 0) return hash.toString();
      
      for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      return Math.abs(hash).toString(36);
    },

    // Generate share URL for session
    generateShareUrl(sessionId) {
      const session = this.savedSessions.find(s => s.id === sessionId);
      if (session) {
        try {
          // Compress session data for shorter URLs
          const compressedData = this.compressSessionData(session.data);
          const shareUrl = `${window.location.origin}/share/${compressedData}`;
          this.shareUrl = shareUrl;
          console.log('🔗 Generated share URL:', shareUrl);
        } catch (error) {
          console.error('Error generating share URL:', error);
          this.shareUrl = 'Error al generar el enlace';
        }
      }
    },

    // Copy share URL
    copyShareUrl() {
      const shareUrlInput = this.$refs.shareUrlInput;
      if (shareUrlInput) {
        shareUrlInput.select();
        shareUrlInput.setSelectionRange(0, 99999);
        
        try {
          if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(this.shareUrl).then(() => {
              this.showCopyUrlSuccess = true;
              setTimeout(() => {
                this.showCopyUrlSuccess = false;
              }, 2000);
            });
          } else {
            document.execCommand('copy');
            this.showCopyUrlSuccess = true;
            setTimeout(() => {
              this.showCopyUrlSuccess = false;
            }, 2000);
          }
        } catch (err) {
          console.error('Error al copiar URL:', err);
        }
      }
    },

    // Minimize share modal
    minimizeShareModal() {
      this.showShareModal = false;
    },

    startSessionProgressTimer() {
      // Actualizar progreso de sesión cada 100ms
      setInterval(() => {
        if (this.isPlayingSession && this.sessionPlaybackStartTime) {
          const currentTime = Date.now() - this.sessionPlaybackStartTime;
          this.sessionPlaybackProgress = Math.min(currentTime, this.currentSession?.duration || 0);
        }
      }, 100);
    },

    checkForSharedSession() {
      const path = window.location.pathname;
      const shareMatch = path.match(/\/share\/(.+)/);
      
      if (shareMatch) {
        const compressedData = shareMatch[1];
        try {
          const sessionData = this.decompressSessionData(compressedData);
          
          // Show a modal to confirm importing the shared session
          this.showSharedSessionModal(sessionData);
        } catch (error) {
          console.error('Error loading shared session:', error);
          alert('Error al cargar la sesión compartida. El enlace puede estar corrupto o expirado.');
        }
      }
    },

    // Show modal for shared session
    showSharedSessionModal(sessionData) {
      this.sharedSessionData = sessionData;
      this.showSharedSessionModalFlag = true;
    },

    // Import shared session
    importSharedSession() {
      if (this.sharedSessionData) {
        try {
          // Generate a name for the imported session
          const sessionName = this.sharedSessionData.sessionId ? 
            `Sesión Compartida - ${new Date().toLocaleDateString()}` : 
            'Sesión Compartida';
          
          // Add the imported session to savedSessions
          const importedSession = {
            id: this.generateSessionId(),
            name: sessionName,
            timestamp: Date.now(),
            duration: this.sharedSessionData.duration || 0,
            eventsCount: this.sharedSessionData.events ? this.sharedSessionData.events.length : 0,
            data: this.sharedSessionData,
            exporting: false
          };

          this.savedSessions.unshift(importedSession);
          this.saveSessionsToStorage();

          console.log('📥 Shared session imported:', importedSession);

          // Close modal and show success
          this.showSharedSessionModalFlag = false;
          this.sharedSessionData = null;
          
          // Show success message
          this.showImportSuccess = true;
          this.importedSessionName = sessionName;
          setTimeout(() => {
            this.showImportSuccess = false;
            this.importedSessionName = '';
          }, 3000);

        } catch (error) {
          console.error('Error importing shared session:', error);
          alert('Error al importar la sesión compartida.');
        }
      }
    }
  }
}
</script>
