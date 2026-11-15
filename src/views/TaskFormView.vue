<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { tasksApi } from '../services/tasksApi'
import { isAbort } from '../services/http'
import { notify } from '../stores/toast'
import TaskForm from '../components/TaskForm.vue'
import StatusPanel from '../components/StatusPanel.vue'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id)
const editing = computed(() => !!id.value)

const task = ref(null)
const status = ref('ready') // loading | ready | error
const loadError = ref(null)
const attempt = ref(0)
const saving = ref(false)
const serverErrors = ref({})
const formError = ref('')

// Cargar la tarea al editar. Si cambia el id (o se sale de la vista) se cancela la petición.
watch([id, attempt], ([current], _old, onCleanup) => {
  task.value = null
  loadError.value = null
  if (!current) { status.value = 'ready'; return }
  const ctl = new AbortController()
  onCleanup(() => ctl.abort())
  status.value = 'loading'
  tasksApi.get(current, ctl.signal)
    .then((t) => { task.value = t; status.value = 'ready' })
    .catch((e) => { if (isAbort(e)) return; loadError.value = e; status.value = 'error' })
}, { immediate: true })

async function save(data) {
  if (saving.value) return // evita doble envío
  saving.value = true
  serverErrors.value = {}
  formError.value = ''
  try {
    if (editing.value) await tasksApi.patch(id.value, data)
    else await tasksApi.create(data)
    notify(editing.value ? 'Tarea actualizada.' : 'Tarea creada.')
    router.push({ name: 'tasks' })
  } catch (e) {
    const d = e.details
    serverErrors.value = d && typeof d === 'object' && !Array.isArray(d) ? d : {}
    formError.value = e.message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <h1 id="page-title" tabindex="-1">{{ editing ? 'Editar tarea' : 'Nueva tarea' }}</h1>

  <StatusPanel v-if="status === 'loading'" kind="loading" title="Cargando tarea…" />
  <StatusPanel v-else-if="status === 'error'" kind="error"
               :title="loadError?.status === 404 ? 'La tarea no existe' : 'No pudimos cargar la tarea'" :message="loadError?.message">
    <button v-if="loadError?.status !== 404" type="button" class="primary" @click="attempt++">Reintentar</button>
    <RouterLink class="btn" :to="{ name: 'tasks' }">Volver a la lista</RouterLink>
  </StatusPanel>
  <template v-else>
    <p v-if="formError" class="banner error-banner" role="alert">{{ formError }}</p>
    <TaskForm :initial="task ?? {}" :saving="saving" :server-errors="serverErrors"
              :submit-label="editing ? 'Guardar cambios' : 'Crear tarea'"
              @submit="save" @cancel="router.push({ name: 'tasks' })" />
  </template>
</template>
