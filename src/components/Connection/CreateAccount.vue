<template>
  <MDBContainer fluid class="mt-4">
    <MDBRow class="justify-content-center">
      <MDBCol md="8">
        <h2 class="text-center mb-4">Créer un compte</h2>

        <MDBCard>
          <MDBCardBody>
            <MDBRow>
              <MDBCol md="6" class="mb-3">
                <MDBInput
                  v-model="accountInfo.firstName"
                  label="Prénom"
                  type="text"
                />
              </MDBCol>
              <MDBCol md="6" class="mb-3">
                <MDBInput
                  v-model="accountInfo.lastName"
                  label="Nom"
                  type="text"
                />
              </MDBCol>
              <MDBCol md="12" class="mb-3">
                <MDBInput
                  v-model="accountInfo.email"
                  label="Adresse e-mail"
                  type="email"
                />
              </MDBCol>
              <MDBCol md="12" class="mb-3">
                <MDBCheckbox
                  v-model="accountInfo.isFarmer"
                  label="Êtes-vous agriculteur ?"
                />
              </MDBCol>
              <MDBCol v-if="accountInfo.isFarmer" md="12" class="mb-3">
                <MDBInput type="file" @change="onDocumentUpload" />
                <br />
                <MDBCol md="6" class="mb-3">
                  <MDBInput
                    v-model="accountInfo.summary"
                    label="Description"
                    type="text"
                  />
                </MDBCol>
              </MDBCol>
              <MDBCol md="6" class="mb-3">
                <MDBInput
                  v-model="accountInfo.password"
                  label="Mot de passe"
                  type="password"
                />
              </MDBCol>
              <MDBCol md="6" class="mb-3">
                <MDBInput
                  v-model="accountInfo.confirmPassword"
                  label="Confirmer le mot de passe"
                  type="password"
                />
              </MDBCol>
            </MDBRow>
            <MDBRow>
              <MDBCol md="6" class="text-center">
                <a href="#/Login">
                  <MDBBtn color="primary">Se connecter</MDBBtn>
                </a>
              </MDBCol>
              <MDBCol md="6" class="text-center">
                <MDBBtn color="success" @click="createAccount">Valider</MDBBtn>
              </MDBCol>
            </MDBRow>
          </MDBCardBody>
        </MDBCard>
      </MDBCol>
    </MDBRow>

    <div
      class="modal fade"
      id="successModal"
      tabindex="-1"
      aria-labelledby="successModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="successModalLabel">
              Inscription confirmée
            </h5>
            <button
              type="button"
              class="btn-close"
              data-mdb-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            Inscription confirmée, nous vous redirigeons vers la page d'accueil.
          </div>
        </div>
      </div>
    </div>
  </MDBContainer>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBBtn,
  MDBCheckbox,
} from "mdb-vue-ui-kit";
import axios from "axios";

interface AccountInfo {
  firstName: string;
  lastName: string;
  email: string;
  isFarmer: boolean;
  password: string;
  confirmPassword: string;
  document: File | null;
  summary: string | null;
}

const accountInfo = ref<AccountInfo>({
  firstName: "",
  lastName: "",
  email: "",
  isFarmer: false,
  password: "",
  confirmPassword: "",
  document: null,
  summary: null,
});

const onDocumentUpload = (event: Event): void => {
  const file = (event.target as HTMLInputElement).files?.[0] || null;
  if (file) {
    accountInfo.value.document = file;
  }
};

const router = useRouter();

const createAccount = async (): Promise<void> => {
  if (accountInfo.value.password !== accountInfo.value.confirmPassword) {
    alert("Les mots de passe ne correspondent pas.");
    return;
  }

  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d{2})(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{7,}$/;
  if (!passwordRegex.test(accountInfo.value.password)) {
    alert(
      "Le mot de passe doit contenir au moins 7 caractères, une majuscule, un caractère spécial et deux chiffres."
    );
    return;
  }

  const formData = new FormData();
  formData.append("firstName", accountInfo.value.firstName);
  formData.append("lastName", accountInfo.value.lastName);
  formData.append("email", accountInfo.value.email);
  formData.append("password", accountInfo.value.password);
  formData.append("isFarmer", accountInfo.value.isFarmer.toString());
  if (accountInfo.value.document) {
    formData.append("document", accountInfo.value.document);
  }
  if (accountInfo.value.summary) {
    formData.append("summary", accountInfo.value.summary);
  }

  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/users/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const modalElement = document.getElementById("successModal");
    if (modalElement) {
      const modalInstance = new (window as any).mdb.Modal(modalElement);
      modalInstance.show();

      setTimeout(() => {
        modalInstance.hide();
        router.push("/");
      }, 5000);
    }
  } catch (error) {}
};
</script>

<style scoped>
.text-center {
  text-align: center;
}
</style>
