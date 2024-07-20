<template>
  <MDBContainer fluid class="mt-4">
    <MDBRow class="justify-content-center">
      <MDBCol md="8">
        <h2 class="text-center mb-4">Votre commande a été validée</h2>

        <MDBCard class="mb-4">
          <MDBCardBody>
            <h4>Informations de commande</h4>
            <ul class="order-info-list">
              <li>
                <strong>Numéro de commande :</strong>
                {{ orderInfo.orderNumber }}
              </li>
              <li>
                <strong>Date prévue :</strong> {{ orderInfo.expectedDate }}
              </li>
              <li>
                <strong>Montant de la commande HT :</strong>
                {{ orderInfo.amountHT.toFixed(2) }} €
              </li>
              <li>
                <strong>Montant total de la commande :</strong>
                {{ orderInfo.totalAmount.toFixed(2) }} €
              </li>
              <li>
                <strong>Adresse de livraison :</strong>
                {{ orderInfo.deliveryAddress }}
              </li>
            </ul>
          </MDBCardBody>
        </MDBCard>

        <MDBCard>
          <MDBCardBody>
            <h4>Produits commandés</h4>
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
                <p>Quantité : {{ product.quantity }}</p>
                <p>
                  Prix : {{ (product.priceHT * product.quantity).toFixed(2) }} €
                </p>
              </div>
            </div>
          </MDBCardBody>
        </MDBCard>
      </MDBCol>
    </MDBRow>
  </MDBContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import axios from "axios";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
} from "mdb-vue-ui-kit";

interface OrderInfo {
  orderNumber: string;
  expectedDate: string;
  amountHT: number;
  totalAmount: number;
  deliveryAddress: string;
}

interface Product {
  Id_Product: number;
  Name: string;
  Description: string;
  Price_ht: number;
  image: string;
  quantity: number;
}

const route = useRoute();
const store = useStore();

const orderInfo = ref<OrderInfo>({
  orderNumber: "",
  expectedDate: "",
  amountHT: 0,
  totalAmount: 0,
  deliveryAddress: "",
});

const products = ref<Product[]>([]);

const fetchOrderDetails = async (): Promise<void> => {
  const orderId = localStorage.getItem("orderId");

  if (!orderId) {
    return;
  }

  try {
    const orderResponse = await axios.get(
      `http://127.0.0.1:8000/orders_by_id/?id_orders=${orderId}`
    );
    const orderData = orderResponse.data;
    orderInfo.value.orderNumber = orderId;
    orderInfo.value.expectedDate = orderData.Ship_Date;
    orderInfo.value.deliveryAddress = orderData.Preference_Ship;

    const response = await axios.get(`http://127.0.0.1:8000/linede/${orderId}`);
    let lineItems = response.data;

    if (!Array.isArray(lineItems)) {
      lineItems = [lineItems];
    }

    const productRequests = lineItems.map(async (item: any) => {
      const productResponse = await axios.get(
        `http://127.0.0.1:8000/products_by_id/?id=${item.Id_Product}`
      );
      const product: Product = productResponse.data;
      product.quantity = item.qte;
      product.priceHT = product.Price_ht;

      let imageUrl = "https://via.placeholder.com/100";
      try {
        const imageResponse = await axios.get(
          `http://127.0.0.1:8000/produit_image?produit_image_id=${product.Id_Product}&field_name=Id_Product`,
          { responseType: "blob" }
        );
        imageUrl = URL.createObjectURL(imageResponse.data);
      } catch (error) {
      }

      product.image = imageUrl;
      orderInfo.value.amountHT += product.priceHT * product.quantity;
      return product;
    });

    products.value = await Promise.all(productRequests);

    orderInfo.value.totalAmount = orderInfo.value.amountHT;
  } catch (error) {}
};

const cleanUpTokens = (): void => {
  const authToken = localStorage.getItem("authToken");
  const orderId = localStorage.getItem("orderId");
  localStorage.clear();
  if (authToken) {
    localStorage.setItem("authToken", authToken);
  }
  if (orderId) {
    localStorage.setItem("orderId", orderId);
  }

  store.commit("RESET_CART_ITEM_COUNT");
};

onMounted(() => {
  cleanUpTokens();
  fetchOrderDetails();
});

onBeforeUnmount(() => {
  localStorage.removeItem("orderId");
});
</script>

<style scoped>
.order-info-list {
  list-style-type: none;
  padding: 0;
}

.order-info-list li {
  margin-bottom: 10px;
}

.product-item {
  border-bottom: 1px solid #eee;
  padding: 10px 0;
}

.product-img {
  width: 100px;
  height: 100px;
  object-fit: contain;
}
</style>
