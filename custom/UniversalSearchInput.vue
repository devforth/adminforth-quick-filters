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
            <IconX
              v-if="localValue"
              @click="clear"
              class="w-4 h-4 cursor-pointer text-lightInputIconColor hover:text-lightInputText dark:text-darkInputIconColor dark:hover:text-darkInputText transition-colors"
            />
          </template>
        </Input>
      </div>
    <slot name="suffix" />
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import adminforth from '@/adminforth';
import { Input } from '@/afcl';
import { IconX } from '@iconify-prerendered/vue-lucide';
import { AdminForthFilterOperators } from '@/types/Common';
import { useFiltersStore } from '@/stores/filters';

const props = defineProps<{ 
  meta?: {
    placeholder?: string,
    debounceMs?: number,
    filterField: string,
  }; 
}>();
const filtersStore = useFiltersStore();
const field = `_universal_search_${props.meta?.filterField}`;
const appliedTerm = computed(() => filtersStore.filters.find(f => f.field === field)?.value ?? '');
const localValue = ref(appliedTerm.value);
let t: any = null;
let blockFilterUpdate = false;

// follow filter changes made outside of the input: restore from the URL, "clear filters"
watch(appliedTerm, (term) => {
  if (term !== localValue.value.trim()) {
    blockFilterUpdate = true;
    localValue.value = term;
  }
});

function send(term?: string) {
  adminforth?.list?.updateFilter?.({
    field,
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