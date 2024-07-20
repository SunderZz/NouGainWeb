<template>
  <MDBContainer fluid class="mt-4">
    <div
      v-if="farmer.active"
      class="background-image-container position-relative"
    >
      <div class="profile-container">
        <MDBCard class="profile-card">
          <img
            :src="farmer.image"
            class="farmer-img mx-auto d-block"
            alt="Profile image"
          />
          <MDBCardBody class="text-center">
            <MDBCardTitle
              >{{ farmer.firstName }} {{ farmer.lastName }}</MDBCardTitle
            >
            <br />
            <MDBCardText>{{ farmer.description }}</MDBCardText>
          </MDBCardBody>
        </MDBCard>
      </div>
    </div>
    <div v-else class="text-center mt-4">
      <h2>Le producteur choisi est indisponible.</h2>
      <MDBBtn @click="goHome" color="primary">Retour à l'accueil</MDBBtn>
    </div>

    <div class="spacer"></div>

    <MDBRow v-if="farmer.active" class="mb-4">
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

    <MDBRow v-if="farmer.active">
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
  MDBBtn,
} from "mdb-vue-ui-kit";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";

interface Product {
  Name: string;
  Price_ht: number;
  Quantity: number;
  image: string;
}

interface Farmer {
  firstName: string;
  lastName: string;
  description: string;
  image: string;
  products: Product[];
  active: boolean;
}

interface Address {
  Adresse: string;
  Phone: number;
  Creation: string;
  Modification: string;
  Latitude: number;
  Longitude: number;
}

const farmer = ref<Farmer>({
  firstName: "",
  lastName: "",
  description: "",
  image: "",
  products: [],
  active: false,
});

const addresses = ref<Address[]>([]);
const defaultImage = "https://via.placeholder.com/150";
const route = useRoute();
const router = useRouter();

const fetchFarmerData = async (): Promise<void> => {
  const userId = route.params.id;
  try {
    const userResponse = await axios.get(
      `http://127.0.0.1:8000/users/${userId}`
    );
    const user = userResponse.data;

    if (!user.active) {
      farmer.value.active = false;
      return;
    }

    farmer.value.firstName = user.F_Name;
    farmer.value.lastName = user.Name;
    farmer.value.active = true;

    const addressResponse = await axios.get(
      `http://127.0.0.1:8000/users/${userId}/addresses`
    );
    addresses.value = addressResponse.data;

    const producerResponse = await axios.get(
      `http://127.0.0.1:8000/producers_by_user/${userId}`
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
      const productData = productResponse.data;
      const productImage = await fetchProductImage(productId);
      productDetails.push({
        ...productData,
        image: productImage,
      });
    }

    farmer.value.description = producerResponse.data.description;
    farmer.value.image = await fetchUserPhoto(userId);
    farmer.value.products = productDetails;
  } catch (error) {}
};

const fetchUserPhoto = async (userId: number): Promise<string> => {
  try {
    const imageResponse = await axios.get(
      `http://127.0.0.1:8000/produit_image/?produit_image_id=${userId}&field_name=Id_Users`,
      { responseType: "blob" }
    );
    const imageUrl = URL.createObjectURL(imageResponse.data);
    return imageUrl;
  } catch (error) {
    return defaultImage;
  }
};

const fetchProductImage = async (productId: number): Promise<string> => {
  try {
    const imageResponse = await axios.get(
      `http://127.0.0.1:8000/produit_image/?produit_image_id=${productId}&field_name=Id_Product`,
      { responseType: "blob" }
    );
    const imageUrl = URL.createObjectURL(imageResponse.data);
    return imageUrl;
  } catch (error) {
    return defaultImage;
  }
};

const goHome = () => {
  router.push("/");
};

onMounted((): void => {
  fetchFarmerData().then((): void => {
    if (farmer.value.active && addresses.value.length > 0) {
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
