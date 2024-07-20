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
            alt="Customer image"
          />
        </MDBCard>
        <div class="text-center mt-3 customer-info">
          <h2>{{ customers.name }}</h2>
        </div>
      </div>
    </div>

    <div class="spacer"></div>

    <div class="text-center mt-3">
      <MDBBtn color="primary" @click="navigateToOrderHistory">
        View Order History
      </MDBBtn>
    </div>
  </MDBContainer>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { MDBContainer, MDBCard, MDBBtn, MDBIcon } from "mdb-vue-ui-kit";

interface Customer {
  name: string;
  description: string;
  image: string;
}

const customers = ref<Customer>({
  name: "",
  description: "",
  image: "https://mdbootstrap.com/img/new/standard/nature/184.webp",
});

const router = useRouter();

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

    try {
      const imageResponse = await axios.get(
        `http://127.0.0.1:8000/produit_image/?produit_image_id=${user.Id_Users}&field_name=Id_Users`,
        { responseType: "blob" }
      );
      const imageUrl = URL.createObjectURL(imageResponse.data);
      customers.value.image = imageUrl;
    } catch (error) {
      customers.value.image =
        "https://mdbootstrap.com/img/new/standard/nature/184.webp";
    }
  } catch (error) {
  }
};

const navigateToOrderHistory = () => {
  router.push({ path: "/OrderHistory" });
};

onMounted(() => {
  fetchUserData();
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
  object-fit: contain;
  border-radius: 50%;
  border: 5px solid white;
}

.customer-info {
  margin-top: 50px;
}

.spacer {
  height: 50px;
}
</style>
