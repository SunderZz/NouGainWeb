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
            <MDBDropdownItem tag="router-link" to="/AdminHome">Produits</MDBDropdownItem>
            <MDBDropdownItem tag="router-link" to="/AdminProducteurs">Producteurs</MDBDropdownItem>
            <MDBDropdownItem tag="router-link" to="/AdminRecipes">Recettes</MDBDropdownItem>
          </MDBDropdownMenu>
        </MDBDropdown>
      </MDBCol>
    </MDBRow>

    <h3>Produits</h3>
    <div class="list-container">
      <MDBRow>
        <MDBCol
          v-for="(product) in products"
          :key="product.id"
          md="12"
          class="mb-3"
        >
          <MDBCard class="product-card">
            <div
              class="status-indicator"
              :class="{ active: product.active, inactive: !product.active }"
            ></div>
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
                  class="text-success me-2 cursor-pointer"
                  @click="approveProduct(product.id)"
                />
                <MDBIcon
                  v-if="product.active"
                  fas
                  icon="times"
                  class="text-danger cursor-pointer"
                  @click="rejectProduct(product.id)"
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

interface Product {
  id: number;
  photo: string;
  name: string;
  description: string;
  active: boolean;
}

const products = ref<Product[]>([]);
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
  } catch (error) {
  }
};

const fetchProducts = async (): Promise<void> => {
  try {
    const response = await axios.get("http://127.0.0.1:8000/products/");
    products.value = response.data.map((product: any) => ({
      id: product.Id_Product,
      photo: product.imageUrl || "https://via.placeholder.com/100",
      name: product.Name,
      description: product.Description,
      active: product.active,
    }));
  } catch (error) {
  }
};

const approveProduct = async (id: number): Promise<void> => {
  if (adminId.value === null) {
    return;
  }
  try {
    await axios.put("http://127.0.0.1:8000/admin/products/active", null, {
      params: {
        product_id: id,
        admin_id: adminId.value,
        active: true,
      },
    });
    const product = products.value.find((p) => p.id === id);
    if (product) {
      product.active = true;
    }
  } catch (error) {
  }
};

const rejectProduct = async (id: number): Promise<void> => {
  if (adminId.value === null) {
    return;
  }
  try {
    await axios.put("http://127.0.0.1:8000/admin/products/active", null, {
      params: {
        product_id: id,
        admin_id: adminId.value,
        active: false,
      },
    });
    const product = products.value.find((p) => p.id === id);
    if (product) {
      product.active = false;
    }
  } catch (error) {
  }
};

onMounted((): void => {
  fetchAdminId();
  fetchProducts();
});
</script>

<style scoped>
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

.product-card {
  position: relative;
}
</style>
