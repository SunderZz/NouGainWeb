<template>
  <MDBContainer fluid class="mt-4">
    <MDBRow class="justify-content-center mb-4">
      <MDBCol md="8">
        <MDBCard>
          <MDBCardBody>
            <div class="image-upload-section text-center mb-4">
              <img
                :src="imagePreview"
                class="product-image mb-3"
                alt="Product"
              />
              <input
                type="file"
                @change="onImageUpload"
                class="d-none"
                ref="imageInput"
              />
              <MDBBtn color="primary" @click="triggerImageUpload"
                >Upload Image</MDBBtn
              >
            </div>

            <MDBRow>
              <MDBCol md="6" class="mb-3">
                <MDBInput v-model="form.name" label="Nom" type="text" />
              </MDBCol>
              <MDBCol md="12" class="mb-3">
                <MDBInput
                  v-model="form.description"
                  label="Description"
                  type="textarea"
                />
              </MDBCol>
              <MDBCol md="6" class="mb-3">
                <MDBInput
                  v-model="form.price"
                  label="Prix HT"
                  type="number"
                  step="0.01"
                />
              </MDBCol>
              <MDBCol md="6" class="mb-3">
                <MDBInput v-model="form.stock" label="Stock" type="number" />
              </MDBCol>
              <MDBCol md="6" class="mb-3">
                <MDBInput
                  v-model="form.tva"
                  label="TVA"
                  type="number"
                  step="0.01"
                />
              </MDBCol>
              <MDBCol md="6" class="mb-3">
                <MDBInput v-model="form.season" label="Saison" type="text" />
              </MDBCol>
              <MDBCol md="12" class="mb-3">
                <MDBInput
                  v-model="form.password"
                  label="Confirmer avec votre mot de passe"
                  type="password"
                />
              </MDBCol>
            </MDBRow>

            <MDBRow>
              <MDBCol md="6" class="text-center mb-3">
                <MDBBtn color="success" @click="submitForm">Valider</MDBBtn>
              </MDBCol>
              <MDBCol md="6" class="text-center mb-3">
                <MDBBtn color="danger" @click="resetForm">Annuler</MDBBtn>
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

const form = ref({
  name: "",
  description: "",
  price: 0,
  stock: 0,
  tva: 0,
  season: "",
  password: "",
});

const imagePreview = ref("https://via.placeholder.com/150");
const triggerImageUpload = () => {
  (refs.imageInput as HTMLInputElement).click();
};
const onImageUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const submitForm = () => {
  console.log("Form submitted", form.value);
};
const resetForm = () => {
  form.value = {
    name: "",
    description: "",
    price: 0,
    stock: 0,
    tva: 0,
    season: "",
    password: "",
  };
  imagePreview.value = "https://via.placeholder.com/150";
};
</script>

<style scoped>
.image-upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.product-image {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 10px;
  border: 2px solid #ddd;
}
</style>
