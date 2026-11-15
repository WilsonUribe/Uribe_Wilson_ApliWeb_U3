<script setup>
import PwaBanner from './components/PwaBanner.vue'
import ToastRegion from './components/ToastRegion.vue'
</script>

<template>
  <a class="skip" href="#main">Saltar al contenido</a>
  <header class="top">
    <div class="wrap bar">
      <RouterLink class="brand" :to="{ name: 'tasks' }">Gestor de tareas</RouterLink>
      <nav aria-label="Principal">
        <RouterLink :to="{ name: 'tasks' }" exact-active-class="current">Lista</RouterLink>
        <RouterLink :to="{ name: 'new' }" active-class="current">Nueva tarea</RouterLink>
      </nav>
    </div>
  </header>
  <PwaBanner />
  <main id="main" class="wrap" tabindex="-1"><RouterView /></main>
  <ToastRegion />
</template>
