<template>
  <MDBContainer fluid class="mt-4">
    <MDBRow class="mb-4">
      <MDBCol md="12">
        <MDBDropdown v-model="dropdown">
          <MDBDropdownToggle
            tag="a"
            class="btn btn-primary"
            @click="dropdown = !dropdown"
            id="dropdownMenuLink"
          >
            Menu
          </MDBDropdownToggle>
          <MDBDropdownMenu aria-labelledby="dropdownMenuLink">
            <MDBDropdownItem tag="router-link" to="/AdminHome"
              >Home</MDBDropdownItem
            >
            <MDBDropdownItem tag="router-link" to="/AdminProducts"
              >Produits</MDBDropdownItem
            >
            <MDBDropdownItem tag="router-link" to="/AdminRecipes"
              >Recettes</MDBDropdownItem
            >
          </MDBDropdownMenu>
        </MDBDropdown>
      </MDBCol>
    </MDBRow>

    <h3>Producteurs</h3>
    <div class="list-container">
      <MDBRow>
        <MDBCol
          v-for="(producer) in producers"
          :key="producer.id"
          md="12"
          class="mb-3"
        >
          <MDBCard class="producer-card">
            <div
              class="status-indicator"
              :class="{ active: producer.active, inactive: !producer.active }"
            ></div>
            <MDBCardBody class="d-flex align-items-center">
              <a :href="`#/AdminConfigProducteurs/${producer.id}`" class="me-3">
                <img
                  :src="producer.photo"
                  alt="Producer photo"
                  class="producer-img"
                />
              </a>
              <div class="flex-grow-1">
                <h5>{{ producer.firstName }} {{ producer.lastName }}</h5>
                <p>{{ producer.description }}</p>
              </div>
              <div>
                <MDBIcon
                  v-if="!producer.active"
                  fas
                  icon="check"
                  class="text-success me-2 cursor-pointer"
                  @click="approveProducer(producer.id)"
                />
                <MDBIcon
                  v-if="producer.active"
                  fas
                  icon="times"
                  class="text-danger cursor-pointer"
                  @click="rejectProducer(producer.id)"
                />
              </div>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </div>
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
  MDBCardBody,
  MDBIcon,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
} from "mdb-vue-ui-kit";

interface Producer {
  id: number;
  photo: string;
  firstName: string;
  lastName: string;
  description: string;
  active: boolean;
}

const producers = ref<Producer[]>([]);
const dropdown = ref<boolean>(false);
const adminId = ref<number | null>(null);

const fetchAdminId = async (): Promise<void> => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Token not found");
    }
    const userResponse = await axios.get(
      `http://127.0.0.1:8000/users_by_token?token=${token}`
    );
    const userId: number = userResponse.data.Id_Users;
    const adminResponse = await axios.get(
      `http://127.0.0.1:8000/admin/${userId}`
    );
    adminId.value = adminResponse.data.Id_Admin;
  } catch (error) {}
};

const fetchProducers = async (): Promise<void> => {
  try {
    const response = await axios.get("http://127.0.0.1:8000/producers/");
    const producersData = response.data;

    const producerDetailsPromises = producersData.map(async (producer: any) => {
      const producerResponse = await axios.get(
        `http://127.0.0.1:8000/users/${producer.Id_Users}`
      );
      const producerDetails = producerResponse.data;
      const photoUrl = await fetchProducerPhoto(producer.Id_Users);

      return {
        id: producer.Id_Users,
        photo: photoUrl,
        active: producerDetails.active,
        firstName: producerDetails.F_Name,
        lastName: producerDetails.Name,
        description: producer.description,
      };
    });

    producers.value = await Promise.all(producerDetailsPromises);
  } catch (error) {}
};

const fetchProducerPhoto = async (userId: number): Promise<string> => {
  const defaultImage = "https://via.placeholder.com/100";
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

const approveProducer = async (id: number): Promise<void> => {
  if (adminId.value === null) {
    return;
  }
  try {
    await axios.put(
      "http://127.0.0.1:8000/admin/producers/active_state",
      null,
      {
        params: {
          id_producers: id,
          admin_id: adminId.value,
          active: true,
        },
      }
    );
    const producer = producers.value.find((p) => p.id === id);
    if (producer) {
      producer.active = true;
    }
  } catch (error) {}
};

const rejectProducer = async (id: number): Promise<void> => {
  if (adminId.value === null) {
    return;
  }
  try {
    await axios.put(
      "http://127.0.0.1:8000/admin/producers/active_state",
      null,
      {
        params: {
          id_producers: id,
          admin_id: adminId.value,
          active: false,
        },
      }
    );
    const producer = producers.value.find((p) => p.id === id);
    if (producer) {
      producer.active = false;
    }
  } catch (error) {}
};

onMounted((): void => {
  fetchAdminId();
  fetchProducers();
});
</script>

<style scoped>
.producer-img {
  width: 100px;
  height: 100px;
  object-fit: contain;
  border-radius: 5px;
}

.list-container {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 10px;
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  position: absolute;
  top: 10px;
  right: 10px;
}

.status-indicator.active {
  background-color: green;
}

.status-indicator.inactive {
  background-color: red;
}

.cursor-pointer {
  cursor: pointer;
}

.producer-card {
  position: relative;
}
</style>
