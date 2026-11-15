import { ref } from 'vue'

export const online = ref(navigator.onLine)
export const updateReady = ref(false)
let registration

addEventListener('online', () => (online.value = true))
addEventListener('offline', () => (online.value = false))

export async function registerSW() {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return
  const hadController = !!navigator.serviceWorker.controller
  registration = await navigator.serviceWorker.register('/sw.js')

  const track = (w) => w?.addEventListener('statechange', () => {
    if (w.state === 'installed' && navigator.serviceWorker.controller) updateReady.value = true
  })
  if (registration.waiting && hadController) updateReady.value = true
  track(registration.installing)
  registration.addEventListener('updatefound', () => track(registration.installing))

  let reloading = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return // no recargar en la primera instalación
    reloading = true
    location.reload()
  })
}

export const applyUpdate = () => registration?.waiting?.postMessage({ type: 'SKIP_WAITING' })
