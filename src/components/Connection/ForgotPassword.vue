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
              <MDBCol v-if="!emailSent" md="12" class="mb-3">
                <MDBInput v-model="email" label="Adresse e-mail" type="email" />
                <div v-if="errorMessage" class="text-danger mt-2">{{ errorMessage }}</div>
              </MDBCol>
              <MDBCol v-if="!emailSent" md="12" class="text-center">
                <MDBBtn color="primary" @click="sendPassword">Envoyer</MDBBtn>
              </MDBCol>
              <MDBCol v-if="emailSent" md="12" class="text-center mt-4">
                <div class="alert alert-success">
                  Un mail a bien été envoyé.
                </div>
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

const email = ref<string>("");
const emailSent = ref<boolean>(false);
const errorMessage = ref<string>("");

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const sendPassword = async (): Promise<void> => {
  if (!validateEmail(email.value)) {
    errorMessage.value = "Format de l'adresse e-mail incorrect.";
    return;
  }
  emailSent.value = true;

};
</script>

<style scoped>
.text-center {
  text-align: center;
}

.text-danger {
  color: red;
}

.alert {
  margin-top: 20px;
}
</style>
