<template>
  <MDBContainer fluid class="mt-4">
    <div class="background-image-container position-relative">
      <a href="#/SettingAgriculteur" class="settings-icon-link">
        <MDBIcon fas icon="cog" class="settings-icon" />
      </a>
      <div class="profile-container">
        <MDBCard class="profile-card">
          <img
            :src="farmer.image"
            class="farmer-img mx-auto d-block"
            alt="Farmer image"
          />
          <MDBCardBody class="text-center">
            <MDBCardTitle>{{ farmer.name }}</MDBCardTitle>
            <br />
            <MDBCardText>{{ farmer.description }}</MDBCardText>
          </MDBCardBody>
        </MDBCard>
      </div>
    </div>

    <div class="spacer"></div>

    <MDBRow class="mb-4">
      <MDBCol>
        <div class="scroll-container">
          <div
            v-for="(product, index) in farmer.products"
            :key="index"
            class="d-flex mb-3 product-item"
          >
            <img
              :src="product.image"
              alt="Product image"
              class="product-img me-3"
            />
            <div class="d-flex flex-column justify-content-between flex-grow-1">
              <div class="d-flex justify-content-between">
                <div>
                  <p>{{ product.Name }}</p>
                  <p>{{ product.Price_ht }} €</p>
                </div>
                <div>
                  <p>{{ product.Quantity }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MDBCol>
    </MDBRow>

    <MDBRow>
      <MDBCol>
        <h2>Informations supplémentaires</h2>
        <div class="d-flex justify-content-between">
          <div id="map" class="additional-map"></div>
        </div>
      </MDBCol>
    </MDBRow>
  </MDBContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBBtn,
  MDBIcon,
} from "mdb-vue-ui-kit";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

const farmer = ref({
  name: "",
  description: "",
  image: "",
  products: [],
});

const additionalInfo = ref({
  field1: "",
  field2: "",
  field3: "",
  coordinates: [48.8566, 2.3522],
});

const incrementQuantity = (index: number) => {
  console.log(`Quantité incrémentée pour le produit à l'index ${index}`);
};

const fetchUserData = async () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    console.error("Token non trouvé dans le local storage");
    return;
  }

  try {
    const userResponse = await axios.get(
      "http://127.0.0.1:8000/users_by_token",
      {
        params: { token },
      }
    );

    const userId = userResponse.data.Id_Users;
    const producerResponse = await axios.get(
      `http://127.0.0.1:8000/producers/${userId}`
    );

    const producerId = producerResponse.data.Id_Producers;

    const giveResponse = await axios.get(
      "http://127.0.0.1:8000/give_producers",
      {
        params: { give_id: producerId },
      }
    );

    const productIds = giveResponse.data.map((give: any) => give.Id_Product);

    const productDetails = [];
    for (const productId of productIds) {
      const productResponse = await axios.get(
        "http://127.0.0.1:8000/products_by_id/",
        {
          params: { id: productId },
        }
      );

      productDetails.push(productResponse.data);
    }

    farmer.value.name = userResponse.data.Name;
    farmer.value.description = producerResponse.data.description;
    farmer.value.image = userResponse.data.image;
    farmer.value.products = productDetails;

    additionalInfo.value.field1 = producerResponse.data.field1;
    additionalInfo.value.field2 = producerResponse.data.field2;
    additionalInfo.value.field3 = producerResponse.data.field3;
    if (producerResponse.data.coordinates) {
      additionalInfo.value.coordinates = producerResponse.data.coordinates;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
  }
};

onMounted(() => {
  fetchUserData();

  const map = L.map("map").setView(additionalInfo.value.coordinates, 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  L.marker(additionalInfo.value.coordinates)
    .addTo(map)
    .bindPopup("Localisation de l'exploitation.")
    .openPopup();
});
</script>

<style scoped>
.background-image-container {
  background-image: url("https://mdbootstrap.com/img/new/standard/nature/189.webp");
  background-size: cover;
  background-position: center;
  width: 100%;
  height: 400px;
  position: relative;
}

.profile-container {
  position: absolute;
  bottom: -75px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.profile-card {
  width: 300px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
}

.farmer-img {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 50%;
  border: 5px solid white;
}

.farmer-info {
  margin-top: 50px;
}

.settings-icon {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 24px;
  color: white;
  cursor: pointer;
}

.spacer {
  height: 50px;
}

.scroll-container {
  max-height: 400px;
  overflow-y: auto;
}

.product-item {
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
}

.product-img {
  width: 100px;
  height: auto;
}

.additional-map {
  width: 500px;
  height: 200px;
}
</style>
