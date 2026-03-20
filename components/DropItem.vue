<script setup lang="ts">
defineProps<{
  icon:      string
  color:     string
  label:     string
  sub:       string
  disabled?: boolean
}>()

defineEmits<{ (e: 'click'): void }>()
</script>

<template>
  <button
    :class="[
      'flex items-center gap-3 w-full px-4 py-2.5 hover:bg-slate-50 transition-colors font-mono text-left',
      disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
    ]"
    :disabled="disabled"
    @click="!disabled && $emit('click')"
  >
    <i :class="[icon, color, 'w-4 text-sm flex-shrink-0']" />
    <div>
      <div class="font-semibold text-slate-700 text-[12px]">{{ label }}</div>
      <div class="text-slate-400 text-[10px]">{{ sub }}</div>
    </div>
  </button>
</template>
