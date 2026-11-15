import { createRouter, createWebHistory } from 'vue-router'
import { nextTick } from 'vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'tasks', component: () => import('./views/TasksView.vue'), meta: { title: 'Tareas' } },
    { path: '/tareas/nueva', name: 'new', component: () => import('./views/TaskFormView.vue'), meta: { title: 'Nueva tarea' } },
    { path: '/tareas/:id/editar', name: 'edit', component: () => import('./views/TaskFormView.vue'), meta: { title: 'Editar tarea' } },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./views/NotFoundView.vue'), meta: { title: 'Página no encontrada' } },
  ],
})

// Accesibilidad en SPA: título por ruta y foco al encabezado al cambiar de página
// (no al cambiar solo los filtros, para no robar el foco mientras se escribe).
router.afterEach(async (to, from) => {
  document.title = `${to.meta.title} · Gestor de tareas`
  if (from.name && to.path !== from.path) {
    await nextTick()
    document.getElementById('page-title')?.focus()
  }
})
