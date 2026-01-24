<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/api/Axios';

const authStore = useAuthStore();

onMounted(() => {
  // [LOGIC PENTING]
  // Saat aplikasi dimuat ulang (refresh), cek apakah ada token tersimpan.
  // Jika ada, paksa Axios untuk memakainya kembali.
  if (authStore.token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${authStore.token}`;
  }
});
</script>

<template>
  <RouterView />
</template>