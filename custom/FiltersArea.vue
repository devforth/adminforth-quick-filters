<template>
  <div v-if="columnsWithFilter && columnsWithFilter.length > 0" class="flex flex-col w-full p-4 mb-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm dark:shadow-lg text-gray-900 dark:text-white">
    <p 
      class="hover:underline cursor-pointer text-blue-700 dark:text-blue-500 text-end"
      @click="isExpanded = !isExpanded"
    >
      {{ isExpanded ? 'Hide filters' : 'Show filters' }}
    </p>
    <div v-if="isExpanded" class="md:grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4 w-full">
      <div class="flex flex-col" v-for="c in columnsWithFilter" :key="c">
        <div class="min-w-48">
          <p class="dark:text-gray-400">{{ c.label }}</p>
          <Select
            v-if="c.foreignResource"
            :multiple="c.filterOptions.multiselect"
            class="w-full"
            :options="columnOptions[c.name] || []"
            :searchDisabled="!c.foreignResource.searchableFields"
            @scroll-near-end="loadMoreOptions(c.name)"
            @search="(searchTerm) => {
              if (c.foreignResource.searchableFields && onSearchInput[c.name]) {
                onSearchInput[c.name](searchTerm);
              }
            }"
            @update:modelValue="onFilterInput[c.name]({ column: c, operator: c.filterOptions.multiselect ? 'in' : 'eq', value: c.filterOptions.multiselect ? ($event.length ? $event : undefined) : $event || undefined })"
            :modelValue="filtersStore.filters.find(f => f.field === c.name && f.operator === (c.filterOptions.multiselect ? 'in' : 'eq'))?.value || (c.filterOptions.multiselect ? [] : '')"
          >
            <template #extra-item v-if="columnLoadingState[c.name]?.loading">
              <div class="text-center text-gray-400 dark:text-gray-300 py-2 flex items-center justify-center gap-2">
                <Spinner class="w-4 h-4" />
                {{ $t('Loading...') }}
              </div>
            </template>
          </Select>
          <Select
            :multiple="c.filterOptions.multiselect"
            class="w-full"
            v-else-if="c.type === 'boolean'"
            :options="[
              { label: $t('Yes'), value: true }, 
              { label: $t('No'), value: false }, 
              // if field is not required, undefined might be there, and user might want to filter by it
              ...(c.required ? [] : [ { label: $t('Unset'), value: undefined } ])
            ]"
            @update:modelValue="onFilterInput[c.name]({ column: c, operator: c.filterOptions.multiselect ? 'in' : 'eq', value: c.filterOptions.multiselect ? ($event.length ? $event : undefined) : $event })"
            :modelValue="filtersStore.filters.find(f => f.field === c.name && f.operator === (c.filterOptions.multiselect ? 'in' : 'eq'))?.value !== undefined
              ? filtersStore.filters.find(f => f.field === c.name && f.operator === (c.filterOptions.multiselect ? 'in' : 'eq'))?.value
              : (c.filterOptions.multiselect ? [] : '')"
          />
          
          <Select
            :multiple="c.filterOptions.multiselect"
            class="w-full"
            v-else-if="c.enum"
            :options="c.enum"
            @update:modelValue="onFilterInput[c.name]({ column: c, operator: c.filterOptions.multiselect ? 'in' : 'eq', value: c.filterOptions.multiselect ? ($event.length ? $event : undefined) : $event || undefined })"
            :modelValue="filtersStore.filters.find(f => f.field === c.name && f.operator === (c.filterOptions.multiselect ? 'in' : 'eq'))?.value || (c.filterOptions.multiselect ? [] : '')"
          />

          <Input
            v-else-if="['string', 'text', 'json', 'richtext', 'unknown'].includes(c.type)"
            type="text"
            full-width
            :placeholder="$t('Search')"
            @update:modelValue="onFilterInput[c.name]({ column: c, operator: c.filterOptions?.substringSearch ? 'ilike' : 'eq', value: $event || undefined })"
            :modelValue="getFilterItem({ column: c, operator: c.filterOptions?.substringSearch ? 'ilike' : 'eq' })"
          />

          <CustomDateRangePicker
            v-else-if="['datetime', 'date', 'time'].includes(c.type)"
            :column="c"
            :valueStart="filtersStore.filters.find(f => f.field === c.name && f.operator === 'gte')?.value || undefined"
            @update:valueStart="onFilterInput[c.name]({ column: c, operator: 'gte', value: $event || undefined })"
            :valueEnd="filtersStore.filters.find(f => f.field === c.name && f.operator === 'lte')?.value || undefined"
            @update:valueEnd="onFilterInput[c.name]({ column: c, operator: 'lte', value: $event || undefined })"
          />

          <CustomRangePicker
            v-else-if="['integer', 'decimal', 'float'].includes(c.type) && c.allowMinMaxQuery"
            :min="getFilterMinValue(c.name)"
            :max="getFilterMaxValue(c.name)"
            :valueStart="getFilterItem({ column: c, operator: 'gte' })"
            @update:valueStart="onFilterInput[c.name]({ column: c, operator: 'gte', value: ($event !== '' && $event !== null) ? $event : undefined })"
            :valueEnd="getFilterItem({ column: c, operator: 'lte' })"
            @update:valueEnd="onFilterInput[c.name]({ column: c, operator: 'lte', value: ($event !== '' && $event !== null) ? $event : undefined })"
          />

          <div v-else-if="['integer', 'decimal', 'float'].includes(c.type)" class="flex gap-2">
            <Input
              type="number"
              full-width
              aria-describedby="helper-text-explanation"
              :placeholder="$t('From')"
              @update:modelValue="onFilterInput[c.name]({ column: c, operator: 'gte', value: ($event !== '' && $event !== null) ? $event : undefined })"
              :modelValue="getFilterItem({ column: c, operator: 'gte' })"
            />
            <Input
              type="number"
              full-width
              aria-describedby="helper-text-explanation"
              :placeholder="$t('To')"
              @update:modelValue="onFilterInput[c.name]({ column: c, operator: 'lte', value: ($event !== '' && $event !== null) ? $event : undefined })"
              :modelValue="getFilterItem({ column: c, operator: 'lte' })"
            />
          </div>
        </div>
      </div>
    </div>
    <div v-if="isExpanded" class="flex w-full justify-end">
      <Button 
        class="mt-4 max-w-24" 
        @click="filtersStore.filters = [...filtersStore.filters.filter(f => filtersStore.shouldFilterBeHidden(f.field))]" 
        :disabled="filtersStore.filters.length === 0"  
      >
        Clear all
      </Button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, computed, ref, reactive } from 'vue';
import { useFiltersStore } from '@/stores/filters';
import { callAdminForthApi, loadMoreForeignOptions, searchForeignOptions, createSearchInputHandlers } from '@/utils';
import { useRouter } from 'vue-router';
import debounce from 'debounce';
import { Select, Input, Button } from '@/afcl';
import CustomRangePicker from "@/components/CustomRangePicker.vue";
import CustomDateRangePicker from '@/components/CustomDateRangePicker.vue';
import { useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const columnLoadingState = reactive({});
const columnOffsets = reactive({});
const columnEmptyResultsCount = reactive({});
const filtersStore = useFiltersStore();
const columnsMinMax = ref({});
const isExpanded = ref(false);

const props = defineProps<{
    meta: any, 
    resource: any,
    adminUser: any
}>();

const columnOptions = ref({});
const columnsWithFilter = computed(
  () => props.resource.columns?.filter(column => column.showIn.filter && props.meta.options.columns.some(c => c.column === column.name)) || []
);

onMounted(async () => {
  console.log('FiltersArea mounted', props.resource);
  columnsMinMax.value = await callAdminForthApi({
    path: '/get_min_max_for_columns',
    method: 'POST',
    body: {
      resourceId: route.params.resourceId
    }
  });
  console.log('Fetched columnsMinMax:', columnsMinMax.value);
});

function getFilterItem({ column, operator }) {
  const filterValue = filtersStore.filters.find(f => f.field === column.name && f.operator === operator)?.value;
  return filterValue !== undefined ? filterValue : '';
}

function getFilterMinValue(columnName) {
  if(columnsMinMax.value && columnsMinMax.value[columnName]) {
    return columnsMinMax.value[columnName]?.min
  }
}

function getFilterMaxValue(columnName) {
  if(columnsMinMax.value && columnsMinMax.value[columnName]) {
    return columnsMinMax.value[columnName]?.max
  }
}
async function loadMoreOptions(columnName, searchTerm = '') {
  return loadMoreForeignOptions({
    columnName,
    searchTerm,
    columns: props.resource.columns,
    resourceId: Array.isArray(router.currentRoute.value.params.resourceId) 
      ? router.currentRoute.value.params.resourceId[0] 
      : router.currentRoute.value.params.resourceId,
    columnOptions,
    columnLoadingState,
    columnOffsets,
    columnEmptyResultsCount
  });
}

async function searchOptions(columnName, searchTerm) {
  return searchForeignOptions({
    columnName,
    searchTerm,
    columns: props.resource.columns,
    resourceId: Array.isArray(router.currentRoute.value.params.resourceId) 
      ? router.currentRoute.value.params.resourceId[0] 
      : router.currentRoute.value.params.resourceId,
    columnOptions,
    columnLoadingState,
    columnOffsets,
    columnEmptyResultsCount
  });
}

const onSearchInput = computed(() => {
  return createSearchInputHandlers(
    props.resource.columns,
    searchOptions,
    (column) => column.filterOptions?.debounceTimeMs || 300
  );
});

const onFilterInput = computed(() => {
  if (!props.resource.columns) return {};

  return props.resource.columns.reduce((acc, c) => {
    return {
      ...acc,
      [c.name]: debounce(({ column, operator, value }) => {
        setFilterItem({ column, operator, value });
      }, c.filterOptions?.debounceTimeMs || 10),
    };
  }, {});
});

function setFilterItem({ column, operator, value }) {

  const index = filtersStore.filters.findIndex(f => f.field === column.name && f.operator === operator);
  if (value === undefined || value === '' || value === null) {
    if (index !== -1) {
      filtersStore.filters.splice(index, 1);
    }
  } else {
    if (index === -1) {
      filtersStore.setFilter({ field: column.name, value, operator });
    } else {
      filtersStore.setFilters([...filtersStore.filters.slice(0, index), { field: column.name, value, operator }, ...filtersStore.filters.slice(index + 1)])
    }
  }
}
</script>