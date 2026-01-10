<script setup>
import Navbar from '@/components/common/Navbar.vue'
import Footer from '@/components/common/Footer.vue'
</script>

<template>
  <div class="layout">
    <Navbar> </Navbar>

    <main class="content">
      <router-view />
    </main>

    <Footer> </Footer>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1;
}
</style>
