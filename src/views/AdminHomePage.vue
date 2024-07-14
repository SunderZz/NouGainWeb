<template>
  <div class="home-container">
    <div class="content-container">
      <Header />
      <Admin />
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from "../components/Homepage/Header.vue";
import Admin from "../components/Admin/AdminHome.vue";
import Footer from "../components/Homepage/Footer.vue";
</script>
<style scoped>
.home-container {
  position: relative;
  min-height: 100vh;
}

.content-container {
  display: flex;
  flex-direction: column;
}
</style>
