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

interface Product {
  Id_Product: number;
  Name: string;
  Description: string;
  Price_ht: number;
  image: string;
  quantity: number;
}

interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvc: string;
}

const route = useRoute();
const router = useRouter();

const products = ref<Product[]>([]);

const paymentInfo = ref<PaymentInfo>({
  cardNumber: "",
  expiryDate: "",
  cvc: "",
});

const fetchCartProducts = async (): Promise<void> => {
  const orderId = route.query.orderId as string;
  if (!orderId) {
    return;
  }

  try {
    const response = await axios.get(`http://127.0.0.1:8000/linede/${orderId}`);
    let lineItems = response.data;

    if (!Array.isArray(lineItems)) {
      lineItems = [lineItems];
    }

    const productRequests = lineItems.map(async (item: any) => {
      const productResponse = await axios.get(
        `http://127.0.0.1:8000/products_by_id/?id=${item.Id_Product}`
      );
      return { ...productResponse.data, quantity: item.qte };
    });

    products.value = await Promise.all(productRequests);
  } catch (error) {
  }
};

const processPayment = async (): Promise<void> => {
  const orderId = route.query.orderId as string;
  const token = localStorage.getItem("authToken");

  if (!orderId || !token) {
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
      `http://127.0.0.1:8000/user_by_id?customers=${userResponse.data.Id_Users}`
    );
    const customerId = customerResponse.data.Id_Casual;

    const orderResponse = await axios.get(
      `http://127.0.0.1:8000/orders_by_id/?id_orders=${orderId}`
    );
    const orderData = orderResponse.data;

    const today = new Date();
    const randomDays = Math.floor(Math.random() * 5) + 1;
    const shipDate = new Date(today);
    shipDate.setDate(today.getDate() + randomDays);

    orderData.Ship_Date = shipDate.toISOString().split("T")[0];

    await axios.put(`http://127.0.0.1:8000/orders/${orderId}`, orderData);

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
