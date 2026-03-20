<script setup lang="ts">
const { t } = useLocale()

useHead({ title: `About Merise — ${t('app.name')}` })

const cardinalities = [
  { notation: '0,1', meaning: 'Zero or one — optional, unique' },
  { notation: '1,1', meaning: 'Exactly one — mandatory, unique' },
  { notation: '0,n', meaning: 'Zero or many — optional, multiple' },
  { notation: '1,n', meaning: 'One or many — mandatory, multiple' },
]
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
      <h1 class="text-3xl font-bold text-slate-900 mb-2">📐 {{ t('home.aboutTitle') }}</h1>
      <p class="text-slate-500 mb-10 text-sm">A quick primer on the Merise methodology and how it maps to Open Data Modeler.</p>

      <div class="space-y-8 text-slate-700 leading-relaxed text-sm">

        <section>
          <h2 class="font-bold text-slate-800 text-lg mb-2">What is Merise?</h2>
          <p>Merise is a French systems and data modelling methodology developed in the 1970s. It separates data design into two levels: a <strong>Conceptual Data Model (CDM)</strong> that captures the business meaning, and a <strong>Logical Data Model (LDM)</strong> that maps it to a relational schema.</p>
        </section>

        <section>
          <h2 class="font-bold text-slate-800 text-lg mb-2">Entities</h2>
          <p>An <strong>entity</strong> represents a real-world object (e.g. <code class="bg-slate-100 px-1 rounded">CLIENT</code>, <code class="bg-slate-100 px-1 rounded">PRODUCT</code>). Each entity has <strong>attributes</strong> — one of which is designated as the <strong>primary key (PK)</strong>, shown with a badge in the editor.</p>
        </section>

        <section>
          <h2 class="font-bold text-slate-800 text-lg mb-2">Associations</h2>
          <p>An <strong>association</strong> links two or more entities and represents a relationship (e.g. <code class="bg-slate-100 px-1 rounded">PLACES</code> between CLIENT and ORDER). Associations can carry their own attributes (e.g. <code class="bg-slate-100 px-1 rounded">quantity</code> on a line-item relationship).</p>
        </section>

        <section>
          <h2 class="font-bold text-slate-800 text-lg mb-2">Cardinalities</h2>
          <p>Each side of an association carries a cardinality that describes how many instances participate:</p>
          <div class="mt-3 grid grid-cols-2 gap-2">
            <div v-for="card in cardinalities" :key="card.notation"
              class="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg">
              <code class="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs flex-shrink-0">{{ card.notation }}</code>
              <span class="text-slate-600 text-xs leading-snug">{{ card.meaning }}</span>
            </div>
          </div>
        </section>

        <section>
          <h2 class="font-bold text-slate-800 text-lg mb-2">CDM → LDM rules</h2>
          <div class="space-y-2">
            <div class="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg">
              <span class="text-xs font-mono font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded flex-shrink-0">1:n</span>
              <span class="text-xs text-slate-600">A foreign key is added to the table on the "one" side, referencing the "many" side.</span>
            </div>
            <div class="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg">
              <span class="text-xs font-mono font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded flex-shrink-0">n:n</span>
              <span class="text-xs text-slate-600">A junction table is created with foreign keys from both entities, plus any association attributes.</span>
            </div>
          </div>
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
