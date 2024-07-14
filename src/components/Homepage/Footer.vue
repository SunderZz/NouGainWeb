<template>
  <MDBFooter text="center" class="mt-auto">
    <MDBContainer class="pt-4">
      <section class="mb-4">
        <a
          class="btn btn-link btn-floating btn-lg text-dark m-1"
          href="#aRemplir"
          role="button"
          v-mdb-ripple="{ color: 'dark' }"
          ><MDBIcon iconStyle="fab" icon="linkedin"></MDBIcon
        ></a>
        <a
          class="btn btn-link btn-floating btn-lg text-dark m-1"
          href="#aRemplir"
          role="button"
          v-mdb-ripple="{ color: 'dark' }"
          ><MDBIcon iconStyle="fab" icon="github"></MDBIcon
        ></a>
      </section>
    </MDBContainer>
    <div
      class="text-center text-dark p-3 d-flex justify-content-between align-items-center"
      style="background-color: rgba(0, 0, 0, 0.2)"
    >
      <span
        >© 2024 Copyright:
        <a class="text-dark" href="https://mdbootstrap.com/">Samuel Gilles</a>
      </span>
      <a @click="scrollToTop">
        <MDBIcon icon="arrow-up" class="text-dark"></MDBIcon>
      </a>
    </div>
  </MDBFooter>
</template>

<script setup lang="ts">
import { MDBFooter, MDBContainer, MDBIcon } from "mdb-vue-ui-kit";

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
</script>

<style scoped>
html,
body {
  height: 100%;
  margin: 0;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
}

.MDBFooter {
  width: 100%;
  position: relative;
  bottom: 0;
}
</style>
