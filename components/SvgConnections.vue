<script setup lang="ts">
import type { Entity, Association, CardNotation } from '~/types'

const props = defineProps<{
  entities:     Entity[]
  associations: Association[]
  cardNotation: CardNotation
}>()

const entityMap = computed(() => Object.fromEntries(props.entities.map(e => [e.id, e])))

function angle(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.atan2(b.y - a.y, b.x - a.x)
}
function mid(a: number, b: number) { return (a + b) / 2 }
</script>

<template>
  <svg class="absolute inset-0 pointer-events-none overflow-visible" style="width:100%;height:100%">
    <g v-for="assoc in associations" :key="assoc.id">
      <g
        v-for="link in assoc.links"
        :key="`${assoc.id}-${link.entityId}`"
      >
        <g v-if="entityMap[link.entityId]">
          <!-- Connection line -->
          <line
            :x1="assoc.x + Math.cos(angle(assoc, entityMap[link.entityId])) * 58"
            :y1="assoc.y + Math.sin(angle(assoc, entityMap[link.entityId])) * 27"
            :x2="entityMap[link.entityId].x"
            :y2="entityMap[link.entityId].y"
            stroke="#93c5fd"
            stroke-width="2"
            stroke-opacity="0.9"
          />
          <!-- Crow's foot: entity end marker -->
          <g v-if="cardNotation === 'crowsfoot'">
            <CrowsFoot
              :x="entityMap[link.entityId].x"
              :y="entityMap[link.entityId].y"
              :angle="angle(entityMap[link.entityId], assoc)"
              :card="link.card"
            />
          </g>
          <!-- Merise: cardinality badge mid-line -->
          <g v-else>
            <rect
              :x="mid(assoc.x, entityMap[link.entityId].x) - 18"
              :y="mid(assoc.y, entityMap[link.entityId].y) - 11"
              width="36" height="22" rx="5"
              fill="white" stroke="#3b82f6" stroke-width="1.5"
            />
            <text
              :x="mid(assoc.x, entityMap[link.entityId].x)"
              :y="mid(assoc.y, entityMap[link.entityId].y) + 5"
              text-anchor="middle" fill="#2563eb"
              font-size="11"
              font-family="'IBM Plex Mono',monospace"
              font-weight="600"
            >{{ link.card }}</text>
          </g>
        </g>
      </g>
    </g>
  </svg>
</template>
