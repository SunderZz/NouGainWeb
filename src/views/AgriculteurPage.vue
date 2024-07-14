<template>
  <div>
    <Header />
    <List />
    <Footer class="footer" />
  </div>
</template>

<script setup lang="ts">
import Header from "../components/Homepage/Header.vue";
import List from "../components/Profil/AgriculteurList.vue";
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
