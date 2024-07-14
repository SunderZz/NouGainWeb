<template>
  <header>
    <div class="p-5 mb-5 text-center" style="margin-top: 58px">
      <h1 class="mb-3">A nou osi nou gayn fé</h1>
      <h4 class="mb-3">
        Nou'Gayn promouvoit la production local et favorise <br />
        le circuit court, du producteur a votre assiette en un clic !
      </h4>
      <MDBBtn
        tag="router-link"
        to="/ProductList"
        style="background-color: #f60100"
        >Magasin</MDBBtn
      >
    </div>
  </header>
</template>
<script setup lang="ts">
import {
  MDBNavbar,
  MDBNavbarToggler,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBBtn,
  MDBCollapse,
} from "mdb-vue-ui-kit";
import { ref } from "vue";

const collapse4 = ref(false);
</script>
