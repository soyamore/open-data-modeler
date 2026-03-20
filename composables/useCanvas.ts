import { ref, computed } from 'vue'
import type { DragState } from '~/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useCanvas(diagram: any) {
  const canvasEl  = ref<HTMLDivElement | null>(null)
  const dragging  = ref<DragState | null>(null)
  const rubberBand = ref<{ sx: number; sy: number; ex: number; ey: number } | null>(null)

  // Pan & Zoom
  const zoom      = ref(1)
  const panX      = ref(0)
  const panY      = ref(0)
  const isPanning = ref(false)
  const lastPan   = ref({ x: 0, y: 0 })

  const cursor = computed(() => {
    const t = diagram.tool.value
    if (isPanning.value) return 'grabbing'
    if (t === 'entity' || t === 'assoc') return 'crosshair'
    if (t === 'delete') return 'not-allowed'
    if (t === 'connect') return 'cell'
    return 'default'
  })

  function clientToCanvas(cx: number, cy: number) {
    const rect = canvasEl.value!.getBoundingClientRect()
    return {
      x: (cx - rect.left - panX.value) / zoom.value,
      y: (cy - rect.top  - panY.value) / zoom.value,
    }
  }

  function onBgClick(e: MouseEvent) {
    if (e.button !== 0 || isPanning.value) return
    const { x, y } = clientToCanvas(e.clientX, e.clientY)
    const t = diagram.tool.value
    if      (t === 'entity') diagram.addEntity(x, y)
    else if (t === 'assoc')  diagram.addAssociation(x, y)
    else                      diagram.clearSelection()
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.min(3, Math.max(0.2, zoom.value * delta))
    const rect  = canvasEl.value!.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top
    panX.value = cx - (cx - panX.value) * (newZoom / zoom.value)
    panY.value = cy - (cy - panY.value) * (newZoom / zoom.value)
    zoom.value = newZoom
  }

  function onMiddleDown(e: MouseEvent) {
    if (e.button !== 1) return
    e.preventDefault()
    isPanning.value = true
    lastPan.value = { x: e.clientX, y: e.clientY }
  }

  function startDrag(e: MouseEvent, type: 'entity' | 'assoc', id: string, ox: number, oy: number) {
    if (diagram.tool.value !== 'select') return
    dragging.value = { type, id, sx: e.clientX, sy: e.clientY, ox, oy }
  }

  function onMouseMove(e: MouseEvent) {
    if (isPanning.value) {
      panX.value += e.clientX - lastPan.value.x
      panY.value += e.clientY - lastPan.value.y
      lastPan.value = { x: e.clientX, y: e.clientY }
      return
    }
    if (dragging.value) {
      const d  = dragging.value
      const dx = (e.clientX - d.sx) / zoom.value
      const dy = (e.clientY - d.sy) / zoom.value
      diagram.moveNode(d.type, d.id, d.ox + dx, d.oy + dy)
      return
    }
    if (rubberBand.value) {
      const { x, y } = clientToCanvas(e.clientX, e.clientY)
      rubberBand.value.ex = x
      rubberBand.value.ey = y
    }
  }

  function onMouseUp(e: MouseEvent) {
    if (isPanning.value) { isPanning.value = false; return }
    if (dragging.value)  { dragging.value = null; return }
    if (rubberBand.value) {
      const rb = rubberBand.value
      const x1 = Math.min(rb.sx, rb.ex), x2 = Math.max(rb.sx, rb.ex)
      const y1 = Math.min(rb.sy, rb.ey), y2 = Math.max(rb.sy, rb.ey)
      if (x2 - x1 > 10 || y2 - y1 > 10) {
        diagram.entities.value.forEach(en => {
          if (en.x >= x1 && en.x <= x2 && en.y >= y1 && en.y <= y2) {
            if (!diagram.multiSelect.value.includes(en.id)) diagram.multiSelect.value.push(en.id)
          }
        })
      }
      rubberBand.value = null
    }
  }

  function onMouseDown(e: MouseEvent) {
    if (e.button === 1) { onMiddleDown(e); return }
    if (e.button === 0 && diagram.tool.value === 'select' && e.target === canvasEl.value) {
      const { x, y } = clientToCanvas(e.clientX, e.clientY)
      rubberBand.value = { sx: x, sy: y, ex: x, ey: y }
    }
  }

  function zoomIn()    { zoom.value = Math.min(3, zoom.value * 1.2) }
  function zoomOut()   { zoom.value = Math.max(0.2, zoom.value / 1.2) }
  function zoomReset() { zoom.value = 1; panX.value = 0; panY.value = 0 }

  return {
    canvasEl, cursor, rubberBand,
    zoom, panX, panY,
    onBgClick, onWheel, onMouseDown, onMouseMove, onMouseUp,
    startDrag, zoomIn, zoomOut, zoomReset,
  }
}
