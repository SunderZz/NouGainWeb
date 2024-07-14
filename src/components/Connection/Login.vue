<template>
  <MDBContainer fluid class="mt-4">
    <MDBRow class="justify-content-center">
      <MDBCol md="6">
        <h2 class="text-center mb-4">Connectez-vous</h2>

        <MDBCard>
          <MDBCardBody>
            <MDBRow>
              <MDBCol md="12" class="mb-3">
                <MDBInput
                  v-model="loginInfo.email"
                  label="Adresse e-mail"
                  type="email"
                />
              </MDBCol>
              <MDBCol md="12" class="mb-3">
                <MDBInput
                  v-model="loginInfo.password"
                  label="Mot de passe"
                  type="password"
                />
              </MDBCol>
              <MDBCol md="12" class="text-center">
                <MDBBtn color="primary" @click="login">Se connecter</MDBBtn>
              </MDBCol>
            </MDBRow>
          </MDBCardBody>
        </MDBCard>

        <div class="text-center mt-4">
          <a href="#/ForgotPassword" class="d-block mb-2"
            >Mot de passe oublié ?</a
          >
          <a href="#/createAccount">Créer un compte</a>
        </div>

        <div v-if="errorMessage" class="text-center mt-4 text-danger">
          {{ errorMessage }}
        </div>
      </MDBCol>
    </MDBRow>
  </MDBContainer>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBBtn,
} from "mdb-vue-ui-kit";

const loginInfo = ref({
  email: "",
  password: "",
});

const errorMessage = ref("");

const router = useRouter();

const login = async () => {
  try {
    const response = await axios.post(
      `http://127.0.0.1:8000/users/login?mail=${loginInfo.value.email}&password=${loginInfo.value.password}`,
      {},
      {
        headers: {
          accept: "application/json",
        },
      }
    );
    const token = response.data.token;
    localStorage.setItem("authToken", token);
    router.push("/");
  } catch (error) {
    console.error("Erreur de connexion:", error);
    errorMessage.value = "Adresse e-mail ou mot de passe incorrect.";
  }
};
</script>
<style scoped>
.text-center {
  text-align: center;
}

.d-block {
  display: block;
}

.text-danger {
  color: red;
}
</style>
