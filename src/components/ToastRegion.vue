<script setup>
import { toasts, dismiss } from '../stores/toast'
</script>

<template>
  <div class="toasts" aria-live="polite">
    <div v-for="t in toasts" :key="t.id" class="toast" :class="t.type" :role="t.type === 'error' ? 'alert' : 'status'">
      <p>{{ t.message }}</p>
      <button type="button" aria-label="Cerrar aviso" @click="dismiss(t.id)">×</button>
    </div>
  </div>
</template>
