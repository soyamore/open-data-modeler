<script setup lang="ts">
import type { Entity, Association } from '~/types'

const props = defineProps<{
  entities:     Entity[]
  associations: Association[]
  zoom: number; panX: number; panY: number
  viewW: number; viewH: number
}>()

const canvasW = 1200
const canvasH = 800

const vpX = computed(() => Math.max(0, (-props.panX / props.zoom) / canvasW * 100))
const vpY = computed(() => Math.max(0, (-props.panY / props.zoom) / canvasH * 70))
const vpW = computed(() => (props.viewW / props.zoom) / canvasW * 100)
const vpH = computed(() => (props.viewH / props.zoom) / canvasH * 70)
</script>

<template>
  <div
    class="absolute bottom-4 right-4 w-40 h-28 bg-white/90 backdrop-blur border border-slate-200 rounded-xl shadow-md overflow-hidden z-30"
  >
    <svg viewBox="0 0 100 70" class="w-full h-full">
      <!-- Entities -->
      <rect
        v-for="e in entities"
        :key="e.id"
        :x="(e.x / canvasW) * 100 - 2"
        :y="(e.y / canvasH) * 70 - 1"
        width="8" height="5"
        rx="1"
        :fill="e.color ?? '#1e3a8a'"
        opacity="0.8"
      />
      <!-- Associations -->
      <ellipse
        v-for="a in associations"
        :key="a.id"
        :cx="(a.x / canvasW) * 100"
        :cy="(a.y / canvasH) * 70"
        rx="4" ry="2"
        fill="none" stroke="#0e7490" stroke-width="0.8"
      />
      <!-- Viewport indicator -->
      <rect
        :x="vpX" :y="vpY" :width="vpW" :height="vpH"
        fill="none" stroke="#3b82f6" stroke-width="0.8" stroke-dasharray="2 1" rx="1"
      />
    </svg>
    <div class="absolute bottom-1 right-1.5 text-[9px] font-mono text-slate-400">{{ Math.round(zoom * 100) }}%</div>
  </div>
</template>
