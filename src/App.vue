<template>
  <div class="wrap">
    <div class="card">
      <header>
        <h1>🥁 BeatBot — Vue + Web Audio</h1>
        <div class="controls">
          <button class="primary" @click="toggle()">{{ isPlaying ? 'Pausar' : 'Reproducir' }}</button>
          <button @click="randomize()">Aleatorizar</button>
          <button @click="clearAll()">Limpiar</button>
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
                <td class="rowLabel">{{ track.name }} <span class="small">· {{ track.type }}</span></td>
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
          <span class="badge">Kick / Snare / Closed Hat</span>
          <span class="badge">Sin muestras · síntesis</span>
        </div>
      </section>

      <div class="footer">
        <div>Hecho con <code>Vue 3</code> + <code>WebAudio API</code></div>
        <div class="small">Tip: pulsa cualquier celda para activarla. Usa "Aleatorizar" para inspiración rápida.</div>
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
        { name: 'Kick',  type: 'synth', steps: Array(16).fill(false) },
        { name: 'Snare', type: 'synth', steps: Array(16).fill(false) },
        { name: 'Hat',   type: 'synth', steps: Array(16).fill(false) }
      ],
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
          if(idx === 0) this.playKick(time);
          if(idx === 1) this.playSnare(time);
          if(idx === 2) this.playHat(time);
        }
      });
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
    }
  }
}
</script>
