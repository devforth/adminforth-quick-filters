<template>
  <Select
    class="w-48"
    classesForInput="af-filter-dropdown-button"
    :options="selectOptions"
    :placeholder="filter.name"
    v-model="selected"
    searchDisabled
    teleportToBody
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Select } from '@/afcl';
import type { Filter } from './types';
import { useAdminforth } from '@/adminforth';
import { useFiltersStore } from '@/stores/filters';
import { AdminForthFilterOperators } from '@/types/Common';

const { list } = useAdminforth();
const filtersStore = useFiltersStore();

const props = defineProps<{
  filter: Filter
}>();

const field = `_qf_${props.filter.name}`;
const selectOptions = props.filter.enum!.map(option => ({
  label: option.label,
  value: option.label
}));

// the filters store is the source of truth: it is restored from the URL and emptied by "clear filters"
const selected = computed({
  get: () => filtersStore.filters.find(f => f.field === field)?.value ?? null,
  // Select emits undefined when the picked option is clicked again, updateFilter then removes the filter
  set: (value) => list.updateFilter({
    field,
    operator: AdminForthFilterOperators.EQ,
    value,
  }),
});

</script>
