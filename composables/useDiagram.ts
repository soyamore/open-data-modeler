import { ref, computed, watch, toRaw } from 'vue'
import type {
  Entity, Association, Selection, ConnectFrom, DiagramMode,
  MLDOverride, MLDTable, MLDState, DiagramSnapshot, ValidationIssue, CardNotation,
} from '~/types'
import { uid } from '~/utils/uid'
import { buildMLD } from '~/utils/mld'
import { autoLayout } from '~/utils/layout'

// ── Helpers ──────────────────────────────────────────────────
function deepClone<T>(val: T): T {
  return JSON.parse(JSON.stringify(toRaw(val) as T))
}

const AUTOSAVE_KEY = 'odm_autosave'
const MAX_HISTORY  = 50

function loadAutosave(): DiagramSnapshot | null {
  if (!import.meta.client) return null
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

// ── Seed data — empty by default ─────────────────────────────
const EMPTY_ENTITIES: Entity[]       = []
const EMPTY_ASSOCS:   Association[]  = []
const EMPTY_MLD:      MLDState       = { tables: [], overrides: [], synced: false }

// ── Composable ───────────────────────────────────────────────
export function useDiagram() {
  // History (inlined)
  const histPast   = ref<DiagramSnapshot[]>([])
  const histFuture = ref<DiagramSnapshot[]>([])

  function histPush(s: DiagramSnapshot) {
    histPast.value.push(deepClone(s))
    if (histPast.value.length > MAX_HISTORY) histPast.value.shift()
    histFuture.value = []
  }

  const canUndo = computed(() => histPast.value.length > 0)
  const canRedo = computed(() => histFuture.value.length > 0)

  // ── CDM state ────────────────────────────────────────────────
  const saved        = loadAutosave()
  const entities     = ref<Entity[]>(     deepClone(saved?.entities     ?? EMPTY_ENTITIES))
  const associations = ref<Association[]>(deepClone(saved?.associations ?? EMPTY_ASSOCS))

  // ── LDM state (independent) ─────────────────────────────────
  const mldState = ref<MLDState>(deepClone(saved?.mldState ?? EMPTY_MLD))

  // Convenience accessors
  const mldTables    = computed(() => {
    const overrides = mldState.value.overrides
    if (!overrides.length) return mldState.value.tables
    return mldState.value.tables.map(t => ({
      ...t,
      columns: t.columns.map(col => {
        const ov = overrides.find(o => o.tableId === t.id && o.colId === col.id)
        if (!ov) return col
        return {
          ...col,
          name:      ov.name      !== undefined ? ov.name      : col.name,
          type:      ov.type      !== undefined ? ov.type      : col.type,
          isPrimary: ov.isPrimary !== undefined ? ov.isPrimary : col.isPrimary,
          fk:        ov.fk        !== undefined ? ov.fk        : col.fk,
          fkRef:     ov.fkRef     !== undefined ? ov.fkRef     : col.fkRef,
        }
      }),
    }))
  })

  // ── UI state ──────────────────────────────────────────────────
  const mode         = ref<DiagramMode>('mcd')
  const tool         = ref<string>('select')
  const selected     = ref<Selection | null>(null)
  const multiSelect  = ref<string[]>([])
  const connectFrom  = ref<ConnectFrom | null>(null)
  const cardNotation = ref<CardNotation>('merise')
  const snapToGrid   = ref(false)
  const gridSize     = ref(20)

  // ── Autosave ──────────────────────────────────────────────────
  watch([entities, associations, mldState], () => {
    if (!import.meta.client) return
    try { localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(snapshot())) } catch {}
  }, { deep: true })

  // ── Derived ───────────────────────────────────────────────────
  function snapshot(): DiagramSnapshot {
    return deepClone({
      entities:     entities.value,
      associations: associations.value,
      mldState:     mldState.value,
      mldOverrides: mldState.value.overrides, // backward-compat
    })
  }

  const selEntity = computed(() =>
    selected.value?.type === 'entity' ? (entities.value.find(e => e.id === selected.value!.id) ?? null) : null)
  const selAssoc = computed(() =>
    selected.value?.type === 'assoc' ? (associations.value.find(a => a.id === selected.value!.id) ?? null) : null)

  const validationIssues = computed<ValidationIssue[]>(() => {
    const issues: ValidationIssue[] = []
    entities.value.forEach(e => {
      if (!e.attrs.some(a => a.isPrimary))
        issues.push({ id: e.id, kind: 'no-pk', message: `"${e.name}" has no primary key` })
    })
    associations.value.forEach(a => {
      if (a.links.length < 2)
        issues.push({ id: a.id, kind: 'incomplete-assoc', message: `"${a.name}" has fewer than 2 links` })
    })
    return issues
  })

  // ── History ────────────────────────────────────────────────
  function recordHistory() { histPush(snapshot()) }

  function applySnapshot(s: DiagramSnapshot) {
    entities.value     = deepClone(s.entities)
    associations.value = deepClone(s.associations)
    mldState.value     = deepClone((s as any).mldState ?? EMPTY_MLD)
    selected.value     = null
    connectFrom.value  = null
  }

  function undo() {
    if (!histPast.value.length) return
    histFuture.value.push(deepClone(snapshot()))
    applySnapshot(histPast.value.pop()!)
  }

  function redo() {
    if (!histFuture.value.length) return
    histPast.value.push(deepClone(snapshot()))
    applySnapshot(histFuture.value.pop()!)
  }

  // ── Snap helpers ───────────────────────────────────────────
  function snapX(x: number) { return snapToGrid.value ? Math.round(x / gridSize.value) * gridSize.value : x }
  function snapY(y: number) { return snapToGrid.value ? Math.round(y / gridSize.value) * gridSize.value : y }

  // ── CDM CRUD ───────────────────────────────────────────────
  function addEntity(x: number, y: number) {
    recordHistory()
    const ne: Entity = { id: uid(), name: 'ENTITY', x: snapX(x), y: snapY(y),
      attrs: [{ id: uid(), name: 'id', type: 'AUTOINCREMENT', isPrimary: true }] }
    entities.value.push(ne)
    selected.value = { type: 'entity', id: ne.id }
    tool.value = 'select'
  }

  function addAssociation(x: number, y: number) {
    recordHistory()
    const na: Association = { id: uid(), name: 'ASSOC', x: snapX(x), y: snapY(y), attrs: [], links: [] }
    associations.value.push(na)
    selected.value = { type: 'assoc', id: na.id }
    tool.value = 'select'
  }

  function updateEntity(updated: Entity) {
    const idx = entities.value.findIndex(e => e.id === updated.id)
    if (idx !== -1) { recordHistory(); entities.value[idx] = updated }
  }

  function updateAssociation(updated: Association) {
    const idx = associations.value.findIndex(a => a.id === updated.id)
    if (idx !== -1) { recordHistory(); associations.value[idx] = updated }
  }

  function deleteEntity(id: string) {
    recordHistory()
    entities.value     = entities.value.filter(e => e.id !== id)
    associations.value = associations.value.map(a => ({ ...a, links: a.links.filter(l => l.entityId !== id) }))
    if (selected.value?.id === id) selected.value = null
    multiSelect.value  = multiSelect.value.filter(x => x !== id)
  }

  function deleteAssociation(id: string) {
    recordHistory()
    associations.value = associations.value.filter(a => a.id !== id)
    if (selected.value?.id === id) selected.value = null
    multiSelect.value  = multiSelect.value.filter(x => x !== id)
  }

  function deleteSelected() {
    if (multiSelect.value.length > 0) {
      recordHistory()
      multiSelect.value.forEach(id => {
        entities.value     = entities.value.filter(e => e.id !== id)
        associations.value = associations.value.filter(a => a.id !== id)
          .map(a => ({ ...a, links: a.links.filter(l => l.entityId !== id) }))
      })
      multiSelect.value = []; selected.value = null
    } else if (selected.value) {
      selected.value.type === 'entity' ? deleteEntity(selected.value.id) : deleteAssociation(selected.value.id)
    }
  }

  function moveNode(type: 'entity' | 'assoc', id: string, x: number, y: number) {
    const nx = snapX(x), ny = snapY(y)
    if (type === 'entity') { const e = entities.value.find(e => e.id === id); if (e) { e.x = nx; e.y = ny } }
    else { const a = associations.value.find(a => a.id === id); if (a) { a.x = nx; a.y = ny } }
  }

  function renameNode(type: 'entity' | 'assoc', id: string, name: string) {
    recordHistory()
    if (type === 'entity') { const e = entities.value.find(e => e.id === id); if (e) e.name = name.toUpperCase() }
    else { const a = associations.value.find(a => a.id === id); if (a) a.name = name.toUpperCase() }
  }

  // ── LDM operations ─────────────────────────────────────────
  /**
   * Sync LDM from the current CDM — this is the "generate" button.
   * Clears all existing LDM tables and rebuilds from scratch.
   */
  function syncLDMFromCDM() {
    recordHistory()
    const generated = buildMLD(entities.value, associations.value)
    mldState.value = { tables: generated, overrides: [], synced: true }
  }

  function updateMldCell(tableId: string, colId: string, field: string, value: string | boolean | null) {
    if (field === 'tableId' || field === 'colId') return
    mldState.value.synced = false // mark as manually edited
    const ov = mldState.value.overrides
    const ex = ov.find(o => o.tableId === tableId && o.colId === colId)
    if (ex) (ex as any)[field] = value
    else    ov.push({ tableId, colId, [field]: value } as any)
  }

  function resetMldOverrides() {
    recordHistory()
    mldState.value.overrides = []
  }

  /** Add a table manually to LDM */
  function addMldTable() {
    recordHistory()
    const id = uid()
    mldState.value.tables.push({
      id, name: 'TABLE', isJunction: false,
      x: 300, y: 200,
      columns: [{ id: uid(), name: 'id', type: 'AUTOINCREMENT', isPrimary: true, fk: false, fkRef: null }],
      relations: [],
    })
    mldState.value.synced = false
  }

  /** Delete a table from LDM */
  function deleteMldTable(tableId: string) {
    recordHistory()
    mldState.value.tables = mldState.value.tables.filter(t => t.id !== tableId)
    mldState.value.overrides = mldState.value.overrides.filter(o => o.tableId !== tableId)
    mldState.value.synced = false
  }

  /** Update table position */
  function moveMldTable(tableId: string, x: number, y: number) {
    const tbl = mldState.value.tables.find(t => t.id === tableId)
    if (tbl) { tbl.x = x; tbl.y = y }
  }

  // ── Node interaction ────────────────────────────────────────
  function handleNodeClick(type: 'entity' | 'assoc', id: string, shiftKey = false) {
    if (tool.value === 'delete') {
      type === 'entity' ? deleteEntity(id) : deleteAssociation(id)
      return
    }
    if (tool.value === 'connect') {
      if (!connectFrom.value) { connectFrom.value = { type, id }; return }
      const from = connectFrom.value
      const assocId  = type === 'assoc'  ? id : from.type === 'assoc'  ? from.id : null
      const entityId = type === 'entity' ? id : from.type === 'entity' ? from.id : null
      if (assocId && entityId) {
        const assoc = associations.value.find(a => a.id === assocId)
        if (assoc && !assoc.links.find(l => l.entityId === entityId)) {
          recordHistory()
          assoc.links.push({ entityId, card: '1,n' })
        }
        connectFrom.value = null; tool.value = 'select'
      }
      return
    }
    if (shiftKey) {
      multiSelect.value.includes(id)
        ? (multiSelect.value = multiSelect.value.filter(x => x !== id))
        : multiSelect.value.push(id)
      selected.value = null
    } else {
      multiSelect.value = []
      selected.value = { type, id }
    }
  }

  function clearSelection() { selected.value = null; connectFrom.value = null; multiSelect.value = [] }
  function cancelConnect()  { connectFrom.value = null; tool.value = 'select' }

  // ── Auto-layout (CDM) ───────────────────────────────────────
  function runAutoLayout() {
    recordHistory()
    const positions = autoLayout(entities.value, associations.value)
    positions.forEach(p => { const e = entities.value.find(e => e.id === p.id); if (e) { e.x = p.x; e.y = p.y } })
    associations.value.forEach(a => {
      if (a.links.length < 2) return
      const linked = a.links.map(l => entities.value.find(e => e.id === l.entityId)).filter(Boolean) as Entity[]
      if (linked.length >= 2) {
        a.x = linked.reduce((s, e) => s + e.x, 0) / linked.length
        a.y = linked.reduce((s, e) => s + e.y, 0) / linked.length
      }
    })
  }

  // ── Export / Import ─────────────────────────────────────────
  function exportJSON(): string {
    return JSON.stringify({
      version: 3,
      entities:     entities.value,
      associations: associations.value,
      mldState:     mldState.value,
    }, null, 2)
  }

  function importJSON(raw: string): { ok: boolean; error?: string } {
    try {
      const data = JSON.parse(raw)
      if (!Array.isArray(data.entities) || !Array.isArray(data.associations))
        return { ok: false, error: 'Invalid format: missing entities or associations' }
      recordHistory()
      entities.value     = data.entities
      associations.value = data.associations
      mldState.value     = data.mldState ?? EMPTY_MLD
      selected.value = null; connectFrom.value = null
      return { ok: true }
    } catch (e: unknown) { return { ok: false, error: (e as Error)?.message ?? 'Parse error' } }
  }

  function getURLShare(): string {
    if (!import.meta.client) return ''
    try {
      const data = btoa(encodeURIComponent(JSON.stringify({
        entities: entities.value, associations: associations.value, mldState: mldState.value,
      })))
      return `${window.location.origin}/editor?d=${data}`
    } catch { return '' }
  }

  function loadFromURL() {
    if (!import.meta.client) return
    try {
      const params = new URLSearchParams(window.location.search)
      const d = params.get('d')
      if (!d) return
      const data = JSON.parse(decodeURIComponent(atob(d)))
      if (data.entities)     entities.value     = data.entities
      if (data.associations) associations.value = data.associations
      if (data.mldState)     mldState.value     = data.mldState
    } catch {}
  }

  return {
    mode, tool, entities, associations, selected, multiSelect, connectFrom,
    cardNotation, snapToGrid, gridSize,
    mldState, mldTables, selEntity, selAssoc, validationIssues,
    canUndo, canRedo,
    addEntity, addAssociation, updateEntity, updateAssociation,
    deleteEntity, deleteAssociation, deleteSelected,
    moveNode, renameNode, handleNodeClick,
    clearSelection, cancelConnect,
    syncLDMFromCDM, updateMldCell, resetMldOverrides,
    addMldTable, deleteMldTable, moveMldTable,
    runAutoLayout, undo, redo,
    exportJSON, importJSON, snapshot, getURLShare, loadFromURL,
  }
}
