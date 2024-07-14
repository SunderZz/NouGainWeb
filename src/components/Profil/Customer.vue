<template>
  <MDBContainer fluid class="mt-4">
    <div class="background-image-container position-relative">
      <a href="#/Setting" class="settings-icon-link">
        <MDBIcon fas icon="cog" class="settings-icon" />
      </a>
      <div class="profile-container">
        <MDBCard class="profile-card">
          <img
            :src="customers.image"
            class="customer-img mx-auto d-block"
            alt="Customers image"
          />
        </MDBCard>
        <div class="text-center mt-3 customer-info">
          <h2>{{ customers.name }}</h2>
          <p>{{ customers.description }}</p>
        </div>
      </div>
    </div>

    <div class="spacer"></div>

    <MDBRow>
      <MDBCol>
        <h5>Informations supplémentaires</h5>
        <div class="d-flex justify-content-between">
          <div id="map" class="additional-map"></div>
        </div>
      </MDBCol>
    </MDBRow>
  </MDBContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBBtn,
  MDBIcon,
} from "mdb-vue-ui-kit";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const customers = ref({
  name: "",
  description: "",
  image: "",
});

const additionalInfo = ref({
  field1: "",
  field2: "",
  field3: "",
  coordinates: [0, 0],
});

const fetchUserData = async () => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("No auth token found");

    const response = await axios.get("http://127.0.0.1:8000/users_by_token", {
      params: { token },
    });
    const user = response.data;

    customers.value.name = user.Name || "";
    customers.value.description = user.Description || "";
    customers.value.image =
      user.image || "https://mdbootstrap.com/img/new/standard/nature/184.webp";
    additionalInfo.value.coordinates = user.coordinates || [0, 0];
    additionalInfo.value.field1 = user.field1 || "";
    additionalInfo.value.field2 = user.field2 || "";
    additionalInfo.value.field3 = user.field3 || "";
  } catch (error) {
    console.error("Failed to fetch user data:", error);
  }
};

onMounted(() => {
  fetchUserData().then(() => {
    const map = L.map("map").setView(additionalInfo.value.coordinates, 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    L.marker(additionalInfo.value.coordinates)
      .addTo(map)
      .bindPopup("Localisation de l'exploitation.")
      .openPopup();
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

.settings-icon-link {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 24px;
  color: white;
  cursor: pointer;
  text-decoration: none;
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

.customer-img {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 50%;
  border: 5px solid white;
}

.customer-info {
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
  height: auto;
}

.additional-map {
  width: 400px;
  height: 400px;
}
</style>
