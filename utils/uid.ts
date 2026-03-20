let _id = 100
export const uid = (): string => `id_${_id++}`
export const CARD_OPTIONS = ['0,1', '1,1', '0,n', '1,n']
export const ATTR_TYPES   = ['AUTOINCREMENT', 'INT', 'BIGINT', 'VARCHAR', 'TEXT', 'DATE', 'BOOLEAN', 'FLOAT', 'DECIMAL', 'UUID']
export const ENTITY_COLORS = ['#1e3a8a','#0e7490','#065f46','#7c2d12','#4c1d95','#831843','#1e40af','#0f766e']
