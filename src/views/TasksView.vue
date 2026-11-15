<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { tasksStore } from '../stores/tasksStore'
import TaskFilters from '../components/TaskFilters.vue'
import TaskList from '../components/TaskList.vue'
import StatusPanel from '../components/StatusPanel.vue'

const route = useRoute()
const router = useRouter()
const { state, load, toggle, remove } = tasksStore

// Filtros viven por la URL.
const filters = computed(() => ({ estado: route.query.estado ?? '', q: route.query.q ?? '' }))
watch(filters, (f) => load(f), { immediate: true })

const setFilters = (f) => router.replace({ query: Object.fromEntries(Object.entries(f).filter(([, v]) => v)) })
const retry = () => load(filters.value)
const onRemove = (t) => { if (window.confirm(`¿Eliminar "${t.titulo}"? Esta acción no se puede deshacer.`)) remove(t) }

const hasFilters = computed(() => !!(filters.value.estado || filters.value.q))
const errorTitle = computed(() => (state.error?.kind === 'network' ? 'Sin conexión con el servidor' : 'No pudimos cargar las tareas'))
</script>

<template>
  <h1 id="page-title" class="sr-only" tabindex="-1">Tareas</h1>
  <TaskFilters :model-value="filters" @update:model-value="setFilters" />

  <StatusPanel v-if="state.status === 'loading' && !state.items.length" kind="loading" title="Cargando tareas…" />

  <StatusPanel v-else-if="state.status === 'error'" kind="error" :title="errorTitle" :message="state.error?.message">
    <button type="button" class="primary" @click="retry">Reintentar</button>
  </StatusPanel>

  <StatusPanel v-else-if="state.status === 'success' && !state.items.length" kind="empty"
               title="No se han encontrado tareas"
               :message="hasFilters ? 'Ninguna tarea coincide con la búsqueda o el filtro.' : 'No hay tareas aún. Crea una.'">
    <button v-if="hasFilters" type="button" @click="setFilters({})">Quitar filtros</button>
    <RouterLink v-else class="btn primary" :to="{ name: 'new' }">Crear tarea</RouterLink>
  </StatusPanel>

  <TaskList v-else :tasks="state.items" :pending="state.pending" :aria-busy="state.status === 'loading'"
            :class="{ stale: state.status === 'loading' }" @toggle="toggle" @remove="onRemove" />
</template>