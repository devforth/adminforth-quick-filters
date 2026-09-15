<template>
  <div class="af-universal-search flex items-center gap-1">
    <slot name="prefix" />
      <!-- enter is handled on the wrapper so it fires once: Input spreads attrs on both its root and the input -->
      <div class="w-64" @keyup.enter="applyImmediate">
        <Input
          v-model="localValue"
          type="text"
          fullWidth
          :placeholder="props.meta?.placeholder ?? ''"
        >
          <template #rightIcon>
            <p
              v-if="localValue"
              @click="clear"
              class="hover:cursor-pointer hover:text-gray-600 dark:text-white dark:hover:text-gray-400"
            >
              ✕
            </p>
          </template>
        </Input>
      </div>
    <slot name="suffix" />
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import adminforth from '@/adminforth';
import { Input } from '@/afcl';
import { AdminForthFilterOperators } from '@/types/Common';
import { useRoute } from 'vue-router';

const route = useRoute();

const props = defineProps<{ 
  meta?: {
    placeholder?: string,
    debounceMs?: number,
    filterField: string,
  }; 
}>();
const localValue = ref('');
let t: any = null;
let blockFilterUpdate = false;

onMounted(() => {
  const filters = Object.keys(route.query).filter(k => k.startsWith('filter__')).map(k => {
    const [_, field, operator] = k.split('__');
    return {
      field,
      operator,
      value: JSON.parse(decodeURIComponent(route.query[k] as string))
    }
  });
  const isUniversalSearchFilterApplied = filters.find(f => f.field === `_universal_search_${props.meta?.filterField}`);
  if (isUniversalSearchFilterApplied) {
    localValue.value = isUniversalSearchFilterApplied.value;
    blockFilterUpdate = true;
  };
});

function send(term?: string) {
  adminforth?.list?.updateFilter?.({
    field: `_universal_search_${props.meta?.filterField}`,
    operator: AdminForthFilterOperators.EQ,
    value: term || '',
  });
}

function apply() {
  const term = localValue.value.trim();
  send(term || '');
}

function applyImmediate() {
  if (t) clearTimeout(t);
  t = null;
  apply();
}

watch(localValue, () => {
  if (blockFilterUpdate) {
    blockFilterUpdate = false;
    return;
  }
  const delay = props.meta?.debounceMs ?? 500;
  if (t) clearTimeout(t);
  t = setTimeout(apply, delay);
});

function clear() {
  blockFilterUpdate = true;
  localValue.value = '';
  applyImmediate();
}
</script>