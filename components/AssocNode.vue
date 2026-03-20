<script setup lang="ts">
import type { Association } from '~/types'

const ARX = 60, ARY = 28

const props = defineProps<{ assoc: Association; isSelected: boolean; editMode: boolean }>()
const emit = defineEmits<{
  (e: 'dragstart', evt: MouseEvent): void
  (e: 'click',     evt: MouseEvent): void
  (e: 'rename',    name: string): void
}>()

const renaming    = ref(false)
const renameInput = ref<HTMLInputElement | null>(null)

const style = computed(() => ({
  left: `${props.assoc.x - ARX}px`, top: `${props.assoc.y - ARY}px`,
  width: `${ARX * 2}px`, height: `${ARY * 2}px`,
}))

function startRename() {
  renaming.value = true
  nextTick(() => { renameInput.value?.select() })
}
function commitRename() {
  if (!renaming.value) return
  const val = renameInput.value?.value.trim()
  if (val) emit('rename', val)
  renaming.value = false
}
</script>

<template>
  <div
    class="absolute select-none"
    :class="[isSelected ? 'z-20' : 'z-10', editMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-default']"
    :style="style"
    @mousedown.stop="editMode ? $emit('dragstart', $event) : undefined"
    @click.stop="$emit('click', $event)"
    @dblclick.stop="editMode ? startRename() : undefined"
  >
    <svg :width="ARX * 2" :height="ARY * 2" overflow="visible">
      <ellipse
        :cx="ARX" :cy="ARY" :rx="ARX - 2" :ry="ARY - 2"
        :fill="isSelected ? '#cffafe' : '#ffffff'"
        :stroke="isSelected ? '#0891b2' : '#0e7490'"
        stroke-width="2"
        style="filter:drop-shadow(0 2px 6px rgba(8,145,178,.15))"
      />
      <!-- Inline rename foreign object -->
      <foreignObject v-if="renaming" :x="4" :y="ARY - 10" :width="ARX*2 - 8" height="22">
        <input
          ref="renameInput"
          class="w-full bg-transparent text-center font-mono font-bold text-[11px] text-cyan-800 outline-none"
          :value="assoc.name"
          @keydown.enter="commitRename"
          @keydown.escape="renaming = false"
          @blur="commitRename"
          @click.stop
          @mousedown.stop
        />
      </foreignObject>
      <text
        v-else
        :x="ARX" :y="ARY + 4" text-anchor="middle"
        :fill="isSelected ? '#0891b2' : '#0e7490'"
        font-size="11" font-family="'IBM Plex Mono',monospace" font-weight="700" letter-spacing="1"
      >{{ assoc.name }}</text>
      <text
        v-if="assoc.attrs.length > 0 && !renaming"
        :x="ARX" :y="ARY + 18" text-anchor="middle"
        fill="#94a3b8" font-size="9" font-family="'IBM Plex Mono',monospace"
      >{{ assoc.attrs.length }} attr.</text>
    </svg>
  </div>
</template>
