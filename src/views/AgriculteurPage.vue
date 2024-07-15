<template>
  <div>
    <Header />
    <Agriculteur />
    <Footer class="footer" />
  </div>
</template>

<script setup lang="ts">
import Header from "../components/Homepage/Header.vue";
import Agriculteur from "../components/Profil/Agriculteur.vue";
import Footer from "../components/Homepage/Footer.vue";
</script>
<style>
.footer {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  background-color: red;
  color: white;
  text-align: center;
}
</style>
