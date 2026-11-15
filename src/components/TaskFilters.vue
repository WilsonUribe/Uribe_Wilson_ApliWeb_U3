<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({ modelValue: { type: Object, required: true } })
const emit = defineEmits(['update:modelValue'])

const estados = [['', 'Todas'], ['pendiente', 'Pendientes'], ['completada', 'Completadas']]
const q = ref(props.modelValue.q ?? '')
let timer
watch(q, (v) => {
  clearTimeout(timer) // debounce: una petición por pausa al escribir
  timer = setTimeout(() => emit('update:modelValue', { ...props.modelValue, q: v.trim() }), 300)
})
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <form class="filters" role="search" @submit.prevent>
    <label class="field">
      <span>Buscar tareas</span>
      <input v-model="q" type="search" autocomplete="off" />
    </label>
    <fieldset class="seg">
      <legend>Estado</legend>
      <label v-for="[value, label] in estados" :key="value">
        <input type="radio" name="estado" :value="value" :checked="(modelValue.estado ?? '') === value"
               @change="emit('update:modelValue', { ...modelValue, estado: value })" />
        <span>{{ label }}</span>
      </label>
    </fieldset>
  </form>
</template>
