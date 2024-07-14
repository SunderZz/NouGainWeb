<template>
  <MDBContainer fluid class="mt-4">
    <MDBRow class="mb-4">
      <MDBCol md="12">
        <MDBDropdown v-model="dropdown2">
          <MDBDropdownToggle
            tag="a"
            class="btn btn-primary"
            @click="dropdown2 = !dropdown2"
            id="dropdownMenuLink"
          >
            Menu
          </MDBDropdownToggle>
          <MDBDropdownMenu aria-labelledby="dropdownMenuLink">
            <MDBDropdownItem tag="router-link" to="/AdminProducts">Produits</MDBDropdownItem>
            <MDBDropdownItem tag="router-link" to="/AdminProducteurs">Producteurs</MDBDropdownItem>
            <MDBDropdownItem tag="router-link" to="/AdminRecipes">Recettes</MDBDropdownItem>
          </MDBDropdownMenu>
        </MDBDropdown>
      </MDBCol>
    </MDBRow>

    <MDBRow class="mb-4">
      <MDBCol md="6">
        <MDBBtn
          :class="[
            'section-btn',
            { active: selectedSection.includes('producers') },
          ]"
          @click="toggleSection('producers')"
          block
        >
          Voir les producteurs
        </MDBBtn>
      </MDBCol>
      <MDBCol md="6">
        <MDBBtn
          :class="[
            'section-btn',
            { active: selectedSection.includes('products') },
          ]"
          @click="toggleSection('products')"
          block
        >
          Voir les produits
        </MDBBtn>
      </MDBCol>
    </MDBRow>

    <div
      v-if="
        selectedSection.includes('producers') || selectedSection.length === 0
      "
    >
      <h3>Producteurs</h3>
      <div class="list-container">
        <MDBRow>
          <MDBCol
            v-for="(producer, index) in producers"
            :key="index"
            md="12"
            class="mb-3"
          >
            <MDBCard class="position-relative">
              <MDBCardBody class="d-flex align-items-center">
                <a
                  :href="`#/AdminConfigProducteurs/${producer.id}`"
                  class="me-3"
                >
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
                    class="text-success me-2"
                    @click="approveProducer(producer.Id_Users)"
                    style="cursor: pointer"
                  />
                  <MDBIcon
                    v-if="producer.active"
                    fas
                    icon="times"
                    class="text-danger"
                    @click="rejectProducer(producer.Id_Users)"
                    style="cursor: pointer"
                  />
                </div>
              </MDBCardBody>
              <span
                :class="{
                  'bg-success': producer.active,
                  'bg-danger': !producer.active,
                }"
                class="status-indicator position-absolute top-0 end-0 m-2"
              ></span>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </div>
    </div>

    <div
      v-if="
        selectedSection.includes('products') || selectedSection.length === 0
      "
    >
      <h3>Produits</h3>
      <div class="list-container">
        <MDBRow>
          <MDBCol
            v-for="(product, index) in products"
            :key="index"
            md="12"
            class="mb-3"
          >
            <MDBCard class="position-relative">
              <MDBCardBody class="d-flex align-items-center">
                <a :href="`#/AdminConfigProducts/${product.id}`" class="me-3">
                  <img
                    :src="product.photo"
                    alt="Product photo"
                    class="product-img"
                  />
                </a>
                <div class="flex-grow-1">
                  <h5>{{ product.name }}</h5>
                  <p>{{ product.description }}</p>
                </div>
                <div>
                  <MDBIcon
                    v-if="!product.active"
                    fas
                    icon="check"
                    class="text-success me-2"
                    @click="approveProduct(product.id)"
                    style="cursor: pointer"
                  />
                  <MDBIcon
                    v-if="product.active"
                    fas
                    icon="times"
                    class="text-danger"
                    @click="rejectProduct(product.id)"
                    style="cursor: pointer"
                  />
                </div>
              </MDBCardBody>
              <span
                :class="{
                  'bg-success': product.active,
                  'bg-danger': !product.active,
                }"
                class="status-indicator position-absolute top-0 end-0 m-2"
              ></span>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </div>
    </div>
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
  MDBBtn,
  MDBIcon,
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
} from "mdb-vue-ui-kit";
import axios from "axios";

interface Producer {
  id: number;
  Id_Users: number;
  photo: string;
  active: boolean;
  firstName: string;
  lastName: string;
  description: string;
}

interface Product {
  id: number;
  photo: string;
  name: string;
  description: string;
  active: boolean;
}

const producers = ref<Producer[]>([]);
const products = ref<Product[]>([]);
const selectedSection = ref<string[]>([]);
const dropdown2 = ref(false);
const adminId = ref<number | null>(null);

const fetchProducers = async () => {
  try {
    const response = await axios.get("http://127.0.0.1:8000/producers/");
    const producersData = response.data;

    const producerDetailsPromises = producersData.map(async (producer: any) => {
      const producerResponse = await axios.get(
        `http://127.0.0.1:8000/users/${producer.Id_Users}`
      );
      const producerDetails = producerResponse.data;

      return {
        id: producer.Id_Producers,
        Id_Users: producer.Id_Users,
        photo: producer.Photo || "https://via.placeholder.com/100",
        active: producerDetails.active,
        firstName: producerDetails.F_Name,
        lastName: producerDetails.Name,
        description: producer.description,
      };
    });

    producers.value = await Promise.all(producerDetailsPromises);
  } catch (error) {
  }
};

const fetchProducts = async () => {
  try {
    const response = await axios.get("http://127.0.0.1:8000/products/");
    products.value = response.data.map((product: any) => ({
      id: product.Id_Product,
      photo: product.imageUrl || "https://via.placeholder.com/100",
      name: product.Name,
      description: product.Description,
      active: product.Active,
    }));
  } catch (error) {
  }
};

const fetchAdminId = async () => {
  const token = localStorage.getItem("authToken");
  if (!token) return;

  try {
    const userResponse = await axios.get(
      `http://127.0.0.1:8000/users_by_token?token=${token}`
    );
    const userId = userResponse.data.Id_Users;

    const adminResponse = await axios.get(
      `http://127.0.0.1:8000/admin/${userId}`
    );
    adminId.value = adminResponse.data.Id_Admin;
  } catch (error) {
  }
};

const toggleSection = (section: string) => {
  const index = selectedSection.value.indexOf(section);
  if (index > -1) {
    selectedSection.value.splice(index, 1);
  } else {
    selectedSection.value.push(section);
  }
};

const approveProducer = async (userId: number) => {
  if (adminId.value === null) return;
  
  try {
    await axios.put(
      "http://127.0.0.1:8000/admin/producers/active_state",
      null,
      {
        params: {
          id_producers: userId,
          admin_id: adminId.value,
          active: true,
        },
      }
    );
    fetchProducers();
  } catch (error) {
  }
};

const rejectProducer = async (userId: number) => {
  if (adminId.value === null) return;

  try {
    await axios.put(
      "http://127.0.0.1:8000/admin/producers/active_state",
      null,
      {
        params: {
          id_producers: userId,
          admin_id: adminId.value,
          active: false,
        },
      }
    );
    fetchProducers();
  } catch (error) {
  }
};

const approveProduct = async (productId: number) => {
  if (adminId.value === null) return;

  try {
    await axios.put("http://127.0.0.1:8000/admin/products/active", null, {
      params: {
        product_id: productId,
        admin_id: adminId.value,
        active: true,
      },
    });
    fetchProducts();
  } catch (error) {
  }
};

const rejectProduct = async (productId: number) => {
  if (adminId.value === null) return;

  try {
    await axios.put("http://127.0.0.1:8000/admin/products/active", null, {
      params: {
        product_id: productId,
        admin_id: adminId.value,
        active: false,
      },
    });
    fetchProducts();
  } catch (error) {
  }
};

onMounted(() => {
  fetchProducers();
  fetchProducts();
  fetchAdminId();
});
</script>

<style scoped>
.producer-img,
.product-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
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

.section-btn.active {
  background-color: #007bff;
  color: #fff;
}

.section-btn {
  background-color: #e9ecef;
  color: #495057;
}

.status-indicator {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
</style>
