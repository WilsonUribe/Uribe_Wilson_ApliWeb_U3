<script setup>
defineProps({ task: { type: Object, required: true }, busy: Boolean })
const emit = defineEmits(['toggle', 'remove'])
</script>

<template>
  <li class="task" :class="{ done: task.completada, busy }" :data-priority="task.prioridad">
    <input :id="`task-${task.id}`" type="checkbox" :checked="task.completada" :disabled="busy" @change="emit('toggle', task)" />
    <div class="task-body">
      <label :for="`task-${task.id}`">{{ task.titulo }}</label>
      <p v-if="task.descripcion">{{ task.descripcion }}</p>
      <span class="sr-only">Prioridad {{ task.prioridad }}</span>
    </div>
    <div class="task-actions">
      <RouterLink :to="{ name: 'edit', params: { id: task.id } }" :aria-label="`Editar: ${task.titulo}`">Editar</RouterLink>
      <button type="button" class="danger" :disabled="busy" :aria-label="`Eliminar: ${task.titulo}`" @click="emit('remove', task)">Eliminar</button>
    </div>
  </li>
</template>
