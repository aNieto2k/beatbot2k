<template>
  <div class="wrap">
    <div class="card">
      <header>
        <h1>🥁 BeatBot — Vue + Web Audio</h1>
        <div class="controls">
          <button class="primary" @click="toggle()">{{ isPlaying ? 'Pausar' : 'Reproducir' }}</button>
          <button @click="randomize()">Aleatorizar</button>
          <button @click="clearAll()">Limpiar</button>
          <button @click="showAddTrackModal = true" class="add-track-btn">+ Pista</button>
          <button @click="showExportModal = true" class="export-btn">📤 Exportar</button>
          <button @click="showImportModal = true" class="import-btn">📥 Importar</button>
          <div class="toggle" @click="metronomeOn = !metronomeOn">
            <span class="led" :class="{on: metronomeOn}"></span>
            <span> Metrónomo </span>
          </div>
        </div>
      </header>

      <section class="panel">
        <div class="grid">
          <table>
            <tbody>
              <tr v-for="(track, t) in tracks" :key="t">
                <td class="rowLabel">
                  <div class="track-header">
                    <span>{{ track.name }}</span>
                    <span class="small">· {{ track.type }}</span>
                    <button @click="removeTrack(t)" class="remove-track-btn" title="Eliminar pista">×</button>
                  </div>
                </td>
                <td style="width:100%">
                  <div class="steps">
                    <div v-for="(on, s) in track.steps" :key="s"
                         class="cell" :class="{active: on, now: currentStep === s}"
                         @click="toggleStep(t, s)">
                      <div class="dot"></div>
                    </div>
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
  </div>
</template>

<script>
import { reactive } from 'vue'

export default {
  name: 'App',
  data() {
    return {
      audio: null,
      master: null,
      isPlaying: false,
      bpm: 100,
      swing: 0.1,
      masterGain: 0.85,
      metronomeOn: false,
      scheduleAheadTime: 0.2, // más holgura
      lookahead: 50, // ms
      currentStep: 0,
      nextNoteTime: 0,
      timerID: null,
      density: 0.35,
      tracks: [
        { name: 'Kick',  type: 'kick', steps: Array(16).fill(false) },
        { name: 'Snare', type: 'snare', steps: Array(16).fill(false) },
        { name: 'Hat',   type: 'hat', steps: Array(16).fill(false) }
      ],
      showAddTrackModal: false,
      showExportModal: false,
      showImportModal: false,
      importSeed: '',
      importError: '',
      availableTrackTypes: [
        { id: 'kick', name: 'Kick', description: 'Bajo sintético', icon: '🥁' },
        { id: 'snare', name: 'Snare', description: 'Caja sintética', icon: '🥁' },
        { id: 'hat', name: 'Hi-Hat', description: 'Hi-hat sintético', icon: '🥁' },
        { id: 'tom', name: 'Tom', description: 'Tom sintético', icon: '🥁' },
        { id: 'clap', name: 'Clap', description: 'Aplauso sintético', icon: '👏' },
        { id: 'cymbal', name: 'Cymbal', description: 'Plato sintético', icon: '🥁' },
        { id: 'bass', name: 'Bass', description: 'Bajo sintético', icon: '🎸' },
        { id: 'lead', name: 'Lead', description: 'Lead sintético', icon: '🎹' }
      ],
      showCopySuccess: false,
      showImportSuccess: false
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
  mounted() {
    // Prefill con un patrón básico
    this.tracks[0].steps = [true,false,false,false, true,false,false,false, true,false,false,false, true,false,false,false]; // kick a negras
    this.tracks[1].steps = [false,false,false,false, true,false,false,false, false,false,false,false, true,false,false,false]; // snare en 2 y 4
    this.tracks[2].steps = [true,true,true,true, true,true,true,true, true,true,true,true, true,true,true,true]; // hats a corcheas

    // Pausar si se oculta la pestaña (evita desincronía)
    document.addEventListener('visibilitychange', () => {
      if(document.hidden && this.isPlaying) {
        this.toggle();
      }
    });
  },
  methods: {
    ensureAudio() {
      if (this.audio) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      this.audio = new AC();
      this.master = this.audio.createGain();
      this.master.gain.value = this.masterGain;
      this.master.connect(this.audio.destination);
      if (this.audio.state === 'suspended') {
        this.audio.resume();
      }
    },
    updateMasterGain() {
      if (this.master) this.master.gain.value = this.masterGain;
    },
    toggle() {
      if(!this.isPlaying) {
        this.ensureAudio();
        this.isPlaying = true;
        this.currentStep = 0;
        this.nextNoteTime = this.audio.currentTime + 0.05;
        this.scheduler();
        // IMPORTANT: preservar el this
        this.timerID = setInterval(() => this.scheduler(), this.lookahead);
      } else {
        this.isPlaying = false;
        if (this.timerID) clearInterval(this.timerID);
      }
    },
    clearAll() {
      this.tracks.forEach(t => t.steps = t.steps.map(() => false));
    },
    randomize() {
      this.tracks.forEach((t, idx) => {
        t.steps = t.steps.map((_, i) => {
          if(idx === 1 && (i === 4 || i === 12)) return Math.random() < Math.max(this.density, 0.15);
          const weight = (i % 4 === 0) ? 0.6 : (i % 2 === 0 ? 0.35 : 0.2);
          return Math.random() < (this.density * weight);
        })
      })
    },
    toggleStep(t, s) {
      // Corregido: usar asignación directa para reactividad
      this.tracks[t].steps[s] = !this.tracks[t].steps[s];
    },
    secondsPerStep() {
      const spb = 60 / this.bpm; // segundos por negra
      return spb / 4; // 4 pasos por negra (16 por compás)
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
      // Actualizar currentStep de manera síncrona para la UI
      this.currentStep = step;

      if(this.metronomeOn && step % 4 === 0) {
        this.playClick(time, step === 0 ? 1200 : 900);
      }

      this.tracks.forEach((t, idx) => {
        if(t.steps[step]) {
          this.playTrack(t, time);
        }
      });
    },
    playTrack(track, time) {
      switch(track.type) {
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
          this.playKick(time); // fallback
      }
    },
    // —— Sintetizadores ——
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
    addTrack(trackType) {
      const trackName = `${trackType.name} ${this.tracks.length + 1}`;
      this.tracks.push({ 
        name: trackName, 
        type: trackType.id, 
        steps: Array(16).fill(false) 
      });
      this.showAddTrackModal = false;
    },
    removeTrack(index) {
      if (this.tracks.length > 1) {
        this.tracks.splice(index, 1);
      }
    },
    copySeed() {
      const seedInput = this.$refs.seedInput;
      if (seedInput) {
        seedInput.select();
        seedInput.setSelectionRange(0, 99999); // Para móviles
        
        try {
          // Usar la API moderna del navegador
          if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(this.currentSeed).then(() => {
              this.showCopySuccess = true;
              setTimeout(() => {
                this.showCopySuccess = false;
              }, 2000);
            });
          } else {
            // Fallback para navegadores antiguos
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
        // Validar que sea un string base64 válido
        const jsonString = atob(this.importSeed.trim());
        const patternData = JSON.parse(jsonString);

        // Validar estructura del patrón
        if (!patternData.version || patternData.version !== '1.0') {
          this.importError = 'Formato de semilla inválido. Versión no soportada.';
          return;
        }

        if (!patternData.tracks || !Array.isArray(patternData.tracks)) {
          this.importError = 'Formato de semilla inválido. Datos de pistas faltantes.';
          return;
        }

        // Validar y aplicar los datos
        if (patternData.bpm && patternData.bpm >= 60 && patternData.bpm <= 200) {
          this.bpm = patternData.bpm;
        }
        
        if (patternData.swing !== undefined && patternData.swing >= 0 && patternData.swing <= 0.6) {
          this.swing = patternData.swing;
        }
        
        if (patternData.density !== undefined && patternData.density >= 0 && patternData.density <= 1) {
          this.density = patternData.density;
        }

        // Aplicar las pistas
        this.tracks = patternData.tracks.map(track => ({
          name: track.name || 'Pista',
          type: track.type || 'kick',
          steps: Array.isArray(track.steps) ? track.steps : Array(16).fill(false)
        }));

        this.showImportModal = false;
        this.importError = '';
        this.importSeed = '';
        
        // Mostrar mensaje de éxito
        this.showImportSuccess = true;
        setTimeout(() => {
          this.showImportSuccess = false;
        }, 3000);
        
      } catch (error) {
        console.error('Error al importar:', error);
        this.importError = 'Error al importar el patrón. Verifica que el código sea válido.';
      }
    }
  }
}
</script>
