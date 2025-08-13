<template>
  <div v-if="showUpdatePrompt" class="pwa-update-prompt">
    <div class="pwa-update-content">
      <div class="pwa-update-header">
        <span class="pwa-update-icon">🔄</span>
        <h3>Nueva Versión Disponible</h3>
      </div>
      
      <p class="pwa-update-description">
        Hay una nueva versión de BeatBot2k disponible con mejoras y correcciones.
      </p>
      
      <div class="pwa-update-benefits">
        <div class="benefit-item">
          <span class="benefit-icon">✨</span>
          <span>Nuevas funcionalidades</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">🐛</span>
          <span>Correcciones de errores</span>
        </div>
        <div class="benefit-item">
          <span class="benefit-icon">🚀</span>
          <span>Mejor rendimiento</span>
        </div>
      </div>
      
      <div class="pwa-update-actions">
        <button @click="updateApp" class="pwa-update-btn primary">
          Actualizar Ahora
        </button>
        <button @click="dismissPrompt" class="pwa-update-btn secondary">
          Más tarde
        </button>
      </div>
      
      <button @click="dismissPrompt" class="pwa-update-close" title="Cerrar">
        ×
      </button>
    </div>
  </div>
</template>

<script>
import { usePWA } from '../composables/usePWA'

export default {
  name: 'PWAUpdatePrompt',
  setup() {
    const { 
      showUpdatePrompt, 
      updateApp 
    } = usePWA()

    const dismissPrompt = () => {
      showUpdatePrompt.value = false
    }

    return {
      showUpdatePrompt,
      updateApp,
      dismissPrompt
    }
  }
}
</script>

<style scoped>
.pwa-update-prompt {
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

.pwa-update-content {
  background: var(--card-bg, #2d2d2d);
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.pwa-update-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.pwa-update-icon {
  font-size: 2rem;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.pwa-update-header h3 {
  margin: 0;
  color: var(--text-primary, #ffffff);
  font-size: 1.5rem;
}

.pwa-update-description {
  color: var(--text-secondary, #cccccc);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.pwa-update-benefits {
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

.pwa-update-actions {
  display: flex;
  gap: 1rem;
  flex-direction: column;
}

.pwa-update-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.pwa-update-btn.primary {
  background: var(--success-color, #28a745);
  color: white;
}

.pwa-update-btn.primary:hover {
  background: var(--success-hover, #218838);
  transform: translateY(-2px);
}

.pwa-update-btn.secondary {
  background: transparent;
  color: var(--text-secondary, #cccccc);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.pwa-update-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.pwa-update-close {
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

.pwa-update-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary, #ffffff);
}

@media (max-width: 480px) {
  .pwa-update-content {
    padding: 1.5rem;
    margin: 1rem;
  }
  
  .pwa-update-actions {
    flex-direction: column;
  }
  
  .pwa-update-btn {
    width: 100%;
  }
}
</style>
