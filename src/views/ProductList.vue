<template>
  <div>
    <Header />
    <ProductList />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Header from "../components/Homepage/Header.vue";
import ProductList from "../components/Product/ListOfProduct.vue";
import Footer from "../components/Homepage/Footer.vue";

</script>
