<template>
  <template v-if="data == null">
    <i>null</i>
  </template>
  <template v-else-if="Array.isArray(data)">
    <template v-for="value in data" :key="value">
      <div class="border border-blue-200 p-1 mb-1" ><RenderData :data="value"></RenderData></div>
    </template>
  </template>
  <template v-else-if="typeof data != 'object'">
    {{ data }}
  </template>
  <template v-else>
    <table>
      <tr v-for="name in Object.getOwnPropertyNames(data)" :key="name">
        <td class="border bg-blue-200 border-blue-500 p-1 mb-1">{{ name }}</td>
        <td class="border border-blue-500 p-1 mb-1" ><RenderData :data="data[name]"></RenderData></td>
      </tr>
    </table>
  </template>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
defineProps(["data"]);
</script>

<style scoped>

</style>