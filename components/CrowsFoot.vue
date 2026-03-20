<script setup lang="ts">
const props = defineProps<{ x: number; y: number; angle: number; card: string }>()
const deg    = computed(() => (props.angle * 180) / Math.PI)
const isMin0 = computed(() => props.card.startsWith('0'))
const isMin1 = computed(() => props.card.startsWith('1'))
const isMany = computed(() => props.card.endsWith('n'))
</script>

<template>
  <g :transform="`translate(${x},${y}) rotate(${deg})`">
    <!-- Mandatory line (always) -->
    <line x1="-28" y1="-7" x2="-28" y2="7" stroke="#3b82f6" stroke-width="2"/>
    <!-- Second mandatory line if min=1 -->
    <line v-if="isMin1" x1="-20" y1="-7" x2="-20" y2="7" stroke="#3b82f6" stroke-width="2"/>
    <!-- Circle if min=0 -->
    <circle v-if="isMin0" cx="-20" cy="0" r="5" fill="white" stroke="#3b82f6" stroke-width="2"/>
    <!-- Crow's foot (many) or single line (one) -->
    <g v-if="isMany">
      <line x1="-8" y1="0" x2="-30" y2="-10" stroke="#3b82f6" stroke-width="1.5"/>
      <line x1="-8" y1="0" x2="-30" y2="10"  stroke="#3b82f6" stroke-width="1.5"/>
      <line x1="-8" y1="0" x2="-30" y2="0"   stroke="#3b82f6" stroke-width="1.5"/>
    </g>
    <line v-else x1="-8" y1="-7" x2="-8" y2="7" stroke="#3b82f6" stroke-width="2"/>
  </g>
</template>
