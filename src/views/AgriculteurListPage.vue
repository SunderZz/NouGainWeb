<template>
    <div>
      <Header />
      <Agriculteur />
      <Footer />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from "vue";
  import Header from "../components/Homepage/Header.vue";
  import Agriculteur from "../components/Profil/AgriculteurList.vue";
  import Footer from "../components/Homepage/Footer.vue";
  
  </script>
  