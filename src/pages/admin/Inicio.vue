<script setup>
  import { onMounted, ref } from "vue";
  import { useAppStore } from "../../stores/aplicacion/appStore";
  import { useAuthStore } from "../../stores/authStore";
  import api from "../../composables/axios";
  const appStore = useAppStore();
  const authStore = useAuthStore();
  const array_infos = ref([]);
  const loadingInfos = ref(false);
  const cargarArrayInfos = () => {
    loadingInfos.value = true;
    api
      .get("/admin/inicio")
      .then((response) => {
        array_infos.value = response.data.array_infos;
      })
      .catch((err) => {})
      .finally(() => {
        loadingInfos.value = false;
      });
  };

  onMounted(() => {
    cargarArrayInfos();
    appStore.stopLoading();
  });
</script>
<template>
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

    <el-skeleton :loading="loadingInfos" animated class="w-100 row" :count="4">
      <template #template>
        <div class="col-lg-3 col-6">
          <el-skeleton-item style="height: 120px"></el-skeleton-item>
        </div>
      </template>
      <template #default>
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
      </template>
    </el-skeleton>
  </Content>
</template>
