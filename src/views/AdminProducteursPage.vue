<template>
    <div class="home-container">
      <div class="content-container">
        <Header />
        <Producteurs />
        <Footer class="footer" />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import Header from "../components/Homepage/Header.vue";
  import Producteurs from "../components/Admin/AdminProducteurs.vue";
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
  