<script setup lang="ts">
import type { ValidationIssue } from '~/types'
defineProps<{ issues: ValidationIssue[] }>()
</script>

<template>
  <Transition name="slide">
    <div
      v-if="issues.length > 0"
      class="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col gap-1 max-w-sm w-full px-2"
    >
      <div
        v-for="issue in issues"
        :key="issue.id"
        class="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-300 rounded-lg shadow-sm text-[11px] font-mono text-amber-800"
      >
        <i class="fa-solid fa-triangle-exclamation text-amber-500 text-[12px]" />
        {{ issue.message }}
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: all .2s; }
.slide-enter-from, .slide-leave-to       { opacity: 0; transform: translate(-50%, 12px); }
</style>
