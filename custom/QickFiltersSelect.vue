<template>
  <Select
    class="w-full h-2"
    :options="[
      {label: 'Last 7 days', value: '7'}, 
      {label: 'Last 30 days', value: '30'}, 
      {label: 'Last 90 days', value: '90'},
      {label: 'None', value: null}
    ]"
    v-model="selected"
  ></Select>
</template>



<script lang="ts" setup>
import { ref } from 'vue';

const selected = ref(null)

</script>