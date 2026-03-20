<script setup lang="ts">
const { locale, t } = useLocale()
useHead({
  htmlAttrs: { lang: locale as any },
  titleTemplate: (title) => title ? title : t('app.name'),
})
</script>

<template>
  <NuxtPage />
</template>
