<template>
  <!-- add `data-active` and the event listeners -->
  <div :class="active?'drop-active':'drop-inactive'" :data-active="active" @dragenter.prevent="setActive" @dragover.prevent="setActive" @dragleave.prevent="setInactive" @drop.prevent="onDrop">
    <!-- share state with the scoped slot -->
    <slot :dropZoneActive="active"></slot>
  </div>
</template>

<script  setup lang="ts">
import { defineEmits, ref, onMounted, onUnmounted } from 'vue'

// make sure to import `ref` from Vue
const emit = defineEmits(['files-dropped'])

// Create `active` state and manage it with functions
let active = ref(false)
let inActiveTimeout = null

function setActive() {
  active.value = true
  clearTimeout(inActiveTimeout) // clear the timeout
}
function setInactive() {
  // wrap it in a `setTimeout`
  inActiveTimeout = setTimeout(() => {
    active.value = false
  }, 50)
}

function onDrop(e) {
  setInactive()
  emit('files-dropped', [...e.dataTransfer.files])
}

function preventDefaults(e) {
  e.preventDefault()
}

const events = ['dragenter', 'dragover', 'dragleave', 'drop']

onMounted(() => {
  events.forEach((eventName) => {
    document.body.addEventListener(eventName, preventDefaults)
  })
})

onUnmounted(() => {
  events.forEach((eventName) => {
    document.body.removeEventListener(eventName, preventDefaults)
  })
})
</script>