<template>
  <MDBContainer fluid class="mt-4">
    <MDBRow class="mb-4">
      <MDBCol md="6">
        <div class="farmer-profile">
          <img :src="farmer.photo" alt="Farmer photo" class="farmer-img mb-3" />
          <h5>{{ farmer.firstName }} {{ farmer.lastName }}</h5>
          <p>Date de naissance : {{ farmer.birthDate }}</p>
          <p>Email : {{ farmer.email }}</p>
          <p>Code Postal : {{ farmer.postalCode }}</p>
          <p>Ville : {{ farmer.city }}</p>
          <p>Adresse : {{ farmer.address }}</p>
          <p>Téléphone : {{ farmer.phone }}</p>
        </div>
      </MDBCol>

      <MDBCol md="6">
        <div class="document-section mb-3">
          <h5>Document Agriculteur</h5>
          <a :href="encodeURI(farmer.documentUrl)" target="_blank">Ouvrir le document</a>
        </div>
        <div class="products-section">
          <h5>Produits en vente</h5>
          <div class="list-container">
            <MDBRow v-for="(product, index) in farmer.products" :key="index" class="mb-2">
              <MDBCol md="4">
                <a :href="`#/AdminConfigProducts/${product.id}`">
                  <img :src="product.photo" alt="Product photo" class="product-img" />
                </a>
              </MDBCol>
              <MDBCol md="8">
                <h6>{{ product.name }}</h6>
                <p>{{ product.description }}</p>
              </MDBCol>
            </MDBRow>
          </div>
        </div>
      </MDBCol>
    </MDBRow>

    <MDBRow class="mt-4">
      <MDBCol md="4" class="text-center mb-3">
        <MDBBtn :color="farmer.active ? 'primary' : 'secondary'" @click="toggleActive">
          {{ farmer.active ? "Actif" : "Inactif" }}
        </MDBBtn>
      </MDBCol>
    </MDBRow>
  </MDBContainer>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import { MDBContainer, MDBRow, MDBCol, MDBBtn } from "mdb-vue-ui-kit";
import { useRoute } from "vue-router";

interface Product {
  id: number;
  photo: string;
  name: string;
  description: string;
}

interface Farmer {
  photo: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  postalCode: string;
  city: string;
  deliveryMethod: string;
  documentUrl: string;
  products: Product[];
  active: boolean;
  address: string;
  phone: string;
}

interface AddressResponse {
  Id_Users: number;
  Id_Users_adresses: number;
}

const route = useRoute();
const farmer = ref<Farmer>({
  photo: "",
  firstName: "",
  lastName: "",
  birthDate: "",
  email: "",
  postalCode: "",
  city: "",
  deliveryMethod: "",
  documentUrl: "",
  products: [],
  active: false,
  address: "",
  phone: "",
});
const adminId = ref<number | null>(null);
const defaultImage = "https://via.placeholder.com/150";

const fetchAdminId = async (): Promise<void> => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Token not found");
    }
    const userResponse = await axios.get(
      `http://127.0.0.1:8000/users_by_token?token=${token}`
    );
    const userId = userResponse.data.Id_Users;
    const adminResponse = await axios.get(
      `http://127.0.0.1:8000/admin/${userId}`
    );
    adminId.value = adminResponse.data.Id_Admin;
  } catch (error) {}
};

const fetchAddressId = async (
  userId: number
): Promise<AddressResponse | null> => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/adresses_types_by_user/${userId}`
    );
    return response.data;
  } catch (error) {
    return null;
  }
};

const fetchPostalCode = async (addressId: number): Promise<number | null> => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/located/${addressId}`
    );

    return response.data.Id_Code_Postal;
  } catch (error) {
    return null;
  }
};

const fetchCity = async (postalCode: number): Promise<string | null> => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/code_postal_city/?code_id=${postalCode}`
    );
    return response.data[0].Name;
  } catch (error) {
    return null;
  }
};

const fetchAddressDetails = async (
  addressId: number
): Promise<{ Adresse: string; Phone: string } | null> => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/users/${addressId}/addresses`
    );
    return response.data[0];
  } catch (error) {
    return null;
  }
};

const fetchFarmer = async (): Promise<void> => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/producers_user?producers=${route.params.id}`
    );
    const producer = response.data;

    const userResponse = await axios.get(
      `http://127.0.0.1:8000/users/${producer.Id_Users}`
    );
    const userDetails = userResponse.data;

    const addressId = await fetchAddressId(userDetails.Id_Users);

    let addressDetails = null;
    let postalCode = null;
    let city = null;
    if (addressId) {
      postalCode = await fetchPostalCode(addressId.Id_Users_adresses);

      if (postalCode !== null) {
        city = await fetchCity(postalCode);
      }
      addressDetails = await fetchAddressDetails(addressId.Id_Users);
    }

    const giveResponse = await axios.get(
      "http://127.0.0.1:8000/give_producers",
      {
        params: { give_id: route.params.id },
      }
    );

    const productIds = giveResponse.data.map(
      (product: any) => product.Id_Product
    );
    const productDetails: Product[] = [];
    for (const productId of productIds) {
      const productResponse = await axios.get(
        "http://127.0.0.1:8000/products_by_id/",
        {
          params: { id: productId },
        }
      );
      productDetails.push({
        id: productResponse.data.Id_Product,
        photo: await fetchProductImage(productId),
        name: productResponse.data.Name,
        description: productResponse.data.Description,
      });
    }

    farmer.value = {
      photo: await fetchUserPhoto(producer.Id_Users),
      firstName: userDetails.F_Name,
      lastName: userDetails.Name,
      birthDate: userDetails.BirthDate,
      email: userDetails.Mail,
      postalCode: postalCode?.toString() || "",
      city: city || "",
      deliveryMethod: producer.Method,
      documentUrl: producer.Document,
      products: productDetails,
      active: userDetails.active,
      address: addressDetails ? addressDetails.Adresse : "",
      phone: addressDetails ? addressDetails.Phone : "",
    };
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

const toggleActive = async (): Promise<void> => {
  if (adminId.value === null) {
    return;
  }
  try {
    await axios.put(
      "http://127.0.0.1:8000/admin/producers/active_state",
      null,
      {
        params: {
          id_producers: route.params.id,
          admin_id: adminId.value,
          active: !farmer.value.active,
        },
      }
    );

    farmer.value.active = !farmer.value.active;
  } catch (error) {}
};

onMounted(() => {
  fetchAdminId();
  fetchFarmer();
});
</script>
<style scoped>
.farmer-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.farmer-img {
  width: 150px;
  height: 150px;
  object-fit: contain;
  border-radius: 5px;
}

.document-section a {
  color: #007bff;
  text-decoration: none;
}

.products-section .list-container {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 10px;
  max-height: 310px;
  overflow-y: auto;
  overflow-x: hidden;
}

.product-img {
  width: 100px;
  height: 100px;
  object-fit: contain;
  border-radius: 5px;
}
</style>
