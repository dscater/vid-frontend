<script setup>
  import { computed } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import { useAppStore } from "../stores/aplicacion/appStore";

  const props = defineProps({
    ruta: String,
    label: String,
    icon: String,
    method: {
      type: String,
      default: "get",
    },
  });

  const appStore = useAppStore();
  const route = useRoute();

  // Computed para la ruta actual
  const routeCurrent = computed(() => route.name);

  const classActive = computed(() => {
    return routeCurrent.value == props.ruta ? "active" : "";
  });

  // Función para ejecutar post
  function ejecutaPost() {
    appStore.startLoading();
    // Aquí puedes ejecutar la acción POST que tenías
  }
</script>
<template>
  <li
    class="nav-item"
    v-if="method.toLowerCase() === 'get'"
    ref="link"
    :class="[$attrs.class]"
  >
    <!-- Router Link -->
    <router-link
      v-if="ruta !== routeCurrent"
      :to="{ name: ruta ? ruta : 'home' }"
      class="nav-link"
      :class="[classActive ?? '']"
      @click="appStore.startLoading()"
    >
      <i class="nav-icon" :class="icon ?? 'fa-th'"></i>
      <p>{{ label }}</p>
    </router-link>

    <!-- Ruta actual -->
    <div v-else class="nav-link" :class="[classActive ?? '']">
      <i class="nav-icon" :class="icon ?? 'fa-th'"></i>
      <p>{{ label }}</p>
    </div>
  </li>

  <li class="nav-item" v-else>
    <a
      href="#"
      class="nav-link"
      @click.prevent="ejecutaPost()"
      ref="link"
      :disabled="classActive"
    >
      <i class="nav-icon" :class="icon ?? 'fa-th'"></i>
      <p>{{ label }}</p>
    </a>
  </li>
</template>
