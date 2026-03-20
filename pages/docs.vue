<script setup lang="ts">
const { t } = useLocale()
useHead({ title: `Docs — ${t('app.name')}` })
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans">
    <nav class="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200">
      <NuxtLink to="/" class="flex flex-col leading-tight hover:opacity-80 transition-opacity">
        <span class="font-mono font-bold text-blue-900 tracking-wide text-sm">{{ t('app.name') }}</span>
        <span class="font-mono text-[9px] tracking-[3px] text-slate-400 uppercase">{{ t('app.tagline') }}</span>
      </NuxtLink>
      <div class="flex items-center gap-3">
        <NuxtLink to="/" class="text-[11px] font-mono text-slate-500 hover:text-blue-900 transition-colors">← Home</NuxtLink>
        <LangSwitcher />
      </div>
    </nav>

    <main class="flex-1 max-w-2xl mx-auto px-6 py-14 w-full">
      <h1 class="text-3xl font-bold text-slate-900 mb-2">📖 {{ t('home.docsTitle') }}</h1>
      <p class="text-slate-500 mb-10">{{ t('home.docsSub') }}</p>

      <div class="space-y-6 text-slate-700 leading-relaxed">
        <section>
          <h2 class="font-bold text-slate-800 text-lg mb-2">Getting started</h2>
          <p>Click <strong>New CDM / LDM</strong> on the home page to open the diagram editor. The canvas starts with a sample schema — a <code class="bg-slate-100 px-1 rounded text-sm">CLIENT → COMMANDE ← PRODUIT</code> model.</p>
        </section>

        <section>
          <h2 class="font-bold text-slate-800 text-lg mb-2">Tools</h2>
          <ul class="space-y-2 text-sm">
            <li><code class="bg-slate-100 px-1 rounded">↖ Select</code> — Click to select a node, drag to move it.</li>
            <li><code class="bg-slate-100 px-1 rounded">□ Entity</code> — Click anywhere on the canvas to create a new entity.</li>
            <li><code class="bg-slate-100 px-1 rounded">◯ Assoc.</code> — Click anywhere to create a new association.</li>
            <li><code class="bg-slate-100 px-1 rounded">↔ Link</code> — Click an entity then an association (or vice versa) to create a link.</li>
            <li><code class="bg-slate-100 px-1 rounded">✕ Delete</code> — Click any node to remove it.</li>
          </ul>
        </section>

        <section>
          <h2 class="font-bold text-slate-800 text-lg mb-2">CDM ↔ LDM</h2>
          <p class="text-sm">Use the <strong>CDM / LDM</strong> toggle in the toolbar to switch views. The Logical Data Model is generated automatically from your Conceptual Data Model in real time — every change in CDM mode is instantly reflected in LDM mode.</p>
        </section>

        <section>
          <h2 class="font-bold text-slate-800 text-lg mb-2">Export</h2>
          <p class="text-sm">Use <strong>Export PNG</strong> or <strong>Export PDF</strong> to save the current view. The export captures the entire canvas, including all entities and associations.</p>
        </section>
      </div>

      <div class="mt-12">
        <NuxtLink
          to="/editor"
          class="inline-flex items-center gap-2 px-5 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-blue-900/20"
        >
          <span>◈</span> {{ t('home.newMcd') }} →
        </NuxtLink>
      </div>
    </main>
  </div>
</template>
