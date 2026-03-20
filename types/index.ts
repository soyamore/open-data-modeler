export interface Attribute {
  id: string;
  name: string;
  type: string;
  isPrimary: boolean;
  color?: string;
}
export interface AssocAttribute {
  id: string;
  name: string;
  type: string;
}
export interface AssocLink {
  entityId: string;
  card: string;
}

export interface Entity {
  id: string;
  name: string;
  x: number;
  y: number;
  attrs: Attribute[];
  color?: string;
}
export interface Association {
  id: string;
  name: string;
  x: number;
  y: number;
  attrs: AssocAttribute[];
  links: AssocLink[];
}

export interface MLDColumn {
  id: string;
  name: string;
  type: string;
  isPrimary: boolean;
  fk: boolean;
  fkRef: string | null;
}
export interface MLDRelation {
  fromTable: string;
  fromCol: string;
  toTable: string;
}
export interface MLDTable {
  id: string;
  name: string;
  isJunction: boolean;
  columns: MLDColumn[];
  x: number;
  y: number;
  relations: MLDRelation[];
}
export interface MLDOverride {
  tableId: string;
  colId: string;
  name?: string;
  type?: string;
  isPrimary?: boolean;
  fk?: boolean;
  fkRef?: string | null;
}

export type DiagramMode = 'mcd' | 'mld';
export type SelectionType = 'entity' | 'assoc';
export interface Selection {
  type: SelectionType;
  id: string;
}
export interface DragState {
  type: SelectionType;
  id: string;
  sx: number;
  sy: number;
  ox: number;
  oy: number;
}
export interface ConnectFrom {
  type: SelectionType;
  id: string;
}
export interface ValidationIssue {
  id: string;
  kind: string;
  message: string;
}

export interface MLDState {
  tables: MLDTable[];
  overrides: MLDOverride[];
  synced: boolean; // true if last sync was from CDM, false if manually edited after
}

export interface DiagramSnapshot {
  entities: Entity[];
  associations: Association[];
  mldOverrides: MLDOverride[];
  mldState?: MLDState;
}

export interface SavedProject {
  id: string;
  name: string;
  updatedAt: number;
  snapshot: DiagramSnapshot;
}

export type SqlDialect = 'postgresql' | 'mysql' | 'sqlite';
export type CardNotation = 'merise' | 'crowsfoot';
