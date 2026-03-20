import type { Entity, Association, MLDTable, MLDColumn, MLDRelation } from '~/types'
import { uid } from '~/utils/uid'

const TABLE_W = 240
const TABLE_ROW_H = 30
const TABLE_HEADER_H = 38

function tableHeight(cols: number) { return TABLE_HEADER_H + cols * TABLE_ROW_H }

export function buildMLD(entities: Entity[], associations: Association[]): MLDTable[] {
  // Start with a table per entity, inheriting CDM position
  const tables: MLDTable[] = entities.map(e => ({
    id: e.id,
    name: e.name,
    isJunction: false,
    x: e.x,
    y: e.y,
    columns: e.attrs.map(a => ({ ...a, fk: false, fkRef: null })) as MLDColumn[],
    relations: [] as MLDRelation[],
  }))

  associations.forEach(assoc => {
    if (assoc.links.length < 2) return

    const isMany = (l: { card: string }) => l.card.includes('n')
    const nCount = assoc.links.filter(isMany).length

    if (nCount >= 2) {
      // n:n → junction table, positioned between its two parents
      const cols: MLDColumn[] = []
      const parentPositions: { x: number; y: number }[] = []

      assoc.links.forEach(link => {
        const ent = entities.find(e => e.id === link.entityId)
        if (!ent) return
        parentPositions.push({ x: ent.x, y: ent.y })
        const pk = ent.attrs.find(a => a.isPrimary)
        if (pk)
          cols.push({
            id: uid(),
            name: `${pk.name}_${ent.name.toLowerCase()}`,
            type: pk.type,
            isPrimary: true,
            fk: true,
            fkRef: ent.name,
          })
      })
      assoc.attrs.forEach(a =>
        cols.push({ id: a.id, name: a.name, type: a.type, isPrimary: false, fk: false, fkRef: null })
      )

      // Place junction table between parents
      const cx = parentPositions.length
        ? parentPositions.reduce((s, p) => s + p.x, 0) / parentPositions.length
        : 400
      const cy = parentPositions.length
        ? parentPositions.reduce((s, p) => s + p.y, 0) / parentPositions.length + 140
        : 400

      const rels: MLDRelation[] = cols
        .filter(c => c.fk)
        .map(c => ({ fromTable: assoc.id, fromCol: c.id, toTable: c.fkRef! }))

      tables.push({
        id: assoc.id,
        name: assoc.name,
        isJunction: true,
        x: cx,
        y: cy,
        columns: cols,
        relations: rels,
      })
    } else {
      // 1:n → FK migration into the "one" side
      const oneLink  = assoc.links.find(l => !isMany(l)) ?? assoc.links[0]
      const manyLink = assoc.links.find(l =>  isMany(l)) ?? assoc.links[1]
      const oneEnt   = entities.find(e => e.id === oneLink.entityId)
      const manyEnt  = entities.find(e => e.id === manyLink.entityId)
      if (!oneEnt || !manyEnt) return
      const manyPK = manyEnt.attrs.find(a => a.isPrimary)
      if (!manyPK) return
      const tbl = tables.find(t => t.id === oneEnt.id)
      if (!tbl) return

      const newCol: MLDColumn = {
        id: uid(),
        name: `${manyPK.name}_${manyEnt.name.toLowerCase()}`,
        type: manyPK.type,
        isPrimary: false,
        fk: true,
        fkRef: manyEnt.name,
      }
      tbl.columns.push(newCol)
      tbl.relations.push({ fromTable: tbl.id, fromCol: newCol.id, toTable: manyEnt.name })
    }
  })

  return tables
}
