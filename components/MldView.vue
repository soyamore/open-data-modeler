<script setup lang="ts">
import type { MLDTable, MLDColumn } from '~/types'
import { ATTR_TYPES } from '~/utils/uid'

const { t } = useLocale()

const props = defineProps<{ tables: MLDTable[] }>()
const emit  = defineEmits<{
  (e: 'back'): void
  (e: 'reset-overrides'): void
  (e: 'sync'): void
  (e: 'update-cell', tableId: string, colId: string, field: string, value: string | boolean | null): void
  (e: 'move-table', tableId: string, x: number, y: number): void
}>()

const editMode = ref(false)
const TABLE_W  = 260
const ROW_H    = 30
const HDR_H    = 40

// ── Selected column for editing ──────────────────────────────
interface SelectedCol { tableId: string; col: MLDColumn }
const selectedCol = ref<SelectedCol | null>(null)

function selectCol(tableId: string, col: MLDColumn) {
  if (!editMode.value) return
  selectedCol.value = selectedCol.value?.col.id === col.id ? null : { tableId, col }
}

// Keep selectedCol in sync with table updates
const selectedColLive = computed<MLDColumn | null>(() => {
  if (!selectedCol.value) return null
  const tbl = tables.value.find(t => t.id === selectedCol.value!.tableId)
  return tbl?.columns.find(c => c.id === selectedCol.value!.col.id) ?? null
})

// Close panel when leaving edit mode
watch(editMode, (v) => { if (!v) selectedCol.value = null })

// Use tables directly from props (positions managed by useDiagram)
const tables = computed(() => props.tables)

const tableNames = computed(() => tables.value.map(t => t.name))

// ── Drag ─────────────────────────────────────────────────────
const dragging = ref<{ id: string; sx: number; sy: number; ox: number; oy: number } | null>(null)

function startTableDrag(e: MouseEvent, id: string, ox: number, oy: number) {
  dragging.value = { id, sx: e.clientX, sy: e.clientY, ox, oy }
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
}
function onDrag(e: MouseEvent) {
  if (!dragging.value) return
  const d = dragging.value
  const nx = d.ox + (e.clientX - d.sx)
  const ny = d.oy + (e.clientY - d.sy)
  emit('move-table', d.id, nx, ny)
}
function stopDrag() {
  dragging.value = null
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
}
onUnmounted(() => {
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
})

// ── SVG Relations ────────────────────────────────────────────
interface RenderRel {
  key: string
  isJunction: boolean
  fromPos: { x: number; y: number }
  toPos:   { x: number; y: number }
}

const allRelations = computed<RenderRel[]>(() => {
  const rels: RenderRel[] = []
  tables.value.forEach(tbl => {
    tbl.relations.forEach(rel => {
      const toTbl = tables.value.find(t => t.name === rel.toTable)
      if (!toTbl) return
      const fromColIdx = tbl.columns.findIndex(c => c.id === rel.fromCol)
      const fromY = tbl.y + HDR_H + (fromColIdx >= 0 ? fromColIdx : 0) * ROW_H + ROW_H / 2
      rels.push({
        key: `${rel.fromTable}-${rel.fromCol}`,
        isJunction: tbl.isJunction,
        fromPos: { x: tbl.x + TABLE_W / 2, y: fromY },
        toPos:   { x: toTbl.x - TABLE_W / 2, y: toTbl.y + HDR_H / 2 },
      })
    })
  })
  return rels
})

function buildPath(from: { x: number; y: number }, to: { x: number; y: number }): string {
  const dx = Math.abs(to.x - from.x) * 0.5
  return `M${from.x},${from.y} C${from.x + dx},${from.y} ${to.x - dx},${to.y} ${to.x},${to.y}`
}

// ── Column editor helpers ────────────────────────────────────
function togglePK(tableId: string, colId: string, current: boolean) {
  emit('update-cell', tableId, colId, 'isPrimary', !current)
  // If becoming PK, clear FK
  if (!current) emit('update-cell', tableId, colId, 'fk', false)
}

function toggleFK(tableId: string, colId: string, current: boolean) {
  emit('update-cell', tableId, colId, 'fk', !current)
  // If becoming FK, clear PK
  if (!current) emit('update-cell', tableId, colId, 'isPrimary', false)
}

function setFkRef(tableId: string, colId: string, val: string) {
  emit('update-cell', tableId, colId, 'fkRef', val || null)
}
</script>

<template>
  <div class="w-full h-full relative overflow-hidden canvas-grid select-none flex">

    <!-- Main canvas area -->
    <div class="flex-1 relative overflow-hidden">

      <!-- Toolbar -->
      <div class="absolute top-4 left-4 right-4 z-20 flex items-center gap-2 flex-wrap pointer-events-none">
        <div class="flex items-center gap-2 pointer-events-auto">

          <!-- Back -->
          <button
            class="flex items-center gap-2 px-3 py-1.5 border-[1.5px] border-slate-200 rounded-lg bg-white text-slate-500 font-mono text-[11px] shadow-sm hover:border-blue-500 hover:text-blue-600 transition-all"
            @click="$emit('back')"
          >
            <i class="fa-solid fa-arrow-left text-[10px]" />
            {{ t('mld.back') }}
          </button>

          <!-- Edit toggle -->
          <button
            class="flex items-center gap-2 px-3 py-1.5 border-[1.5px] rounded-lg font-mono text-[11px] shadow-sm transition-all"
            :class="editMode ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-slate-400 hover:border-amber-400 hover:text-amber-600'"
            @click="editMode = !editMode"
          >
            <i :class="editMode ? 'fa-solid fa-pen' : 'fa-regular fa-eye'" class="text-[10px]" />
            {{ editMode ? t('mld.editMode') : t('mld.viewMode') }}
          </button>

          <!-- Reset overrides -->
          <button
            v-if="editMode"
            class="flex items-center gap-2 px-3 py-1.5 border-[1.5px] border-red-200 rounded-lg bg-white text-red-500 font-mono text-[11px] shadow-sm hover:bg-red-50 transition-all"
            @click="$emit('reset-overrides')"
          >
            <i class="fa-solid fa-rotate-left text-[10px]" />
            {{ t('mld.resetOverrides') }}
          </button>

          <!-- Sync from CDM -->
          <button
            class="flex items-center gap-2 px-3 py-1.5 border-[1.5px] border-blue-400 rounded-lg bg-blue-50 text-blue-700 font-mono text-[11px] font-semibold shadow-sm hover:bg-blue-100 transition-all"
            @click="$emit('sync')"
          >
            <i class="fa-solid fa-arrows-rotate text-[10px]" />
            {{ t('mld.syncFromCDM') }}
          </button>
        </div>

        <!-- Legend -->
        <div class="ml-auto flex items-center gap-3 font-mono text-[10px] text-slate-500 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm pointer-events-auto">
          <span class="flex items-center gap-1">
            <span class="inline-block w-6 h-4 text-center text-[9px] font-bold rounded bg-amber-100 text-amber-700 border border-amber-300 leading-4">PK</span>
            {{ t('mld.pkLegend') }}
          </span>
          <span class="flex items-center gap-1">
            <span class="inline-block w-6 h-4 text-center text-[9px] font-bold rounded bg-orange-50 text-orange-600 border border-orange-300 leading-4">FK</span>
            {{ t('mld.fkLegend') }}
          </span>
          <span class="flex items-center gap-1">
            <i class="fa-solid fa-circle-nodes text-violet-500 text-[10px]" />
            {{ t('mld.junctionLegend') }}
          </span>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="tables.length === 0" class="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none">
        <i class="fa-solid fa-table-list text-7xl text-slate-200" />
        <div class="flex flex-col items-center gap-2 pointer-events-auto text-center">
          <p class="text-slate-500 text-sm font-mono">{{ t('mld.empty') }}</p>
          <p class="text-slate-400 text-xs font-mono mb-2">{{ t('mld.emptySub') }}</p>
          <button
            class="flex items-center gap-2 px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-mono text-xs font-bold shadow-md transition-all"
            @click="$emit('sync')"
          >
            <i class="fa-solid fa-arrows-rotate" />
            {{ t('mld.syncFromCDM') }}
          </button>
        </div>
      </div>

      <!-- SVG relation lines -->
      <svg class="absolute inset-0 w-full h-full pointer-events-none" style="overflow:visible">
        <defs>
          <marker id="mld-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
          </marker>
          <marker id="mld-arrow-fk" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#f97316" />
          </marker>
        </defs>
        <g v-for="rel in allRelations" :key="rel.key">
          <path
            :d="buildPath(rel.fromPos, rel.toPos)"
            fill="none"
            :stroke="rel.isJunction ? '#8b5cf6' : '#f97316'"
            stroke-width="1.5"
            stroke-opacity="0.7"
            stroke-dasharray="5 3"
            :marker-end="rel.isJunction ? 'url(#mld-arrow)' : 'url(#mld-arrow-fk)'"
          />
        </g>
      </svg>

      <!-- Table nodes -->
      <div
        v-for="table in tables"
        :key="table.id"
        class="absolute bg-white rounded-xl overflow-hidden border-2 shadow-md"
        :class="[
          table.isJunction ? 'border-violet-500' : 'border-blue-500',
          editMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-default',
        ]"
        :style="{ left: `${table.x - TABLE_W / 2}px`, top: `${table.y}px`, width: `${TABLE_W}px` }"
        @mousedown.stop="editMode ? startTableDrag($event, table.id, table.x, table.y) : undefined"
      >
        <!-- Table header -->
        <div
          class="flex items-center gap-2 px-3.5 py-2.5 font-mono font-bold text-xs tracking-widest border-b-2"
          :class="table.isJunction
            ? 'bg-violet-50 text-violet-700 border-violet-500'
            : 'bg-blue-50 text-blue-700 border-blue-500'"
        >
          <i :class="table.isJunction ? 'fa-solid fa-circle-nodes' : 'fa-solid fa-table'" class="text-[11px]" />
          {{ table.name }}
          <span v-if="table.isJunction" class="ml-auto text-[9px] opacity-60 font-normal tracking-wider">
            {{ t('mld.junction') }}
          </span>
        </div>

        <!-- Columns -->
        <div
          v-for="(col, i) in table.columns"
          :key="col.id || i"
          class="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[11px] border-t border-slate-100 transition-colors"
          :class="[
            i % 2 !== 0 ? 'bg-slate-50' : 'bg-white',
            editMode ? 'cursor-pointer hover:bg-blue-50' : '',
            selectedCol?.col.id === col.id ? '!bg-blue-50 ring-1 ring-inset ring-blue-300' : '',
          ]"
          @mousedown.stop
          @click="selectCol(table.id, col)"
        >
          <!-- PK / FK badge -->
          <span
            v-if="col.isPrimary"
            class="flex-shrink-0 text-[9px] font-bold px-1 py-[1px] rounded bg-amber-100 text-amber-700 border border-amber-300 leading-none"
          >PK</span>
          <span
            v-else-if="col.fk"
            class="flex-shrink-0 text-[9px] font-bold px-1 py-[1px] rounded bg-orange-50 text-orange-600 border border-orange-300 leading-none"
          >FK</span>
          <span v-else class="flex-shrink-0 w-[26px]" />

          <!-- Name -->
          <span
            class="flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
            :class="col.isPrimary ? 'text-amber-700 font-bold underline' : col.fk ? 'text-orange-600' : 'text-slate-700'"
          >{{ col.name }}</span>

          <!-- Type pill -->
          <span
            class="flex-shrink-0 text-[10px] px-1.5 py-[1px] rounded leading-none"
            :class="col.isPrimary
              ? 'bg-amber-50 text-amber-600 border border-amber-200'
              : col.fk
              ? 'bg-orange-50 text-orange-500 border border-orange-200'
              : 'bg-slate-100 text-slate-500 border border-slate-200'"
          >{{ col.type }}</span>

          <!-- FK ref arrow -->
          <span v-if="col.fk && col.fkRef" class="text-orange-400 text-[9px] flex-shrink-0 flex items-center gap-0.5">
            <i class="fa-solid fa-arrow-right text-[7px]" />
            {{ col.fkRef }}
          </span>

          <!-- Edit indicator -->
          <i v-if="editMode" class="fa-solid fa-chevron-right text-[8px] text-slate-300 flex-shrink-0" />
        </div>
      </div>
    </div>

    <!-- ── Column editor panel ── -->
    <Transition name="panel">
      <aside
        v-if="editMode && selectedCol && selectedColLive"
        class="w-72 bg-white border-l border-slate-200 flex-shrink-0 overflow-y-auto shadow-[-2px_0_12px_rgba(0,0,0,.06)]"
      >
        <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <span class="font-mono font-bold text-[13px] text-slate-800">{{ selectedColLive.name }}</span>
          <button
            class="text-slate-400 hover:text-slate-600 text-lg leading-none"
            @click="selectedCol = null"
          >×</button>
        </div>

        <div class="p-4 space-y-5">

          <!-- Column name -->
          <div>
            <label class="s-label">{{ t('mld.colName') }}</label>
            <input
              class="s-input"
              :value="selectedColLive.name"
              @change="emit('update-cell', selectedCol!.tableId, selectedColLive!.id, 'name', ($event.target as HTMLInputElement).value)"
            />
          </div>

          <!-- Column type -->
          <div>
            <label class="s-label">{{ t('mld.colType') }}</label>
            <select
              class="s-select w-full"
              :value="selectedColLive.type"
              @change="emit('update-cell', selectedCol!.tableId, selectedColLive!.id, 'type', ($event.target as HTMLSelectElement).value)"
            >
              <option v-for="tp in ATTR_TYPES" :key="tp">{{ tp }}</option>
            </select>
          </div>

          <!-- PK / FK toggles -->
          <div>
            <label class="s-label">{{ t('mld.colRole') }}</label>
            <div class="flex gap-2">

              <!-- PK toggle -->
              <button
                class="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border-2 font-mono text-[11px] font-bold transition-all"
                :class="selectedColLive.isPrimary
                  ? 'border-amber-400 bg-amber-50 text-amber-700'
                  : 'border-slate-200 bg-white text-slate-400 hover:border-amber-300 hover:text-amber-600'"
                @click="togglePK(selectedCol!.tableId, selectedColLive!.id, selectedColLive!.isPrimary)"
              >
                <i class="fa-solid fa-key text-[11px]" />
                PK
                <i v-if="selectedColLive.isPrimary" class="fa-solid fa-check text-[10px]" />
              </button>

              <!-- FK toggle -->
              <button
                class="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border-2 font-mono text-[11px] font-bold transition-all"
                :class="selectedColLive.fk
                  ? 'border-orange-400 bg-orange-50 text-orange-700'
                  : 'border-slate-200 bg-white text-slate-400 hover:border-orange-300 hover:text-orange-600'"
                @click="toggleFK(selectedCol!.tableId, selectedColLive!.id, selectedColLive!.fk)"
              >
                <i class="fa-solid fa-link text-[11px]" />
                FK
                <i v-if="selectedColLive.fk" class="fa-solid fa-check text-[10px]" />
              </button>

              <!-- Clear both -->
              <button
                v-if="selectedColLive.isPrimary || selectedColLive.fk"
                class="px-2 py-2 rounded-lg border-2 border-slate-200 bg-white text-slate-400 hover:border-red-300 hover:text-red-400 transition-all"
                :title="t('mld.clearRole')"
                @click="emit('update-cell', selectedCol!.tableId, selectedColLive!.id, 'isPrimary', false); emit('update-cell', selectedCol!.tableId, selectedColLive!.id, 'fk', false)"
              >
                <i class="fa-solid fa-xmark text-[11px]" />
              </button>
            </div>
          </div>

          <!-- FK reference (visible when FK is active) -->
          <div v-if="selectedColLive.fk">
            <label class="s-label">{{ t('mld.fkRef') }}</label>
            <select
              class="s-select w-full"
              :value="selectedColLive.fkRef ?? ''"
              @change="setFkRef(selectedCol!.tableId, selectedColLive!.id, ($event.target as HTMLSelectElement).value)"
            >
              <option value="">— {{ t('mld.fkRefNone') }} —</option>
              <option
                v-for="name in tableNames.filter(n => n !== tables.find(tb => tb.id === selectedCol!.tableId)?.name)"
                :key="name"
                :value="name"
              >{{ name }}</option>
            </select>
            <p v-if="selectedColLive.fkRef" class="text-[10px] text-slate-400 font-mono mt-1.5 flex items-center gap-1">
              <i class="fa-solid fa-arrow-right text-[8px]" />
              {{ t('mld.fkRefPoints') }} <strong class="text-orange-600">{{ selectedColLive.fkRef }}</strong>
            </p>
          </div>

          <!-- Info block -->
          <div class="text-[10px] font-mono text-slate-400 bg-slate-50 rounded-lg p-3 space-y-1">
            <p v-if="selectedColLive.isPrimary" class="text-amber-600">
              <i class="fa-solid fa-key mr-1" />{{ t('mld.pkInfo') }}
            </p>
            <p v-if="selectedColLive.fk" class="text-orange-600">
              <i class="fa-solid fa-link mr-1" />{{ t('mld.fkInfo') }}
            </p>
            <p v-if="!selectedColLive.isPrimary && !selectedColLive.fk" class="text-slate-400">
              <i class="fa-regular fa-circle mr-1" />{{ t('mld.noRole') }}
            </p>
          </div>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<style scoped>
.panel-enter-active, .panel-leave-active { transition: all .2s ease; }
.panel-enter-from, .panel-leave-to       { opacity: 0; transform: translateX(20px); }
</style>
