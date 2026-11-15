<script setup>
import { online, updateReady, applyUpdate } from '../composables/usePwa'
</script>

<template>
  <div class="banners">
    <p v-if="!online" class="banner" role="status">
      Sin conexión. Puedes ver la aplicación, pero crear o editar tareas requiere internet.
    </p>
    <p v-if="updateReady" class="banner" role="status">
      Hay una versión nueva.
      <button type="button" class="link" @click="applyUpdate">Actualizar ahora</button>
    </p>
  </div>
</template>
