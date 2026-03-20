<script setup lang="ts">
import type { Entity, Attribute } from '~/types'
import { ATTR_TYPES, ENTITY_COLORS, uid } from '~/utils/uid'
const { t } = useLocale()
const props = defineProps<{ entity: Entity }>()
const emit  = defineEmits<{ (e:'update',v:Entity):void; (e:'delete'):void }>()

function updateAttr(id: string, key: keyof Attribute, val: unknown) {
  emit('update', { ...props.entity, attrs: props.entity.attrs.map(a => a.id===id ? {...a,[key]:val} : a) })
}
function removeAttr(id: string) {
  emit('update', { ...props.entity, attrs: props.entity.attrs.filter(a => a.id!==id) })
}
function addAttr() {
  emit('update', { ...props.entity, attrs: [...props.entity.attrs, { id:uid(), name:t('entity.defaultAttr'), type:'VARCHAR', isPrimary:false }] })
}
</script>

<template>
  <div class="text-xs space-y-1">

    <!-- Entity name -->
    <label class="s-label">{{ t('entity.nameLabel') }}</label>
    <input class="s-input mb-3" :value="entity.name"
      @input="emit('update', { ...entity, name: ($event.target as HTMLInputElement).value.toUpperCase() })" />

    <!-- Color picker -->
    <label class="s-label">{{ t('entity.color') }}</label>
    <div class="flex gap-1.5 mb-3 flex-wrap">
      <button
        v-for="c in ENTITY_COLORS" :key="c"
        class="w-6 h-6 rounded-md border-2 transition-all"
        :style="{ background: c }"
        :class="(entity.color ?? '#1e3a8a') === c ? 'border-slate-700 scale-110' : 'border-transparent hover:scale-105'"
        @click="emit('update', { ...entity, color: c })"
      />
    </div>

    <!-- Attributes -->
    <label class="s-label">{{ t('entity.attrsLabel') }}</label>
    <div v-for="attr in entity.attrs" :key="attr.id" class="bg-slate-50 border border-slate-100 rounded-lg p-2.5 mb-1.5">
      <div class="flex gap-1 mb-1.5">
        <input class="s-input flex-1" :value="attr.name"
          @input="updateAttr(attr.id, 'name', ($event.target as HTMLInputElement).value)" />
        <button class="btn-icon-del" @click="removeAttr(attr.id)">×</button>
      </div>
      <div class="flex gap-2 items-center">
        <select class="s-select" :value="attr.type"
          @change="updateAttr(attr.id, 'type', ($event.target as HTMLSelectElement).value)">
          <option v-for="tp in ATTR_TYPES" :key="tp">{{ tp }}</option>
        </select>
        <label class="flex items-center gap-1.5 text-amber-700 text-[11px] cursor-pointer whitespace-nowrap font-mono">
          <input type="checkbox" :checked="attr.isPrimary"
            @change="updateAttr(attr.id, 'isPrimary', ($event.target as HTMLInputElement).checked)" />
          {{ t('entity.primaryKey') }}
        </label>
      </div>
    </div>

    <button class="btn-dash w-full" @click="addAttr"><i class="fa-solid fa-plus mr-1.5 text-[10px]"/>{{ t('entity.addAttr') }}</button>
    <button class="btn-del w-full mt-1.5" @click="$emit('delete')">
      <i class="fa-solid fa-trash-can mr-1"/>{{ t('entity.deleteEntity') }}
    </button>
  </div>
</template>
