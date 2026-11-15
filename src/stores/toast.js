import { reactive } from 'vue'

export const toasts = reactive([])
let seq = 0

export function dismiss(id) {
  const i = toasts.findIndex((t) => t.id === id)
  if (i > -1) toasts.splice(i, 1)
}

export function notify(message, type = 'success') {
  const id = ++seq
  toasts.push({ id, message, type })
  setTimeout(() => dismiss(id), type === 'error' ? 8000 : 4000)
}
