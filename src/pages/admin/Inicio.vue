<script setup>
  import { onMounted } from "vue";
  import { useAppStore } from "../../stores/aplicacion/appStore";
  import { useAuthStore } from "../../stores/authStore";
  import Admin from "../../layouts/Admin.vue";
  const appStore = useAppStore();
  const authStore = useAuthStore();

  onMounted(() => {
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
    </Content>
  </Admin>
</template>
