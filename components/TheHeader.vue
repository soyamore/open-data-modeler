<script setup lang="ts">
import type { ConnectFrom, CardNotation } from '~/types'

const { t } = useLocale()

defineProps<{
  mode:         string
  editMode:     boolean
  showTypes:    boolean
  snapToGrid:   boolean
  cardNotation: CardNotation
  connectFrom:  ConnectFrom | null
  entityCount:  number
  assocCount:   number
  exporting:    boolean
  canUndo:      boolean
  canRedo:      boolean
}>()

defineEmits<{
  (e: 'mode',           m: string): void
  (e: 'toggle-edit'             ): void
  (e: 'toggle-types'            ): void
  (e: 'toggle-snap'             ): void
  (e: 'notation',  n: CardNotation): void
  (e: 'cancel-connect'          ): void
  (e: 'undo'                    ): void
  (e: 'redo'                    ): void
  (e: 'auto-layout'             ): void
  (e: 'share'                   ): void
  (e: 'export-png'              ): void
  (e: 'export-pdf'              ): void
  (e: 'export-json'             ): void
  (e: 'import-json'             ): void
  (e: 'export-sql'              ): void
}>()

const open    = ref(false)
const dropRef = ref<HTMLElement | null>(null)

onMounted(() => {
  document.addEventListener('mousedown', (e) => {
    if (dropRef.value && !dropRef.value.contains(e.target as Node)) {
      open.value = false
    }
  })
})
</script>

<template>
  <header class="flex items-center gap-1.5 px-4 py-2 bg-white border-b border-slate-200 shadow-sm flex-shrink-0 flex-wrap gap-y-2 select-none">

    <!-- Logo / Home -->
    <NuxtLink to="/" class="flex flex-col leading-tight mr-2 group" :title="t('header.home')">
      <span class="font-mono font-bold text-[13px] text-blue-900 tracking-wide whitespace-nowrap group-hover:text-blue-600 transition-colors">
        {{ t('app.name') }}
      </span>
      <span class="font-mono text-[8px] tracking-[3px] text-slate-400 uppercase">{{ t('app.tagline') }}</span>
    </NuxtLink>

    <!-- Mode toggle -->
    <div class="flex bg-slate-100 rounded-lg p-[3px] gap-[2px] border border-slate-200">
      <button class="mode-tab" :class="mode === 'mcd' ? 'active-mcd' : ''" @click="$emit('mode', 'mcd')">
        {{ t('mode.mcd.label') }}
      </button>
      <button class="mode-tab" :class="mode === 'mld' ? 'active-mld' : ''" @click="$emit('mode', 'mld')">
        {{ t('mode.mld.label') }}
      </button>
    </div>

    <!-- CDM-only controls -->
    <div v-if="mode === 'mcd'" class="flex items-center gap-1.5 flex-wrap">

      <!-- Edit / View -->
      <HdrBtn :active="editMode" active-class="border-blue-500 bg-blue-50 text-blue-700" @click="$emit('toggle-edit')">
        <i :class="editMode ? 'fa-solid fa-pen-to-square' : 'fa-regular fa-eye'" />
        {{ editMode ? t('header.editModeOn') : t('header.editModeOff') }}
      </HdrBtn>

      <!-- Types -->
      <HdrBtn :active="showTypes" active-class="border-violet-400 bg-violet-50 text-violet-700" @click="$emit('toggle-types')">
        <i class="fa-solid fa-tag" />
        {{ showTypes ? t('header.typesOn') : t('header.typesOff') }}
      </HdrBtn>

      <!-- Undo / Redo -->
      <div class="flex gap-0.5">
        <HdrBtn :disabled="!canUndo" @click="$emit('undo')">
          <i class="fa-solid fa-rotate-left text-[11px]" />
        </HdrBtn>
        <HdrBtn :disabled="!canRedo" @click="$emit('redo')">
          <i class="fa-solid fa-rotate-right text-[11px]" />
        </HdrBtn>
      </div>

      <!-- Auto-layout -->
      <HdrBtn :title="t('header.autoLayout')" @click="$emit('auto-layout')">
        <i class="fa-solid fa-wand-magic-sparkles" />
        {{ t('header.autoLayout') }}
      </HdrBtn>

      <!-- Snap -->
      <HdrBtn :active="snapToGrid" active-class="border-emerald-400 bg-emerald-50 text-emerald-700" @click="$emit('toggle-snap')">
        <i class="fa-solid fa-border-all" />
        {{ t('header.snap') }}
      </HdrBtn>

      <!-- Notation -->
      <div class="flex bg-slate-100 rounded-lg p-[3px] gap-[2px] border border-slate-200">
        <button
          class="px-2 py-1 rounded-md font-mono text-[10px] font-bold uppercase transition-all"
          :class="cardNotation === 'merise' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-400'"
          @click="$emit('notation', 'merise')"
        >Merise</button>
        <button
          class="px-2 py-1 rounded-md font-mono text-[10px] font-bold uppercase transition-all"
          :class="cardNotation === 'crowsfoot' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-400'"
          @click="$emit('notation', 'crowsfoot')"
        >Crow's</button>
      </div>
    </div>

    <!-- Connect hint -->
    <div
      v-if="connectFrom && editMode"
      class="flex items-center gap-2 px-3 py-1 bg-amber-50 border-[1.5px] border-amber-300 rounded-lg font-mono text-[11px] text-amber-800"
    >
      <i class="fa-solid fa-bolt text-[10px]" />
      {{ connectFrom.type === 'entity' ? t('header.connectHintEntity') : t('header.connectHintAssoc') }}
      <button class="ml-1 leading-none text-base hover:opacity-60" @click="$emit('cancel-connect')">×</button>
    </div>

    <!-- Right side -->
    <div class="ml-auto flex items-center gap-2">

      <!-- Stats -->
      <span class="px-2 py-1 rounded bg-blue-50 text-blue-600 font-mono text-[11px] font-semibold">
        {{ t('header.entities', { count: entityCount }) }}
      </span>
      <span class="px-2 py-1 rounded bg-cyan-50 text-cyan-700 font-mono text-[11px] font-semibold">
        {{ t('header.assocs', { count: assocCount }) }}
      </span>

      <!-- Share -->
      <HdrBtn :title="t('header.share')" @click="$emit('share')">
        <i class="fa-solid fa-share-nodes text-[11px]" />
        {{ t('header.share') }}
      </HdrBtn>

      <!-- Export dropdown -->
      <div ref="dropRef" class="relative">
        <HdrBtn :active="open" active-class="border-blue-400 bg-blue-50 text-blue-700" @click="open = !open">
          <i :class="exporting ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-file-export'" class="text-[11px]" />
          {{ t('header.export') }}
          <i class="fa-solid fa-chevron-down text-[9px] transition-transform" :class="open ? 'rotate-180' : ''" />
        </HdrBtn>

        <Transition name="dd">
          <div
            v-if="open"
            class="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 overflow-hidden"
          >
            <DropItem icon="fa-solid fa-code" color="text-emerald-600" :label="t('header.exportJson')" :sub="t('header.exportJsonSub')" @click="$emit('export-json'); open = false" />
            <DropItem icon="fa-solid fa-file-import" color="text-emerald-600" :label="t('header.importJson')" :sub="t('header.importJsonSub')" @click="$emit('import-json'); open = false" />
            <div class="border-t border-slate-100 my-1" />
            <DropItem icon="fa-solid fa-image" color="text-blue-600" :label="t('header.exportPng')" :sub="t('header.exportPngSub')" :disabled="exporting" @click="$emit('export-png'); open = false" />
            <DropItem icon="fa-regular fa-file-pdf" color="text-red-500" :label="t('header.exportPdf')" :sub="t('header.exportPdfSub')" :disabled="exporting" @click="$emit('export-pdf'); open = false" />
            <div class="border-t border-slate-100 my-1" />
            <DropItem icon="fa-solid fa-database" color="text-violet-600" :label="t('header.exportSql')" :sub="t('header.exportSqlSub')" @click="$emit('export-sql'); open = false" />
          </div>
        </Transition>
      </div>

      <LangSwitcher />
    </div>
  </header>
</template>

<style scoped>
.dd-enter-active, .dd-leave-active { transition: opacity .15s, transform .15s; }
.dd-enter-from, .dd-leave-to       { opacity: 0; transform: translateY(-4px); }

.mode-tab {
  @apply px-3 py-1 rounded-md font-mono text-xs font-bold tracking-widest uppercase transition-all text-slate-400 hover:text-slate-600;
}
.active-mcd { @apply bg-blue-900 text-white; }
.active-mld { @apply bg-cyan-600 text-white; }
</style>
