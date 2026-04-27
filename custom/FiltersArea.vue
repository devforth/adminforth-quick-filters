<template>
  <div class="flex flex-wrap gap-1">
    <template v-for="filter in meta.options" :key="filter.name" >
      <UniversalSearchInput 
        v-if="filter.hasSearchInput" 
        :meta="{ 
          placeholder: `${filter.name}`, 
          filterField: filter.name 
        }" 
      />

      <div v-else>
        <QickFiltersSelect 
          :filter="filter"
        />
      </div>
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