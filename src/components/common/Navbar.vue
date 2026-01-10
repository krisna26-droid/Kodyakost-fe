<script setup>
</script>

<template>
  <nav class="navbar">
    <div class="container">
      <h1 class="logo">KodyaKost</h1>

      <ul class="nav-links">
        <li>Home</li>
        <li>Cari Kos</li>
        <li>Login</li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background: #ffffff;
  border-bottom: 1px solid #eee;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 20px;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 20px;
  list-style: none;
}
</style>
