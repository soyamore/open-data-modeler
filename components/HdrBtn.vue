<script setup lang="ts">
defineProps<{
  active?:      boolean
  activeClass?: string
  disabled?:    boolean
  title?:       string
}>()

defineEmits<{ (e: 'click'): void }>()
</script>

<template>
  <button
    :class="[
      'flex items-center gap-1.5 px-2.5 py-1.5 border-[1.5px] rounded-lg font-mono text-[11px] font-semibold transition-all',
      active
        ? (activeClass ?? 'border-blue-500 bg-blue-50 text-blue-700')
        : 'border-slate-200 bg-white text-slate-400 hover:border-slate-400 hover:text-slate-600',
      disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
    ]"
    :disabled="disabled"
    :title="title"
    @click="!disabled && $emit('click')"
  >
    <slot />
  </button>
</template>
