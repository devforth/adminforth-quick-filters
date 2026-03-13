<template>
  <Select
    class="w-full"
    :options="selectOptions"
    v-model="selected"
    classesForInput="py-[4px] !text-sm bg-white rounded"
    teleportToBody
  ></Select>
</template>



<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { Select } from '@/afcl'
import type { Filter } from './types';
import { useAdminforth } from '@/adminforth';
import { AdminForthFilterOperators } from '@/types/Common';

const { list } = useAdminforth();

const props = defineProps<{
  filter: Filter
}>();

const selected = ref(null);
const selectOptions = ref<{ label: string, value: any }[]>([]);

onMounted(() => {
  selectOptions.value = props.filter.enum.map(option => ({
    label: option.label,
    value: option.label
  }));
});


watch(selected, (newValue) => {
  console.log('Selected value changed:', newValue);
  list?.updateFilter?.({
    field: `_qf_${props.filter.name}`,
    operator: AdminForthFilterOperators.EQ,
    value: newValue,
  });
})

</script>