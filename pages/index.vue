<script setup lang="ts">
const { t } = useLocale()
const projectStore = useProjects()
const { projects } = projectStore

const renameId      = ref<string | null>(null)
const renameInputEl = ref<HTMLInputElement | null>(null)

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function startRename(id: string) {
  renameId.value = id
  nextTick(() => renameInputEl.value?.select())
}

function commitRename(id: string, e: KeyboardEvent) {
  const val = (e.target as HTMLInputElement).value.trim()
  if (val) projectStore.renameProject(id, val)
  renameId.value = null
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans">

    <!-- Nav -->
    <nav class="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200">
      <div class="flex flex-col leading-tight select-none">
        <span class="font-mono font-bold text-blue-900 tracking-wide text-sm">{{ t('app.name') }}</span>
        <span class="font-mono text-[9px] tracking-[3px] text-slate-400 uppercase">{{ t('app.tagline') }}</span>
      </div>
      <div class="flex items-center gap-3">
        <span class="hidden sm:inline text-[11px] font-mono text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
          {{ t('home.badge') }}
        </span>
        <LangSwitcher />
      </div>
    </nav>

    <!-- Hero -->
    <section class="flex flex-col items-center px-6 py-16 text-center">
      <div class="w-16 h-16 rounded-2xl bg-blue-900 flex items-center justify-center mb-6 shadow-lg shadow-blue-900/20">
        <i class="fa-solid fa-diagram-project text-white text-2xl" />
      </div>
      <h1 class="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4 max-w-xl leading-tight">
        {{ t('home.headline') }}
      </h1>
      <p class="text-slate-500 text-base sm:text-lg max-w-lg mb-10 leading-relaxed">{{ t('home.sub') }}</p>

      <!-- Primary CTA -->
      <NuxtLink
        to="/editor"
        class="group flex items-center gap-4 px-6 py-5 bg-blue-900 hover:bg-blue-800 rounded-2xl text-white shadow-lg shadow-blue-900/30 transition-all hover:scale-[1.02] w-full max-w-sm mb-3"
      >
        <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
          <i class="fa-solid fa-plus text-lg" />
        </div>
        <div class="text-left">
          <div class="font-bold text-base tracking-wide">{{ t('home.newMcd') }}</div>
          <div class="text-blue-200 text-xs mt-0.5">{{ t('home.newMcdSub') }}</div>
        </div>
        <i class="fa-solid fa-arrow-right ml-auto text-blue-300 group-hover:translate-x-1 transition-transform" />
      </NuxtLink>

      <!-- Secondary links -->
      <div class="grid sm:grid-cols-2 gap-3 w-full max-w-sm">
        <NuxtLink to="/docs" class="secondary-card">
          <div class="icon-box"><i class="fa-solid fa-book text-slate-500" /></div>
          <div class="text-left">
            <div class="font-semibold text-sm text-slate-800">{{ t('home.docsTitle') }}</div>
            <div class="text-slate-400 text-[11px] mt-0.5">{{ t('home.docsSub') }}</div>
          </div>
        </NuxtLink>
        <NuxtLink to="/about" class="secondary-card">
          <div class="icon-box"><i class="fa-solid fa-drafting-compass text-slate-500" /></div>
          <div class="text-left">
            <div class="font-semibold text-sm text-slate-800">{{ t('home.aboutTitle') }}</div>
            <div class="text-slate-400 text-[11px] mt-0.5">{{ t('home.aboutSub') }}</div>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- Recent projects -->
    <section v-if="projects.length > 0" class="max-w-lg mx-auto w-full px-6 pb-12">
      <h2 class="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2">
        <i class="fa-solid fa-clock-rotate-left text-slate-400" />
        {{ t('home.recent') }}
      </h2>
      <div class="space-y-2">
        <div
          v-for="p in projects.slice(0, 6)"
          :key="p.id"
          class="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all group"
        >
          <i class="fa-solid fa-diagram-project text-blue-300 text-lg flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <input
              v-if="renameId === p.id"
              ref="renameInputEl"
              class="w-full text-sm font-semibold text-slate-800 bg-transparent border-b border-blue-400 outline-none"
              :value="p.name"
              @keydown.enter="commitRename(p.id, $event)"
              @keydown.escape="renameId = null"
              @blur="renameId = null"
            />
            <div v-else class="text-sm font-semibold text-slate-800 truncate">{{ p.name }}</div>
            <div class="text-[10px] text-slate-400 font-mono">{{ formatDate(p.updatedAt) }}</div>
          </div>
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <NuxtLink
              :to="`/editor?p=${p.id}`"
              class="px-2 py-1 text-[11px] font-mono bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >{{ t('home.open') }}</NuxtLink>
            <button
              class="px-2 py-1 text-[11px] font-mono bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors"
              @click="startRename(p.id)"
            >
              <i class="fa-solid fa-pen text-[10px]" />
            </button>
            <button
              class="px-2 py-1 text-[11px] font-mono bg-red-50 text-red-400 rounded-lg hover:bg-red-100 transition-colors"
              @click="projectStore.deleteProject(p.id)"
            >
              <i class="fa-solid fa-trash text-[10px]" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="mt-auto flex items-center justify-center gap-2 py-5 text-slate-400 font-mono text-[11px] border-t border-slate-200 bg-white">
      <i class="fa-solid fa-diagram-project text-blue-900" />
      <span>{{ t('app.name') }}</span>
      <span class="text-slate-300">·</span>
      <span>{{ t('home.version') }}</span>
      <span class="text-slate-300">·</span>
      <span>{{ t('home.badge') }}</span>
    </footer>
  </div>
</template>

<style scoped>
.secondary-card {
  @apply flex items-center gap-3 px-4 py-4 bg-white border border-slate-200 hover:border-slate-300 rounded-xl shadow-sm transition-all;
}
.icon-box {
  @apply w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0;
}
</style>
