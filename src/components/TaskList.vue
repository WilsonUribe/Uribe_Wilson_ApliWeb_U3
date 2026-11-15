<script setup>
import TaskItem from './TaskItem.vue'
defineProps({ tasks: { type: Array, required: true }, pending: { type: Set, required: true } })
defineEmits(['toggle', 'remove'])
</script>

<template>
  <ul class="tasks" aria-label="Lista de tareas">
    <TaskItem v-for="t in tasks" :key="t.id" :task="t" :busy="pending.has(t.id)"
              @toggle="$emit('toggle', $event)" @remove="$emit('remove', $event)" />
  </ul>
</template>
