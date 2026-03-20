<script setup lang="ts">
import type { useDiagram } from '~/composables/useDiagram'
const { t } = useLocale()
const props = defineProps<{ diagram: ReturnType<typeof useDiagram> }>()
const selEntity = computed(() => props.diagram.selEntity.value)
const selAssoc  = computed(() => props.diagram.selAssoc.value)
</script>

<template>
  <aside class="w-72 bg-white border-l border-slate-200 overflow-y-auto p-4 flex-shrink-0 text-xs shadow-[-2px_0_12px_rgba(0,0,0,.04)]">
    <div class="flex items-center gap-2 mb-4 pb-3.5 border-b border-slate-100">
      <span
        class="text-[13px] font-bold tracking-wide font-mono"
        :class="selEntity ? 'text-blue-900' : 'text-cyan-600'"
      ><i :class="selEntity ? 'fa-solid fa-table text-[11px]' : 'fa-regular fa-circle text-[11px]'" />
        {{ selEntity ? t('sidebar.entityTitle') : t('sidebar.assocTitle') }}</span>
    </div>
    <SidebarEntityEditor
      v-if="selEntity"
      :entity="selEntity"
      @update="diagram.updateEntity"
      @delete="diagram.deleteEntity(selEntity.id)"
    />
    <SidebarAssocEditor
      v-else-if="selAssoc"
      :assoc="selAssoc"
      :entities="diagram.entities.value"
      @update="diagram.updateAssociation"
      @delete="diagram.deleteAssociation(selAssoc.id)"
    />
  </aside>
</template>
