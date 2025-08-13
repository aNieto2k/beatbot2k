<template>
  <div v-if="showInstallPrompt" class="pwa-install-prompt">
    <div class="pwa-install-content">
      <div class="pwa-install-header">
        <span class="pwa-install-icon">📱</span>
        <h3>Instalar BeatBot2k</h3>
      </div>
      
      <p class="pwa-install-description">
        Instala BeatBot2k en tu dispositivo para acceder más rápido y disfrutar de una experiencia offline completa.
      </p>
      
      <div class="pwa-install-benefits">
        <div class="benefit-item">
          <span class="benefit-icon">⚡</span>
          <span>Acceso rápido desde el escritorio</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">📱</span>
          <span>Funciona sin conexión</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">🎵</span>
          <span>Experiencia nativa</span>
        </div>
      </div>
      
      <div class="pwa-install-actions">
        <button @click="installApp" class="pwa-install-btn primary">
          Instalar App
        </button>
        <button @click="dismissPrompt" class="pwa-install-btn secondary">
          Más tarde
        </button>
      </div>
      
      <button @click="dismissPrompt" class="pwa-install-close" title="Cerrar">
        ×
      </button>
    </div>
  </div>
</template>

<script>
import { usePWA } from '../composables/usePWA'

export default {
  name: 'PWAInstallPrompt',
  setup() {
    const { 
      showInstallPrompt, 
      installApp 
    } = usePWA()

    const dismissPrompt = () => {
      showInstallPrompt.value = false
    }

    return {
      showInstallPrompt,
      installApp,
      dismissPrompt
    }
  }
}
</script>

<style scoped>
.pwa-install-prompt {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
}

.pwa-install-content {
  background: var(--card-bg, #2d2d2d);
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.pwa-install-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.pwa-install-icon {
  font-size: 2rem;
}

.pwa-install-header h3 {
  margin: 0;
  color: var(--text-primary, #ffffff);
  font-size: 1.5rem;
}

.pwa-install-description {
  color: var(--text-secondary, #cccccc);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.pwa-install-benefits {
  margin-bottom: 2rem;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  color: var(--text-secondary, #cccccc);
}

.benefit-icon {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
}

.pwa-install-actions {
  display: flex;
  gap: 1rem;
  flex-direction: column;
}

.pwa-install-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.pwa-install-btn.primary {
  background: var(--primary-color, #4a90e2);
  color: white;
}

.pwa-install-btn.primary:hover {
  background: var(--primary-hover, #357abd);
  transform: translateY(-2px);
}

.pwa-install-btn.secondary {
  background: transparent;
  color: var(--text-secondary, #cccccc);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.pwa-install-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.pwa-install-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: var(--text-secondary, #cccccc);
  font-size: 1.5rem;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.pwa-install-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary, #ffffff);
}

@media (max-width: 480px) {
  .pwa-install-content {
    padding: 1.5rem;
    margin: 1rem;
  }
  
  .pwa-install-actions {
    flex-direction: column;
  }
  
  .pwa-install-btn {
    width: 100%;
  }
}
</style>
