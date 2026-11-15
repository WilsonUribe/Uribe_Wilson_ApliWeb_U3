// API de tareas para persistencia en tareas.json.
import express from 'express'
import { readFile, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'

const PORT = process.env.PORT ?? 3000
const FILE = new URL('./tareas.json', import.meta.url)
const PRIORIDADES = ['baja', 'media', 'alta']

let tareas = []
try { tareas = JSON.parse(await readFile(FILE, 'utf8')) } catch { /* primer arranque: sin archivo */ }
const guardar = () => writeFile(FILE, JSON.stringify(tareas, null, 2))

const fail = (res, status, message, details) =>
  res.status(status).json({ error: { message, ...(details && { details }) } })

function validar(body = {}, { parcial = false } = {}) {
  const errors = {}
  const out = {}
  if (!parcial || 'titulo' in body) {
    const t = String(body.titulo ?? '').trim()
    if (t.length < 3 || t.length > 80) errors.titulo = 'El título debe tener entre 3 y 80 caracteres.'
    else out.titulo = t
  }
  if ('descripcion' in body) out.descripcion = String(body.descripcion ?? '').trim()
  if ('prioridad' in body) {
    if (!PRIORIDADES.includes(body.prioridad)) errors.prioridad = 'La prioridad debe ser baja, media o alta.'
    else out.prioridad = body.prioridad
  }
  if ('completada' in body) {
    if (typeof body.completada !== 'boolean') errors.completada = 'Debe ser verdadero o falso.'
    else out.completada = body.completada
  }
  return { errors, out }
}

const app = express()
app.use(express.json())

app.get('/api/tasks', (req, res) => {
  const { estado, q } = req.query
  let lista = tareas
  if (estado === 'pendiente') lista = lista.filter((t) => !t.completada)
  if (estado === 'completada') lista = lista.filter((t) => t.completada)
  if (q) lista = lista.filter((t) => `${t.titulo} ${t.descripcion}`.toLowerCase().includes(String(q).toLowerCase()))
  res.json(lista) // lista vacía => 200 con []
})

app.get('/api/tasks/:id', (req, res) => {
  const t = tareas.find((x) => x.id === req.params.id)
  return t ? res.json(t) : fail(res, 404, 'La tarea no existe.')
})

app.post('/api/tasks', async (req, res) => {
  const { errors, out } = validar(req.body)
  if (Object.keys(errors).length) return fail(res, 422, 'Revisa los datos de la tarea.', errors)
  const nueva = { id: randomUUID(), descripcion: '', prioridad: 'media', completada: false, creadaEn: new Date().toISOString(), ...out }
  tareas.push(nueva)
  await guardar()
  res.status(201).json(nueva)
})

app.patch('/api/tasks/:id', async (req, res) => {
  const t = tareas.find((x) => x.id === req.params.id)
  if (!t) return fail(res, 404, 'La tarea no existe.')
  const { errors, out } = validar(req.body, { parcial: true })
  if (Object.keys(errors).length) return fail(res, 422, 'Revisa los datos de la tarea.', errors)
  Object.assign(t, out)
  await guardar()
  res.json(t)
})

app.delete('/api/tasks/:id', async (req, res) => {
  const i = tareas.findIndex((x) => x.id === req.params.id)
  if (i === -1) return fail(res, 404, 'La tarea no existe.')
  tareas.splice(i, 1)
  await guardar()
  res.status(204).end()
})

app.use('/api', (req, res) => fail(res, 404, 'Ruta no encontrada.'))
app.use((err, req, res, _next) => {
  if (err.type === 'entity.parse.failed') return fail(res, 400, 'El cuerpo no es un JSON válido.')
  console.error(err)
  fail(res, 500, 'Error interno del servidor.')
})

app.listen(PORT, () => console.log(`API de tareas en http://localhost:${PORT}/api/tasks`))