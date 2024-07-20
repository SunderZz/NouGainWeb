<template>
  <MDBContainer fluid class="mt-4">
    <MDBRow class="mb-4">
      <MDBCol md="4">
        <img
          :src="product.photo"
          alt="Product photo"
          class="product-img mb-3"
        />
      </MDBCol>
      <MDBCol md="8">
        <h3>{{ product.name }}</h3>
        <p>
          Producteur :
          <router-link :to="`/AdminConfigProducteurs/${product.producerId}`">{{
            product.producer
          }}</router-link>
        </p>
        <p>Prix : {{ product.price }} €</p>
      </MDBCol>
    </MDBRow>

    <MDBRow class="mb-4">
      <MDBCol md="12">
        <h4>Description</h4>
        <p>{{ product.description }}</p>
      </MDBCol>
    </MDBRow>

    <MDBRow class="mt-4">
      <MDBCol md="4" class="text-center mb-3">
        <MDBBtn
          :key="product.active"
          :color="product.active ? 'primary' : 'secondary'"
          @click="toggleActive"
        >
          {{ product.active ? "Actif" : "Inactif" }}
        </MDBBtn>
      </MDBCol>
    </MDBRow>
  </MDBContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { MDBContainer, MDBRow, MDBCol, MDBBtn } from "mdb-vue-ui-kit";

interface Product {
  photo: string;
  name: string;
  producer: string;
  producerId: number | null;
  price: number;
  description: string;
  active: boolean;
}

const route = useRoute();
const product = ref<Product>({
  photo: "",
  name: "",
  producer: "",
  producerId: null,
  price: 0,
  description: "",
  active: false,
});
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

const fetchProducerName = async (
  productId: number
): Promise<{ name: string; id: number }> => {
  try {
    const giveResponse = await axios.get(
      `http://127.0.0.1:8000/give/${productId}`
    );
    const producerId: number = giveResponse.data.Id_Producers;
    const userResponse = await axios.get(
      `http://127.0.0.1:8000/user_by_producer?producer_id=${producerId}`
    );
    const producerName: string = `${userResponse.data.F_Name} ${userResponse.data.Name}`;
    return { name: producerName, id: producerId };
  } catch (error) {
    return { name: "", id: 0 };
  }
};

const fetchProduct = async (): Promise<void> => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/products_by_id/?id=${route.params.id}`
    );
    const data = response.data;
    const producer = await fetchProducerName(route.params.id);
    const imageResponse = await axios.get(
      `http://127.0.0.1:8000/produit_image?produit_image_id=${route.params.id}&field_name=Id_Product`,
      { responseType: "blob" }
    );
    const imageUrl = URL.createObjectURL(imageResponse.data);
    product.value = {
      photo: imageUrl || "https://via.placeholder.com/150",
      name: data.Name,
      producer: producer.name,
      producerId: producer.id,
      price: data.Price_ht,
      description: data.Description,
      active: data.active,
    };
  } catch (error) {}
};

const toggleActive = async (): Promise<void> => {
  if (adminId.value === null) {
    return;
  }

  try {
    const newActiveStatus = !product.value.active;
    await axios.put("http://127.0.0.1:8000/admin/products/active", null, {
      params: {
        product_id: route.params.id,
        admin_id: adminId.value,
        active: newActiveStatus,
      },
    });
    product.value.active = newActiveStatus;
  } catch (error) {}
};

onMounted(() => {
  fetchAdminId();
  fetchProduct();
});
</script>

<style scoped>
.product-img {
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 5px;
  object-fit: contain;
}
</style>
