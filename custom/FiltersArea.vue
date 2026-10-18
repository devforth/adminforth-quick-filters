<template>
  <!-- a narrow list header gives the filters a full row and fills it, a wide one keeps them in its single row -->
  <div class="grid w-full grid-cols-[repeat(auto-fit,minmax(min(15rem,100%),1fr))] gap-2 @4xl/header:flex @4xl/header:w-auto @4xl/header:flex-wrap @4xl/header:items-center">
    <template v-for="filter in meta.options" :key="filter.name" >
      <UniversalSearchInput 
        v-if="filter.hasSearchInput" 
        :meta="{ 
          placeholder: `${filter.name}`, 
          filterField: filter.name 
        }" 
      />

      <QickFiltersSelect
        v-else
        :filter="filter"
      />
    </template>
  </div>

</template>

<script lang="ts" setup>
import UniversalSearchInput from './UniversalSearchInput.vue';
import QickFiltersSelect from './QickFiltersSelect.vue';
import type { Filter } from './types';

const props = defineProps<{
    meta: {
      pluginInstanceId: string,
      resourceId: string,
      options: Filter[]
    }, 
    resource: any,
    adminUser: any
}>();


</script>