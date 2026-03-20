<script setup lang="ts">
import type { Entity, ValidationIssue } from '~/types'

const WIDTH = 230

const props = defineProps<{
  entity:         Entity
  isSelected:     boolean
  isMultiSelected: boolean
  showTypes:      boolean
  editMode:       boolean
  validationIssues: ValidationIssue[]
}>()

const emit = defineEmits<{
  (e: 'dragstart', evt: MouseEvent): void
  (e: 'click',     evt: MouseEvent): void
  (e: 'rename',    name: string): void
}>()

const renaming     = ref(false)
const renameInput  = ref<HTMLInputElement | null>(null)

const hasIssue = computed(() => props.validationIssues.some(v => v.id === props.entity.id))
const width    = computed(() => props.showTypes ? WIDTH : 185)

const style = computed(() => {
  const h = 40 + props.entity.attrs.length * 28
  return { left: `${props.entity.x - width.value / 2}px`, top: `${props.entity.y - h / 2}px`, width: `${width.value}px` }
})

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
    class="absolute select-none transition-shadow duration-150"
    :class="[isSelected ? 'z-20' : isMultiSelected ? 'z-15' : 'z-10', editMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-default']"
    :style="style"
    @mousedown.stop="editMode ? $emit('dragstart', $event) : undefined"
    @click.stop="$emit('click', $event)"
    @dblclick.stop="editMode ? startRename() : undefined"
  >
    <div
      class="rounded-lg overflow-hidden border-2 bg-white"
      :class="isSelected
        ? 'border-blue-500 shadow-[0_0_0_3px_#dbeafe,0_10px_20px_rgba(0,0,0,.1)]'
        : isMultiSelected
        ? 'border-blue-300 shadow-[0_0_0_2px_#bfdbfe]'
        : 'border-slate-200 shadow-sm hover:border-slate-300'"
    >
      <!-- Header with custom color -->
      <div
        class="py-1.5 px-3 text-center font-mono font-bold text-xs tracking-[2px] text-white relative"
        :style="{ background: entity.color ?? '#1e3a8a' }"
      >
        <!-- Inline rename input -->
        <input
          v-if="renaming"
          ref="renameInput"
          class="bg-transparent text-white text-center font-mono font-bold text-xs tracking-[2px] w-full outline-none border-b border-white/50"
          :value="entity.name"
          @keydown.enter="commitRename"
          @keydown.escape="renaming = false"
          @blur="commitRename"
          @click.stop
          @mousedown.stop
        />
        <span v-else>{{ entity.name }}</span>

        <!-- Validation warning dot -->
        <span
          v-if="hasIssue"
          class="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400"
          title="Validation issue"
        />
      </div>

      <!-- Attributes -->
      <div
        v-for="(attr, i) in entity.attrs"
        :key="attr.id"
        class="flex items-center gap-1.5 px-2.5 py-[5px] font-mono text-[11px] border-t border-slate-100"
        :class="i % 2 !== 0 ? 'bg-slate-50' : 'bg-white'"
      >
        <span
          v-if="attr.isPrimary"
          class="flex-shrink-0 text-[9px] font-bold px-1 py-[1px] rounded bg-amber-100 text-amber-700 border border-amber-300 leading-none tracking-wide"
        >PK</span>
        <span v-else class="flex-shrink-0 w-[22px]" />

        <span
          class="overflow-hidden text-ellipsis whitespace-nowrap"
          :class="[showTypes ? 'flex-1' : 'flex-1', attr.isPrimary ? 'text-amber-700 font-bold underline underline-offset-2' : 'text-slate-700']"
        >{{ attr.name }}</span>

        <Transition name="type-pill">
          <span
            v-if="showTypes"
            class="flex-shrink-0 text-[10px] px-1.5 py-[1px] rounded font-mono leading-none tracking-wide"
            :class="attr.isPrimary ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-slate-100 text-slate-500 border border-slate-200'"
          >{{ attr.type }}</span>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.type-pill-enter-active, .type-pill-leave-active { transition: opacity .15s, transform .15s; }
.type-pill-enter-from, .type-pill-leave-to       { opacity: 0; transform: translateX(4px); }
</style>
