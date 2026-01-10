<script setup>
import Navbar from '@/components/navigation/Navbar.vue'
import Footer from '@/components/navigation/Footer.vue'
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
