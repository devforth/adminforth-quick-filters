<template>
  <div class="flex gap-1">
    <div v-for="filter in meta.options" :key="filter.name" >
      <UniversalSearchInput 
        v-if="filter.hasSearchInput" 
        :meta="{ 
          placeholder: `Search ${filter.name}`, 
          filterField: filter.name 
        }" 
      />

      <div v-else>
        <QickFiltersSelect 
          :filter="filter"
        />
      </div>
    </div>
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