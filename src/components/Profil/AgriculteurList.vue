<template>
  <MDBContainer fluid class="mt-4">
    <MDBRow class="mb-4 align-items-center">
      <MDBCol md="6">
        <h3>Agriculteurs</h3>
      </MDBCol>
    </MDBRow>
    <div class="list-container">
      <MDBRow>
        <MDBCol
          v-for="(user, index) in users"
          :key="index"
          md="12"
          class="mb-3"
        >
          <MDBCard @click="openFarmer(user.id)" class="cursor-pointer">
            <MDBCardBody class="d-flex align-items-center">
              <img :src="user.photo" alt="User photo" class="user-photo me-3" />
              <div class="user-info flex-grow-1">
                <h5 class="mb-1">{{ user.firstName }} {{ user.lastName }}</h5>
                <p class="mb-1">{{ user.description }}</p>
              </div>
              <ul class="user-objects">
                <li v-for="(item, idx) in user.objects" :key="idx">
                  {{ item }}
                </li>
              </ul>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </div>
  </MDBContainer>
</template>
<script setup lang="ts">
import { ref, onMounted, Ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
} from "mdb-vue-ui-kit";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  photo: string;
  objects: string[];
  description: string;
}

interface Producer {
  Id_Users: number;
  description: string;
  Id_Producers: number;
}

const users: Ref<User[]> = ref([]);
const defaultImage = "https://via.placeholder.com/150";
const router = useRouter();

const fetchProducers = async (): Promise<void> => {
  try {
    const response = await axios.get("http://127.0.0.1:8000/producers/");
    const producers = response.data;
    const activeUsers: User[] = [];

    for (const producer of producers) {
      const userResponse = await axios.get(
        `http://127.0.0.1:8000/users/${producer.Id_Users}`
      );

      const user = userResponse.data;

      if (user.active) {
        const userPhoto = await fetchUserPhoto(user.Id_Users);
        activeUsers.push({
          id: user.Id_Users,
          firstName: user.F_Name,
          lastName: user.Name,
          photo: userPhoto,
          description: producer.description || "Description non disponible",
          objects: [],
        });
      }
    }

    users.value = activeUsers;
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

const openFarmer = (id: number): void => {
  router.push(`/AgriculteurDetail/${id}`);
};

onMounted((): void => {
  fetchProducers();
});
</script>
<style scoped>
.list-container {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 10px;
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
}

.cursor-pointer {
  cursor: pointer;
}

.user-photo {
  width: 60px;
  height: 60px;
  object-fit: contain;
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
