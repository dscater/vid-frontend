<script setup>
  import { onMounted, ref } from "vue";
  import { useAppStore } from "../../stores/aplicacion/appStore";
  import { useAuthStore } from "../../stores/authStore";
  import Admin from "../../layouts/Admin.vue";
  import api from "../../composables/axios";
  const appStore = useAppStore();
  const authStore = useAuthStore();
  const array_infos = ref([]);
  const cargarArrayInfos = () => {
    api.get("/admin/inicio").then((response) => {
      array_infos.value = response.data.array_infos;
    });
  };

  onMounted(() => {
    cargarArrayInfos();
    appStore.stopLoading();
  });
</script>
<template>
  <Admin>
    <Content>
      <template #header>
        <div class="row mb-2">
          <div class="col-sm-6">
            <h1 class="m-0">Inicio</h1>
          </div>
          <!-- /.col -->
          <div class="col-sm-6">
            <ol class="breadcrumb float-sm-right">
              <li class="breadcrumb-item active">Inicio</li>
            </ol>
          </div>
          <!-- /.col -->
        </div>
        <!-- /.row -->
      </template>

      <div class="row">
        <div class="col-lg-3 col-6" v-for="item in array_infos">
          <!-- small box -->
          <div class="small-box" :class="[item.color]">
            <div class="inner">
              <h3 class="text-white">{{ item.cantidad }}</h3>

              <p>{{ item.label }}</p>
            </div>
            <div class="icon">
              <i class="fa" :class="[item.icon]"></i>
            </div>
            <router-link :to="{ name: item.url }" class="small-box-footer"
              >Ver más <i class="fa fa-arrow-alt-circle-right"></i
            ></router-link>
          </div>
        </div>
      </div>
    </Content>
  </Admin>
</template>
