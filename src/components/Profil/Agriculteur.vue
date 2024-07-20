<template>
  <MDBContainer fluid class="mt-4">
    <div class="background-image-container position-relative">
      <a
        href="#/SettingAgriculteur"
        class="settings-icon-link"
        v-if="isProducer"
      >
        <MDBIcon fas icon="cog" class="settings-icon" />
      </a>
      <div class="profile-container">
        <MDBCard class="profile-card">
          <img
            :src="isProducer ? farmer.image : customer.image"
            class="farmer-img mx-auto d-block"
            alt="Profile image"
          />
          <MDBCardBody class="text-center">
            <MDBCardTitle>{{
              isProducer ? farmer.name : customer.name
            }}</MDBCardTitle>
            <br />
            <MDBCardText>{{
              isProducer ? farmer.description : customer.description
            }}</MDBCardText>
          </MDBCardBody>
        </MDBCard>
      </div>
    </div>

    <div class="spacer"></div>

    <MDBRow class="mb-4" v-if="isProducer">
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
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBIcon,
} from "mdb-vue-ui-kit";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

interface Product {
  Name: string;
  Price_ht: number;
  Quantity: number;
  image: string;
}

interface Farmer {
  name: string;
  description: string;
  image: string;
  products: Product[];
}

interface Customer {
  name: string;
  description: string;
  image: string;
}

interface Address {
  Adresse: string;
  Phone: number;
  Creation: string;
  Modification: string;
  Latitude: number | null;
  Longitude: number | null;
}

const isProducer = ref<boolean>(false);
const farmer = ref<Farmer>({
  name: "",
  description: "",
  image: "https://via.placeholder.com/150",
  products: [],
});
const customer = ref<Customer>({
  name: "",
  description: "",
  image: "https://via.placeholder.com/150",
});
const addresses = ref<Address[]>([]);

const fetchUserData = async () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
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

    const addressResponse = await axios.get(
      `http://127.0.0.1:8000/users/${userId}/addresses`
    );
    addresses.value = addressResponse.data;

    try {
      const producerResponse = await axios.get(
        `http://127.0.0.1:8000/producers_by_user/${userId}`
      );
      isProducer.value = true;

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
        const product = productResponse.data;

        try {
          const productImageResponse = await axios.get(
            `http://127.0.0.1:8000/produit_image/?produit_image_id=${product.Id_Product}&field_name=Id_Product`,
            { responseType: "blob" }
          );
          const productImageUrl = URL.createObjectURL(productImageResponse.data);
          product.image = productImageUrl;
        } catch (error) {
          product.image = "https://via.placeholder.com/150";
        }

        productDetails.push(product);
      }

      farmer.value.name = userResponse.data.Name;
      farmer.value.description = producerResponse.data.description;

      try {
        const imageResponse = await axios.get(
          `http://127.0.0.1:8000/produit_image/?produit_image_id=${userId}&field_name=Id_Users`,
          { responseType: "blob" }
        );
        const imageUrl = URL.createObjectURL(imageResponse.data);
        farmer.value.image = imageUrl;
      } catch (error) {
        farmer.value.image = "https://via.placeholder.com/150";
      }

      farmer.value.products = productDetails;
    } catch (producerError) {
      isProducer.value = false;

      customer.value.name = userResponse.data.Name || "";
      customer.value.description = userResponse.data.Description || "";
      try {
        const imageResponse = await axios.get(
          `http://127.0.0.1:8000/produit_image/?produit_image_id=${userId}&field_name=Id_Users`,
          { responseType: "blob" }
        );
        const imageUrl = URL.createObjectURL(imageResponse.data);
        customer.value.image = imageUrl;
      } catch (error) {
        customer.value.image = "https://via.placeholder.com/150";
      }
    }
  } catch (error) {
  }
};

onMounted(() => {
  fetchUserData().then(() => {
    if (
      addresses.value.length > 0 &&
      addresses.value[0].Latitude &&
      addresses.value[0].Longitude
    ) {
      const coordinates = [
        addresses.value[0].Latitude,
        addresses.value[0].Longitude,
      ];
      const map = L.map("map").setView(coordinates, 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      L.marker(coordinates)
        .addTo(map)
        .bindPopup("Localisation de l'exploitation.")
        .openPopup();
    }
  });
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
  object-fit: contain;
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
  height: 100px;
  object-fit: contain;
}

.additional-map {
  width: 500px;
  height: 200px;
}
</style>
