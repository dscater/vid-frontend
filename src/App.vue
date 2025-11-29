<script setup>
  import { computed } from "vue";
  import { useRoute } from "vue-router";

  const route = useRoute();

  // Computed para elegir layout

  const layout = computed(() => route.meta.layout ?? "div");
</script>
<template>
  <component :is="layout">
    <router-view />
  </component>
</template>
