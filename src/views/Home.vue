<template>
  <div class="home-container">
    <div class="bg-image-container"></div>
    <div class="content-container">
      <Header />
      <Heading />
      <Carousel />
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from "../components/Homepage/Header.vue";
import Heading from "../components/Homepage/Heading.vue";
import Carousel from "../components/Homepage/Carousel.vue";
import Footer from "../components/Homepage/Footer.vue";
</script>

<style scoped>
.home-container {
  position: relative;
  min-height: 100vh;
}
.bg-image-container {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: url("/image/Marché.jpg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  z-index: -1;
}

.content-container {
  display: flex;
  flex-direction: column;
}
</style>
