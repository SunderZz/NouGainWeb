<template>
  <MDBContainer fluid class="mt-4">
    <MDBRow class="justify-content-center">
      <MDBCol md="6">
        <h2 class="text-center mb-4">Mot de passe oublié</h2>

        <p class="text-center mb-4">
          Votre mot de passe sera envoyé par e-mail.
        </p>

        <MDBCard>
          <MDBCardBody>
            <MDBRow>
              <MDBCol md="12" class="mb-3">
                <MDBInput v-model="email" label="Adresse e-mail" type="email" />
              </MDBCol>
              <MDBCol md="12" class="text-center">
                <MDBBtn color="primary" @click="sendPassword">Envoyer</MDBBtn>
              </MDBCol>
            </MDBRow>
          </MDBCardBody>
        </MDBCard>
      </MDBCol>
    </MDBRow>
  </MDBContainer>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBBtn,
} from "mdb-vue-ui-kit";

const email = ref("");

const sendPassword = () => {
  console.log("Mot de passe envoyé à", email.value);
};
</script>

<style scoped>
.text-center {
  text-align: center;
}
</style>
