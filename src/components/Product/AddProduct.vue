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
              <MDBBtn color="primary" @click="triggerImageUpload">Upload Image</MDBBtn>
            </div>

            <MDBRow>
              <MDBCol md="6" class="mb-3">
                <MDBInput v-model="form.name" label="Nom" type="text" />
              </MDBCol>
              <MDBCol md="12" class="mb-3">
                <MDBInput v-model="form.description" label="Description" type="textarea" />
              </MDBCol>
              <MDBCol md="6" class="mb-3">
                <MDBInput v-model="form.price" label="Prix HT" type="number" step="0.01" />
              </MDBCol>
              <MDBCol md="6" class="mb-3">
                <MDBInput v-model="form.stock" label="Stock" type="number" />
              </MDBCol>
              <MDBCol md="6" class="mb-3">
                <label for="tva">TVA</label>
                <select v-model="form.tva" class="form-control">
                  <option v-for="tva in tvaOptions" :key="tva.Id_Tva" :value="tva.Id_Tva">
                    {{ tva.Name }}
                  </option>
                </select>
              </MDBCol>
              <MDBCol md="6" class="mb-3">
                <label for="season">Saison</label>
                <select v-model="form.season" class="form-control">
                  <option v-for="season in seasonOptions" :key="season.Id_Season" :value="season.Id_Season">
                    {{ season.Name }}
                  </option>
                </select>
              </MDBCol>
              <MDBCol md="7" class="mb-3">
                <label for="unit">Unité</label>
                <select v-model="form.unitType" class="form-control">
                  <option value="Kg">Kg</option>
                  <option value="Litre">Litre</option>
                  <option value="Unit">Unit</option>
                  <option value="Gramme">Gramme</option>
                </select>
              </MDBCol>
              <MDBCol md="7" class="mb-3">
                <MDBInput v-model="form.unitValue" :label="'Valeur de l\'unité (' + form.unitType + ')'" type="number" step="0.01" />
              </MDBCol>
              <MDBCol md="6" class="mb-3">
                <MDBInput v-model="form.discount" label="Discount" type="number" step="0.01" />
              </MDBCol>
              <MDBCol md="12" class="mb-3">
                <MDBInput v-model="form.password" label="Confirmer avec votre mot de passe" type="password" />
              </MDBCol>
            </MDBRow>

            <MDBRow>
              <MDBCol md="6" class="text-center mb-3">
                <MDBBtn color="success" @click="verifyPasswordAndSubmit">Valider</MDBBtn>
              </MDBCol>
              <MDBCol md="6" class="text-center mb-3">
                <MDBBtn color="danger" @click="resetForm">Annuler</MDBBtn>
              </MDBCol>
            </MDBRow>
            <div v-if="successMessage" class="text-center text-success">{{ successMessage }}</div>
            <div v-if="errorMessage" class="text-center text-danger">{{ errorMessage }}</div>
          </MDBCardBody>
        </MDBCard>
      </MDBCol>
    </MDBRow>
  </MDBContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from 'vue-router';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBBtn,
} from "mdb-vue-ui-kit";
import axios from "axios";

const form = ref({
  name: "",
  description: "",
  price: 0,
  stock: 0,
  tva: 0,
  season: 0,
  unitType: "Kg",
  unitValue: 0,
  discount: 0,
  password: "",
});

const userId = ref<number | null>(null);
const tvaOptions = ref<{ Id_Tva: number, Name: string }[]>([]);
const seasonOptions = ref<{ Id_Season: number, Name: string }[]>([]);
const imagePreview = ref("https://via.placeholder.com/150");
const successMessage = ref("");
const errorMessage = ref("");

const router = useRouter();

const fetchTvaOptions = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/tva');
    tvaOptions.value = response.data;
  } catch (error) {
  }
};

const fetchSeasonOptions = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/seasons');
    seasonOptions.value = response.data;
  } catch (error) {
  }
};

const fetchUserId = async () => {
  try {
    const token = localStorage.getItem("authToken");
    const userResponse = await axios.get("http://127.0.0.1:8000/users_by_token", {
      params: { token },
    });
    userId.value = userResponse.data.Id_Users;
  } catch (error) {
  }
};

onMounted(() => {
  fetchTvaOptions();
  fetchSeasonOptions();
  fetchUserId();
});

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

const verifyPasswordAndSubmit = async () => {
  errorMessage.value = "";
  try {
    const response = await axios.post('http://127.0.0.1:8000/users/verify_password', {
      user_id: userId.value,
      password: form.value.password
    });

    if (response.data) {
      await submitForm();
    } else {
      errorMessage.value = 'Mot de passe incorrect';
    }
  } catch (error) {
    errorMessage.value = 'Mot de passe incorrect';
  }
};

const submitForm = async () => {
  const payload = {
    unit: {
      Kg: form.value.unitType === "Kg" ? form.value.unitValue : 0,
      Litre: form.value.unitType === "Litre" ? form.value.unitValue : 0,
      Unit: form.value.unitType === "Unit" ? form.value.unitValue : 0,
      Gramme: form.value.unitType === "Gramme" ? form.value.unitValue : 0
    },
    products: {
      Name: form.value.name,
      Description: form.value.description,
      Price_ht: form.value.price,
      Active: true,
      Date_activation: new Date().toISOString().split('T')[0],
      Date_stop: new Date().toISOString().split('T')[0],
      Discount: form.value.discount,
      Id_tva: form.value.tva
    }
  };

  try {
    const response = await axios.post(`http://127.0.0.1:8000/producers/10/create_product_by_producer?quantity=${form.value.stock}&season=${form.value.season}`, payload, {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    successMessage.value = 'Produit créé avec succès';
    setTimeout(() => {
      router.push('/');
    }, 5000);
  } catch (error) {
    errorMessage.value = 'Il manque des informations pour ce produit';
  }
};

const resetForm = () => {
  form.value = {
    name: "",
    description: "",
    price: 0,
    stock: 0,
    tva: 0,
    season: 0,
    unitType: "Kg",
    unitValue: 0,
    discount: 0,
    password: "",
  };
  imagePreview.value = "https://via.placeholder.com/150";
  errorMessage.value = "";
  successMessage.value = "";
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
