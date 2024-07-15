<template>
  <div class="home-container">
    <div class="content-container">
      <Header />
      <Agriculteur />
    </div>
    <Footer class="footer" />
  </div>
</template>
  
  <script setup lang="ts">
  import { ref } from "vue";
  import Header from "../components/Homepage/Header.vue";
  import Agriculteur from "../components/Profil/AgriculteurList.vue";
  import Footer from "../components/Homepage/Footer.vue";
  
  </script>
  <style scoped>
  .home-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  
  .content-container {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .footer {
    background-color: red;
    color: white;
    text-align: center;
  }
  </style>
  