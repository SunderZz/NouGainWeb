<template>
  <MDBContainer fluid class="mt-4">
    <MDBRow class="mb-4">
      <MDBCol>
        <a
          v-for="(user, index) in users"
          :key="index"
          href="#/ProfilAgriculteur"
          class="user-card-link"
        >
          <div class="user-card d-flex align-items-center mb-4">
            <img :src="user.photo" alt="User photo" class="user-photo me-3" />
            <div class="user-info flex-grow-1">
              <h5 class="mb-1">{{ user.firstName }} {{ user.lastName }}</h5>
              <p class="mb-1">{{ user.shortDescription }}</p>
            </div>
            <ul class="user-objects">
              <li v-for="(item, idx) in user.objects" :key="idx">{{ item }}</li>
            </ul>
          </div>
        </a>
      </MDBCol>
    </MDBRow>
  </MDBContainer>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import { MDBContainer, MDBRow, MDBCol } from "mdb-vue-ui-kit";

const users = ref([]);
const defaultImage = "https://via.placeholder.com/150"; 

const fetchProducers = async () => {
  try {
    const response = await axios.get("http://127.0.0.1:8000/producers/");
    console.log(response);

    users.value = response.data.map((producer) => ({
      firstName: producer.firstName,
      lastName: producer.lastName,
      photo: defaultImage, 
      shortDescription: producer.description || "Description non disponible",
      objects: producer.objects || [], 
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des producteurs:", error);
  }
};

onMounted(() => {
  fetchProducers();
});
</script>
<style scoped>
.user-card-link {
  text-decoration: none;
  color: inherit;
}

.user-card {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  align-items: center;
  transition: transform 0.3s; 
}

.user-card:hover {
  transform: scale(1.02);
}

.user-photo {
  width: 60px; 
  height: 60px;
  object-fit: cover;
  border-radius: 50%;
}

.user-info {
  flex-grow: 1;
  margin-left: 10px;
}

.user-objects {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.user-objects li {
  margin-bottom: 5px;
}
</style>
