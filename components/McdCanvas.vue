<script setup lang="ts">
import type { useDiagram } from '~/composables/useDiagram'
const { t } = useLocale()

const props = defineProps<{
  diagram:   ReturnType<typeof useDiagram>
  editMode:  boolean
  showTypes: boolean
}>()

const { canvasEl, cursor, rubberBand, zoom, panX, panY, onBgClick, onWheel, onMouseDown, onMouseMove, onMouseUp, startDrag, zoomIn, zoomOut, zoomReset } = useCanvas(props.diagram)

const canvasW = ref(800)
const canvasH = ref(600)
onMounted(() => {
  const ro = new ResizeObserver(([e]) => {
    canvasW.value = e.contentRect.width
    canvasH.value = e.contentRect.height
  })
  if (canvasEl.value) ro.observe(canvasEl.value)
  onUnmounted(() => ro.disconnect())
})

watch(() => props.editMode, (val) => {
  if (!val) { props.diagram.tool.value = 'select'; props.diagram.cancelConnect() }
})

const tools = computed(() => [
  { id: 'select',  icon: 'fa-solid fa-arrow-pointer', label: t('tools.select.label')  },
  { id: 'entity',  icon: 'fa-regular fa-square',      label: t('tools.entity.label')  },
  { id: 'assoc',   icon: 'fa-regular fa-circle',      label: t('tools.assoc.label')   },
  { id: 'connect', icon: 'fa-solid fa-link',          label: t('tools.connect.label') },
  { id: 'delete',  icon: 'fa-solid fa-trash-can',     label: t('tools.delete.label')  },
])
</script>

<template>
  <div
    ref="canvasEl"
    class="w-full h-full relative overflow-hidden canvas-grid"
    :style="{ cursor }"
    @click="onBgClick"
    @wheel.prevent="onWheel"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
  >
    <!-- Zoom/pan transform layer -->
    <div
      class="absolute inset-0 origin-top-left"
      :style="{ transform: `translate(${panX}px,${panY}px) scale(${zoom})` }"
    >
      <SvgConnections
        :entities="diagram.entities.value"
        :associations="diagram.associations.value"
        :card-notation="diagram.cardNotation.value"
      />

      <EntityNode
        v-for="entity in diagram.entities.value"
        :key="entity.id"
        :entity="entity"
        :is-selected="diagram.selected.value?.id === entity.id"
        :is-multi-selected="diagram.multiSelect.value.includes(entity.id)"
        :show-types="showTypes"
        :edit-mode="editMode"
        :validation-issues="diagram.validationIssues.value"
        @dragstart="(e: MouseEvent) => startDrag(e, 'entity', entity.id, entity.x, entity.y)"
        @click="(e: MouseEvent) => { e.stopPropagation(); diagram.handleNodeClick('entity', entity.id, e.shiftKey) }"
        @rename="(name) => diagram.renameNode('entity', entity.id, name)"
      />

      <AssocNode
        v-for="assoc in diagram.associations.value"
        :key="assoc.id"
        :assoc="assoc"
        :is-selected="diagram.selected.value?.id === assoc.id"
        :edit-mode="editMode"
        @dragstart="(e: MouseEvent) => startDrag(e, 'assoc', assoc.id, assoc.x, assoc.y)"
        @click="(e: MouseEvent) => { e.stopPropagation(); diagram.handleNodeClick('assoc', assoc.id, e.shiftKey) }"
        @rename="(name) => diagram.renameNode('assoc', assoc.id, name)"
      />

      <!-- Rubber-band selection rect -->
      <div
        v-if="rubberBand"
        class="absolute border-2 border-blue-400 bg-blue-50/30 pointer-events-none"
        :style="{
          left:   `${Math.min(rubberBand.sx, rubberBand.ex)}px`,
          top:    `${Math.min(rubberBand.sy, rubberBand.ey)}px`,
          width:  `${Math.abs(rubberBand.ex - rubberBand.sx)}px`,
          height: `${Math.abs(rubberBand.ey - rubberBand.sy)}px`,
        }"
      />

      <!-- Grid dots (snap indicator) -->
      <svg
        v-if="diagram.snapToGrid.value"
        class="absolute inset-0 w-full h-full pointer-events-none opacity-20"
        style="width:3000px;height:2000px"
      >
        <defs>
          <pattern id="grid-dots" :width="diagram.gridSize.value" :height="diagram.gridSize.value" patternUnits="userSpaceOnUse">
            <circle :cx="diagram.gridSize.value/2" :cy="diagram.gridSize.value/2" r="1" fill="#64748b"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-dots)" />
      </svg>
    </div>

    <!-- Floating tool palette -->
    <div class="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-30">
        <div v-for="tool in tools" :key="tool.id" class="relative group">
          <button
            class="w-11 h-11 flex items-center justify-center rounded-xl border-2 shadow-md transition-all duration-150"
            :class="diagram.tool.value === tool.id
              ? 'bg-blue-600 border-blue-600 text-white shadow-blue-200'
              : 'bg-white border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-600'"
            @click.stop="diagram.tool.value = tool.id"
          >
            <i :class="[tool.icon, 'text-[15px]']" />
          </button>
          <div class="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-40">
            <div class="bg-slate-800 text-white text-[11px] font-mono px-2.5 py-1.5 rounded-lg shadow-lg relative">
              {{ tool.label }}
              <div class="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
            </div>
          </div>
        </div>
    </div>

    <!-- Zoom controls -->
    <div class="absolute bottom-4 left-4 flex items-center gap-1 z-30">
      <button class="zoom-btn" @click="zoomOut"><i class="fa-solid fa-minus text-[11px]"/></button>
      <button class="zoom-btn px-2 font-mono text-[11px] min-w-[44px]" @click="zoomReset">{{ Math.round(zoom * 100) }}%</button>
      <button class="zoom-btn" @click="zoomIn"><i class="fa-solid fa-plus text-[11px]"/></button>
    </div>

    <!-- Minimap -->
    <MiniMap
      :entities="diagram.entities.value"
      :associations="diagram.associations.value"
      :zoom="zoom" :pan-x="panX" :pan-y="panY"
      :view-w="canvasW" :view-h="canvasH"
    />

    <!-- Validation panel -->
    <ValidationPanel :issues="diagram.validationIssues.value" />

    <!-- Empty state -->
    <div
      v-if="diagram.entities.value.length === 0"
      class="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none"
    >
      <i class="fa-regular fa-object-group text-7xl text-slate-200" />
      <div v-if="!editMode" class="pointer-events-auto">
        <p class="text-slate-400 text-xs tracking-widest font-mono text-center">{{ t('canvas.emptyHintView') }}</p>
      </div>
      <div v-else class="flex flex-col items-center gap-2 pointer-events-auto">
        <p class="text-slate-400 text-xs tracking-widest font-mono mb-1">{{ t('canvas.emptyHint') }}</p>
        <button
          class="flex items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-700 text-white rounded-xl font-mono text-xs font-bold shadow-md transition-all"
          @click.stop="diagram.tool.value = 'entity'"
        >
          <i class="fa-regular fa-square text-sm" /> {{ t('canvas.addFirstEntity') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.palette-enter-active { transition: opacity .2s, transform .2s; }
.palette-leave-active { transition: opacity .15s, transform .15s; }
.palette-enter-from, .palette-leave-to { opacity: 0; transform: translateY(-50%) translateX(-12px); }

.zoom-btn {
  @apply w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 shadow-sm hover:border-blue-400 hover:text-blue-600 transition-all;
}
</style>
