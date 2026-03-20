<script setup lang="ts">
const { locale, t, setLocale } = useLocale()
</script>

<template>
  <button
    :title="t('lang.switchLabel')"
    class="flex items-center gap-1.5 px-3 py-1.5 border-[1.5px] border-slate-200 rounded-lg bg-white text-slate-500 font-mono text-[11px] font-bold tracking-wide transition-all hover:border-blue-900 hover:text-blue-900 hover:bg-blue-50"
    @click="setLocale(locale === 'en' ? 'fr' : 'en')"
  >
    <i class="fa-solid fa-globe text-[12px]" />
    {{ t('lang.switchTo') }}
  </button>
</template>
