<script setup lang="ts">
import type { Association, Entity, AssocAttribute } from '~/types'
import { ATTR_TYPES, CARD_OPTIONS, uid } from '~/utils/uid'
const { t } = useLocale()
const props = defineProps<{ assoc: Association; entities: Entity[] }>()
const emit  = defineEmits<{ (e: 'update', v: Association): void; (e: 'delete'): void }>()

function entityName(id: string) { return props.entities.find(e => e.id === id)?.name ?? id }
function updateCard(entityId: string, card: string) {
  emit('update', { ...props.assoc, links: props.assoc.links.map(l => l.entityId === entityId ? { ...l, card } : l) })
}
function removeLink(entityId: string) {
  emit('update', { ...props.assoc, links: props.assoc.links.filter(l => l.entityId !== entityId) })
}
function updateAttr(id: string, key: keyof AssocAttribute, val: unknown) {
  emit('update', { ...props.assoc, attrs: props.assoc.attrs.map(a => a.id === id ? { ...a, [key]: val } : a) })
}
function removeAttr(id: string) {
  emit('update', { ...props.assoc, attrs: props.assoc.attrs.filter(a => a.id !== id) })
}
function addAttr() {
  emit('update', { ...props.assoc, attrs: [...props.assoc.attrs, { id: uid(), name: t('assoc.defaultAttr'), type: 'INT' }] })
}
</script>

<template>
  <div class="text-xs space-y-1">
    <label class="s-label">{{ t('assoc.nameLabel') }}</label>
    <input class="s-input text-cyan-600 mb-3" :value="assoc.name"
      @input="emit('update', { ...assoc, name: ($event.target as HTMLInputElement).value.toUpperCase() })" />

    <label class="s-label">{{ t('assoc.cardLabel') }}</label>
    <p v-if="assoc.links.length === 0" class="text-slate-400 font-mono text-[11px] py-1">{{ t('assoc.cardHint') }}</p>
    <div v-for="link in assoc.links" :key="link.entityId"
      class="flex items-center gap-2 mb-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
      <span class="flex-1 text-cyan-700 font-mono text-[11px] font-semibold">{{ entityName(link.entityId) }}</span>
      <select class="s-select w-[72px] text-blue-600 font-bold" :value="link.card"
        @change="updateCard(link.entityId, ($event.target as HTMLSelectElement).value)">
        <option v-for="c in CARD_OPTIONS" :key="c">{{ c }}</option>
      </select>
      <button class="btn-icon-del" @click="removeLink(link.entityId)">×</button>
    </div>

    <label class="s-label mt-3">{{ t('assoc.attrsLabel') }}</label>
    <div v-for="attr in assoc.attrs" :key="attr.id" class="flex gap-1 mb-1">
      <input class="s-input flex-1" :value="attr.name"
        @input="updateAttr(attr.id, 'name', ($event.target as HTMLInputElement).value)" />
      <select class="s-select w-[88px]" :value="attr.type"
        @change="updateAttr(attr.id, 'type', ($event.target as HTMLSelectElement).value)">
        <option v-for="tp in ATTR_TYPES" :key="tp">{{ tp }}</option>
      </select>
      <button class="btn-icon-del" @click="removeAttr(attr.id)">×</button>
    </div>

    <button class="btn-dash w-full !border-cyan-500 !text-cyan-600 hover:!bg-cyan-50" @click="addAttr"><i class="fa-solid fa-plus mr-1.5 text-[10px]"/>{{ t('assoc.addAttr') }}</button>
    <button class="btn-del w-full mt-1.5" @click="$emit('delete')">{{ t('assoc.deleteAssoc') }}</button>
  </div>
</template>
