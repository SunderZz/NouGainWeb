<template>
  <MDBContainer fluid class="mt-4">
    <MDBRow>
      <MDBCol md="8" class="mb-4">
        <h3>Votre panier</h3>
        <div class="product-list">
          <div
            v-for="(product, index) in products"
            :key="index"
            class="product-item d-flex mb-3"
          >
            <img
              :src="product.image"
              alt="Product image"
              class="product-img me-3"
            />
            <div class="flex-grow-1">
              <h5>{{ product.Name }}</h5>
              <p>{{ product.Description }}</p>
            </div>
            <div class="d-flex flex-column align-items-end">
              {{ (product.Price_ht * product.quantity).toFixed(2) }} €
              <span class="mx-2">Quantité: {{ product.quantity }}</span>
            </div>
          </div>
        </div>
      </MDBCol>
      <MDBCol md="4">
        <h3>Informations de paiement</h3>
        <MDBInput
          v-model="paymentInfo.cardNumber"
          label="Numéro de carte"
          type="text"
          class="mb-3"
        />
        <MDBInput
          v-model="paymentInfo.expiryDate"
          label="Date d'expiration"
          type="text"
          class="mb-3"
        />
        <MDBInput
          v-model="paymentInfo.cvc"
          label="CVC"
          type="text"
          class="mb-3"
        />
        <MDBBtn color="success" @click="processPayment"
          >Procéder au paiement</MDBBtn
        >
      </MDBCol>
    </MDBRow>
  </MDBContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { MDBContainer, MDBRow, MDBCol, MDBInput, MDBBtn } from "mdb-vue-ui-kit";

const route = useRoute();
const router = useRouter();

const products = ref([]);

const paymentInfo = ref({
  cardNumber: "",
  expiryDate: "",
  cvc: "",
});

const fetchCartProducts = async () => {
  const orderId = route.query.orderId;
  if (!orderId) {
    console.error("OrderId non trouvé dans les paramètres de la route");
    return;
  }

  try {
    const response = await axios.get(`http://127.0.0.1:8000/linede/${orderId}`);
    let lineItems = response.data;

    if (!Array.isArray(lineItems)) {
      lineItems = [lineItems];
    }

    const productRequests = lineItems.map(async (item) => {
      const productResponse = await axios.get(
        `http://127.0.0.1:8000/products_by_id/?id=${item.Id_Product}`
      );
      return { ...productResponse.data, quantity: item.qte };
    });

    products.value = await Promise.all(productRequests);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des produits du panier:",
      error
    );
  }
};

const processPayment = async () => {
  const orderId = route.query.orderId;
  const token = localStorage.getItem("authToken");

  if (!orderId || !token) {
    console.error("OrderId ou token non trouvé");
    return;
  }

  try {
    const userResponse = await axios.get(
      "http://127.0.0.1:8000/users_by_token",
      {
        params: { token },
      }
    );

    const customerResponse = await axios.get(
      `http://127.0.0.1:8000/customers_by_id?customers=${userResponse.data.Id_Users}`
    );
    const customerId = customerResponse.data.Id_Casual;

    await axios.put(`http://127.0.0.1:8000/valid_order`, null, {
      params: {
        order: orderId,
        id_customers: customerId,
      },
    });

    router.push({
      path: "/ValidatePayement",
      query: { orderId },
    });
  } catch (error) {
    console.error("Erreur lors de la validation du paiement:", error);
  }
};

onMounted(() => {
  fetchCartProducts();
});
</script>

<style scoped>
.product-list {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 10px;
}

.product-item {
  border-bottom: 1px solid #eee;
  padding: 10px 0;
}

.product-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.text-center {
  text-align: center;
}
</style>
