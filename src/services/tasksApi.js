import { request, ApiError } from './http'

const RESOURCE = '/tasks' 

const fromApi = (t) => ({
  id: t.id ?? t._id, // soporta MongoDB (_id)
  titulo: t.titulo ?? t.title ?? '',
  descripcion: t.descripcion ?? t.description ?? '',
  prioridad: t.prioridad ?? t.priority ?? 'media',
  completada: t.completada ?? t.completed ?? t.done ?? false,
})

const toApi = (t) => {
  const out = {}
  if ('titulo' in t) out.titulo = t.titulo // cambia a out.title si tu API usa inglés
  if ('descripcion' in t) out.descripcion = t.descripcion
  if ('prioridad' in t) out.prioridad = t.prioridad
  if ('completada' in t) out.completada = t.completada
  return out
}
const unwrap = (r) => (r && !Array.isArray(r) ? r.data ?? r.tasks ?? r : r)
const url = (id) => `${RESOURCE}/${encodeURIComponent(id)}`

export const tasksApi = {
  async list({ estado, q } = {}, signal) {
    const qs = new URLSearchParams()
    if (estado) qs.set('estado', estado)
    if (q) qs.set('q', q)
    const s = qs.toString()
    try {
      const data = unwrap(await request(`${RESOURCE}${s ? `?${s}` : ''}`, { signal })) ?? []
      return (Array.isArray(data) ? data : []).map(fromApi)
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return [] // colección vacía
      throw e
    }
  },

  async get(id, signal) {
    return fromApi(unwrap(await request(url(id), { signal })))
  },

  async create(task) {
    return fromApi(unwrap(await request(RESOURCE, { method: 'POST', body: toApi(task) })))
  },

  async patch(id, changes) {
    return unwrap(await request(url(id), { method: 'PATCH', body: toApi(changes) }))
  },

  remove: (id) => request(url(id), { method: 'DELETE' }),
}