<script setup>
  import { onBeforeMount } from "vue";
  import Footer from "./includes/Footer.vue";
  import NavBar from "./includes/NavBar.vue";
  import SideBar from "./includes/SideBar.vue";
  import { useAppStore } from "../stores/aplicacion/appStore";
  const appStore = useAppStore();
  onBeforeMount(() => {
    appStore.initUserInfo();
  });
</script>
<template>
  <div class="loading" :class="[appStore.getLoading == true ? 'show' : '']">
    <!-- <div class="loading show"> -->
    <template v-if="$slots.loading">
      <slot name="loading"></slot>
    </template>
    <template v-else>
      <i class="fa fa-spin fa-spinner fa-4x"></i>
    </template>
  </div>

  <div class="wrapper">
    <NavBar></NavBar>
    <SideBar></SideBar>
    <slot />
    <Footer></Footer>
  </div>
</template>
