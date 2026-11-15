// Estado compartido de listado.
import { reactive } from 'vue'
import { tasksApi } from '../services/tasksApi'
import { isAbort } from '../services/http'
import { notify } from './toast'

const state = reactive({
  items: [],
  status: 'idle', 
  error: null,
  pending: new Set(), 
})

let controller = null
let seq = 0

// Condicionales
async function load(filters = {}) {
  controller?.abort()
  controller = new AbortController()
  const mine = ++seq
  state.status = 'loading'
  state.error = null
  try {
    const items = await tasksApi.list(filters, controller.signal)
    if (mine !== seq) return
    state.items = items
    state.status = 'success'
  } catch (e) {
    if (isAbort(e) || mine !== seq) return
    state.error = e
    state.status = 'error'
  }
}

async function run(id, fn, okMessage) {
  if (state.pending.has(id)) return false
  state.pending.add(id)
  try {
    await fn()
    if (okMessage) notify(okMessage)
    return true
  } catch (e) {
    notify(e.message, 'error')
    return false
  } finally {
    state.pending.delete(id)
  }
}

async function toggle(task) {
  const previous = task.completada
  task.completada = !previous // optimista
  const ok = await run(task.id, () => tasksApi.patch(task.id, { completada: !previous }))
  if (!ok) task.completada = previous // reversión si la API falla
}

async function remove(task) {
  const ok = await run(task.id, () => tasksApi.remove(task.id), 'Tarea eliminada.')
  if (ok) state.items = state.items.filter((t) => t.id !== task.id)
}

export const tasksStore = { state, load, toggle, remove }
