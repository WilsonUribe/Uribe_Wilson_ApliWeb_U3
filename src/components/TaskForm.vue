<script setup>
import { reactive, ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  initial: { type: Object, default: () => ({}) },
  saving: Boolean,
  serverErrors: { type: Object, default: () => ({}) },
  submitLabel: { type: String, default: 'Guardar tarea' },
})
const emit = defineEmits(['submit', 'cancel'])

const form = reactive({ titulo: '', descripcion: '', prioridad: 'media' })
watch(() => props.initial, (v) => Object.assign(form, { titulo: '', descripcion: '', prioridad: 'media' }, v), { immediate: true })

const localErrors = ref({})
const errors = computed(() => ({ ...localErrors.value, ...props.serverErrors }))

function validate() {
  const e = {}
  const t = form.titulo.trim()
  if (t.length < 3) e.titulo = 'Escribe un título de al menos 3 caracteres.'
  else if (t.length > 80) e.titulo = 'El título admite hasta 80 caracteres.'
  localErrors.value = e
  return e
}

async function onSubmit() {
  if (Object.keys(validate()).length) {
    await nextTick()
    document.querySelector('[aria-invalid="true"]')?.focus() // foco al primer error
    return
  }
  emit('submit', { titulo: form.titulo.trim(), descripcion: form.descripcion.trim(), prioridad: form.prioridad })
}
</script>

<template>
  <form novalidate @submit.prevent="onSubmit">
    <div class="field">
      <label for="f-titulo">Título</label>
      <input id="f-titulo" v-model="form.titulo" type="text" maxlength="120" required
             :aria-invalid="errors.titulo ? 'true' : undefined" :aria-describedby="errors.titulo ? 'e-titulo' : undefined" />
      <p v-if="errors.titulo" id="e-titulo" class="error">{{ errors.titulo }}</p>
    </div>
    <div class="field">
      <label for="f-desc">Descripción (opcional)</label>
      <textarea id="f-desc" v-model="form.descripcion" rows="4"
                :aria-invalid="errors.descripcion ? 'true' : undefined" :aria-describedby="errors.descripcion ? 'e-desc' : undefined"></textarea>
      <p v-if="errors.descripcion" id="e-desc" class="error">{{ errors.descripcion }}</p>
    </div>
    <div class="field">
      <label for="f-prio">Prioridad</label>
      <select id="f-prio" v-model="form.prioridad">
        <option value="baja">Baja</option>
        <option value="media">Media</option>
        <option value="alta">Alta</option>
      </select>
    </div>
    <div class="row">
      <button type="submit" class="primary" :disabled="saving">{{ saving ? 'Guardando…' : submitLabel }}</button>
      <button type="button" :disabled="saving" @click="emit('cancel')">Cancelar</button>
    </div>
  </form>
</template>
