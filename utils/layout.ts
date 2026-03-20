import type { Entity, Association } from '~/types'

export function autoLayout(entities: Entity[], associations: Association[]): { id: string; x: number; y: number }[] {
  const W = 260, H = 160, COLS = Math.max(1, Math.ceil(Math.sqrt(entities.length)))
  const GAP_X = 340, GAP_Y = 240
  const startX = 200, startY = 180

  return entities.map((e, i) => ({
    id: e.id,
    x: startX + (i % COLS) * GAP_X,
    y: startY + Math.floor(i / COLS) * GAP_Y,
  }))
}
