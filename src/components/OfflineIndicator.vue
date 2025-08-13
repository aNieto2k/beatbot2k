<template>
  <div v-if="isOffline" class="offline-indicator">
    <div class="offline-content">
      <span class="offline-icon">📡</span>
      <span class="offline-text">Sin conexión</span>
    </div>
  </div>
</template>

<script>
import { usePWA } from '../composables/usePWA'

export default {
  name: 'OfflineIndicator',
  setup() {
    const { isOffline } = usePWA()

    return {
      isOffline
    }
  }
}
</script>

<style scoped>
.offline-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--warning-color, #ffc107);
  color: var(--warning-text, #000);
  padding: 0.5rem 1rem;
  text-align: center;
  z-index: 9999;
  animation: slideDown 0.3s ease-out;
}

.offline-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.offline-icon {
  font-size: 1rem;
}

.offline-text {
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .offline-indicator {
    padding: 0.75rem;
  }
  
  .offline-content {
    font-size: 0.8rem;
  }
}
</style>
