<template>
  <div class="p-8">
    <DropZone @files-dropped="filesDropped">
      <div class="drop-zone w-screen h-screen bg-opacity-50 fixed inset-0"></div>
    </DropZone>
    <template v-if="info === undefined">
      <p>To inspect the PDF metadata, and visual metadata in a PDF document, drag and drop it onto this page.</p>
    </template>
    <RenderData v-else :data="info"></RenderData>
  </div>
</template>

<script setup lang="ts">
import DropZone from "@/components/DropZone.vue";
import RenderData from "@/components/RenderData.vue";
import {ref} from "vue";
import {extractFromArrayBuffer} from "@/VisualMeta";

const info = ref(undefined);

function filesDropped(files) {
  const file1 = files[0]
  let fileReader = new FileReader()
  fileReader.onload = async function () {
    info.value =  await extractFromArrayBuffer(this.result);
  }
  fileReader.readAsArrayBuffer(file1);
}
</script>

<style lang="scss">

.drop-active .drop-zone {
  background: green;
  opacity: 0.2;
}
</style>
