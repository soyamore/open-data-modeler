<script setup lang="ts">
import type { DiagramMode, SqlDialect } from '~/types'
import { generateSQL } from '~/utils/sql'

const { t } = useLocale()
const diagram  = useDiagram()
const jsonIO   = useJsonIO(diagram)
const { exporting, exportPNG, exportPDF } = useExport()
const projectStore  = useProjects()
const currentProjectId = ref<string | null>(null)
const projectName      = ref('Untitled diagram')

const exportRef  = ref<HTMLDivElement | null>(null)
const editorEl   = ref<HTMLElement | null>(null)

const editMode   = ref(true)
const showTypes  = ref(true)
const toast      = ref<{ msg: string; type: 'ok'|'error' } | null>(null)
const sqlOpen    = ref(false)
const sqlDialect = ref<SqlDialect>('postgresql')
const sqlCopied  = ref(false)
const shareOpen  = ref(false)
const shareUrl   = ref('')
const shareCopied = ref(false)

// Load from URL on mount
onMounted(() => {
  // Load project from ?p= param
  if (import.meta.client) {
    const params = new URLSearchParams(window.location.search)
    const pid = params.get('p')
    if (pid) {
      const p = projectStore.getProject(pid)
      if (p) {
        diagram.importJSON(JSON.stringify({ version:2, entities: p.snapshot.entities, associations: p.snapshot.associations, mldOverrides: p.snapshot.mldOverrides }))
        currentProjectId.value = pid
        projectName.value = p.name
      }
    }
  }
  diagram.loadFromURL()
  editorEl.value?.focus()
  // Auto-save every 30s
  setInterval(() => {
    projectStore.saveProject(currentProjectId.value, projectName.value, diagram.snapshot())
  }, 30000)
})

const sqlOutput = computed(() => generateSQL(diagram.mldTables.value, sqlDialect.value))

function showToast(msg: string, type: 'ok'|'error' = 'ok') {
  toast.value = { msg, type }
  setTimeout(() => { toast.value = null }, 3500)
}

function onModeChange(m: string) {
  diagram.mode.value = m as DiagramMode
  diagram.clearSelection()
}

async function handleExportPNG() { if (exportRef.value) await exportPNG(exportRef.value) }
async function handleExportPDF() { if (exportRef.value) await exportPDF(exportRef.value) }
async function handleImportJSON() {
  const r = await jsonIO.openJSON()
  if (!r.ok) showToast(r.error ?? 'Import failed', 'error')
  else showToast(t('toast.imported'))
}

function handleShare() {
  shareUrl.value  = diagram.getURLShare()
  shareOpen.value = true
}
function copyShareUrl() {
  navigator.clipboard.writeText(shareUrl.value)
  shareCopied.value = true
  setTimeout(() => { shareCopied.value = false }, 2000)
}

function copySql() {
  navigator.clipboard.writeText(sqlOutput.value)
  sqlCopied.value = true
  setTimeout(() => { sqlCopied.value = false }, 2000)
}
function downloadSql() {
  const blob = new Blob([sqlOutput.value], { type: 'text/plain' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
  a.download = `schema_${sqlDialect.value}.sql`; a.click()
}

// ── Keyboard shortcuts ─────────────────────────────────────
function onKeyDown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement).tagName
  if (['INPUT','TEXTAREA','SELECT'].includes(tag)) return

  if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) { e.preventDefault(); diagram.undo(); return }
  if ((e.key === 'z' && e.shiftKey && (e.ctrlKey || e.metaKey)) || (e.key === 'y' && e.ctrlKey)) { e.preventDefault(); diagram.redo(); return }
  if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); diagram.deleteSelected(); return }
  if (e.key === 'Escape') { diagram.clearSelection(); return }

  if (!editMode.value) return
  if (e.key === 'e') { diagram.tool.value = 'entity'; return }
  if (e.key === 'a') { diagram.tool.value = 'assoc';  return }
  if (e.key === 'l') { diagram.tool.value = 'connect'; return }
  if (e.key === 'd') { diagram.tool.value = 'delete';  return }
  if (e.key === 's' && !e.ctrlKey) { diagram.tool.value = 'select'; return }
}
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden" @keydown="onKeyDown" tabindex="-1" ref="editorEl">
    <TheHeader
      :mode="diagram.mode.value"
      :edit-mode="editMode"
      :show-types="showTypes"
      :snap-to-grid="diagram.snapToGrid.value"
      :card-notation="diagram.cardNotation.value"
      :connect-from="diagram.connectFrom.value"
      :entity-count="diagram.entities.value.length"
      :assoc-count="diagram.associations.value.length"
      :exporting="exporting"
      :can-undo="diagram.canUndo.value"
      :can-redo="diagram.canRedo.value"
      @mode="onModeChange"
      @toggle-edit="editMode = !editMode"
      @toggle-types="showTypes = !showTypes"
      @toggle-snap="diagram.snapToGrid.value = !diagram.snapToGrid.value"
      @notation="(n) => diagram.cardNotation.value = n"
      @cancel-connect="diagram.cancelConnect"
      @undo="diagram.undo"
      @redo="diagram.redo"
      @auto-layout="diagram.runAutoLayout"
      @share="handleShare"
      @export-png="handleExportPNG"
      @export-pdf="handleExportPDF"
      @export-json="jsonIO.downloadJSON"
      @import-json="handleImportJSON"
      @export-sql="sqlOpen = true"
    />

    <!-- Toasts -->
    <Transition name="toast">
      <div v-if="toast" class="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-xs font-mono"
        :class="toast.type==='error' ? 'bg-red-50 border-red-300 text-red-700' : 'bg-emerald-50 border-emerald-300 text-emerald-700'"
      >
        <i :class="toast.type==='error' ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-check-circle'"/>
        {{ toast.msg }}
        <button class="ml-2 opacity-60 hover:opacity-100 text-base" @click="toast=null">×</button>
      </div>
    </Transition>

    <!-- SQL Export Modal -->
    <Transition name="modal">
      <div v-if="sqlOpen" class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" @click.self="sqlOpen=false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
          <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 class="font-bold text-slate-800 flex items-center gap-2"><i class="fa-solid fa-database text-violet-600"/>SQL DDL Export</h2>
            <div class="flex items-center gap-2">
              <select class="text-xs font-mono border border-slate-200 rounded-lg px-2 py-1 outline-none" v-model="sqlDialect">
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
                <option value="sqlite">SQLite</option>
              </select>
              <button class="text-slate-400 hover:text-slate-700 text-xl leading-none" @click="sqlOpen=false">×</button>
            </div>
          </div>
          <pre class="flex-1 overflow-auto p-5 font-mono text-xs text-slate-700 bg-slate-50 leading-relaxed">{{ sqlOutput }}</pre>
          <div class="px-5 py-3 border-t border-slate-100 flex gap-2">
            <button class="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-mono font-bold transition-all" @click="copySql">
              <i class="fa-solid fa-copy"/> {{ sqlCopied ? t('copied') : t('copy') }}
            </button>
            <button class="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-violet-400 text-slate-600 hover:text-violet-700 rounded-lg text-xs font-mono transition-all" @click="downloadSql">
              <i class="fa-solid fa-download"/> Download .sql
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Share Modal -->
    <Transition name="modal">
      <div v-if="shareOpen" class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" @click.self="shareOpen=false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
          <h2 class="font-bold text-slate-800 flex items-center gap-2 mb-3"><i class="fa-solid fa-share-nodes text-blue-600"/>{{ t('header.share') }}</h2>
          <p class="text-xs text-slate-500 font-mono mb-3">{{ t('share.desc') }}</p>
          <div class="flex gap-2">
            <input class="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-600 bg-slate-50 outline-none" readonly :value="shareUrl"/>
            <button class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-mono" @click="copyShareUrl">
              <i :class="shareCopied ? 'fa-solid fa-check' : 'fa-solid fa-copy'"/>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <div class="flex flex-1 overflow-hidden">
      <div ref="exportRef" class="flex-1 relative overflow-hidden">
        <McdCanvas
          v-if="diagram.mode.value === 'mcd'"
          :diagram="diagram"
          :edit-mode="editMode"
          :show-types="showTypes"
        />
        <MldView
          v-else
          :tables="diagram.mldTables.value"
          @back="diagram.mode.value = 'mcd'"
          @sync="diagram.syncLDMFromCDM"
          @reset-overrides="diagram.resetMldOverrides"
          @update-cell="(tId, cId, field, val) => diagram.updateMldCell(tId, cId, field as any, val)"
          @move-table="diagram.moveMldTable"
        />
      </div>
      <TheSidebar
        v-if="diagram.mode.value === 'mcd' && editMode && (diagram.selEntity.value || diagram.selAssoc.value)"
        :diagram="diagram"
      />
    </div>
  </div>
</template>

<style scoped>
.toast-enter-active,.toast-leave-active{transition:all .2s}
.toast-enter-from,.toast-leave-to{opacity:0;transform:translateY(-8px)}
.modal-enter-active,.modal-leave-active{transition:opacity .2s}
.modal-enter-from,.modal-leave-to{opacity:0}
</style>
