import { ref, onMounted, onUnmounted } from 'vue'

export function usePWA() {
  const deferredPrompt = ref(null)
  const isInstallable = ref(false)
  const isInstalled = ref(false)
  const isOffline = ref(false)
  const showInstallPrompt = ref(false)
  const showUpdatePrompt = ref(false)
  const newVersionAvailable = ref(false)

  // Verificar si la app es instalable
  const checkInstallability = () => {
    // Verificar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
      isInstalled.value = true
      return
    }

    // Verificar si se puede instalar
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      isInstallable.value = true
    }
  }

  // Manejar el evento beforeinstallprompt
  const handleBeforeInstallPrompt = (e) => {
    e.preventDefault()
    deferredPrompt.value = e
    isInstallable.value = true
  }

  // Mostrar el prompt de instalación
  const installApp = async () => {
    if (!deferredPrompt.value) {
      console.log('No hay prompt de instalación disponible')
      return false
    }

    try {
      deferredPrompt.value.prompt()
      const { outcome } = await deferredPrompt.value.userChoice
      
      if (outcome === 'accepted') {
        console.log('Usuario aceptó la instalación')
        isInstalled.value = true
        isInstallable.value = false
        deferredPrompt.value = null
        return true
      } else {
        console.log('Usuario rechazó la instalación')
        return false
      }
    } catch (error) {
      console.error('Error durante la instalación:', error)
      return false
    }
  }

  // Registrar el service worker
  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        console.log('Service Worker registrado:', registration)

        // Escuchar actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              newVersionAvailable.value = true
              showUpdatePrompt.value = true
            }
          })
        })

        // Escuchar cambios en el service worker
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('Nuevo service worker activado')
          newVersionAvailable.value = false
          showUpdatePrompt.value = false
        })

        return registration
      } catch (error) {
        console.error('Error al registrar Service Worker:', error)
        return null
      }
    }
    return null
  }

  // Actualizar la app
  const updateApp = () => {
    if (newVersionAvailable.value) {
      navigator.serviceWorker.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  // Verificar estado de conexión
  const checkOnlineStatus = () => {
    isOffline.value = !navigator.onLine
  }

  // Obtener información de la app
  const getAppInfo = () => {
    return {
      name: 'BeatBot2k',
      version: '1.0.0',
      isInstalled: isInstalled.value,
      isInstallable: isInstallable.value,
      isOffline: isOffline.value,
      hasServiceWorker: 'serviceWorker' in navigator,
      displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser'
    }
  }

  // Event listeners
  const handleOnline = () => {
    isOffline.value = false
    console.log('Conexión restaurada')
  }

  const handleOffline = () => {
    isOffline.value = true
    console.log('Conexión perdida')
  }

  // Inicialización
  onMounted(async () => {
    checkInstallability()
    checkOnlineStatus()
    
    await registerServiceWorker()

    // Event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Verificar si hay una nueva versión disponible
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NEW_VERSION_AVAILABLE') {
          newVersionAvailable.value = true
          showUpdatePrompt.value = true
        }
      })
    }
  })

  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })

  return {
    // Estado
    isInstallable,
    isInstalled,
    isOffline,
    showInstallPrompt,
    showUpdatePrompt,
    newVersionAvailable,

    // Métodos
    installApp,
    updateApp,
    getAppInfo,
    checkInstallability
  }
}
