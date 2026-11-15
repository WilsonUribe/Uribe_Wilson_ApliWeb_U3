<script setup>
// Las acciones entran por slot de los estados vacío / carga / error.
defineProps({
  kind: { type: String, required: true, validator: (v) => ['loading', 'empty', 'error'].includes(v) },
  title: { type: String, required: true },
  message: { type: String, default: '' },
})
</script>

<template>
  <section class="panel" :class="kind" :role="kind === 'error' ? 'alert' : 'status'">
    <span v-if="kind === 'loading'" class="spinner" aria-hidden="true"></span>
    <h2>{{ title }}</h2>
    <p v-if="message">{{ message }}</p>
    <slot />
  </section>
</template>
