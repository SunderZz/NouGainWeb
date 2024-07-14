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
                <strong>Montant de la TVA :</strong>
                {{ orderInfo.tvaAmount.toFixed(2) }} €
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
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
} from "mdb-vue-ui-kit";

const route = useRoute();

const orderInfo = ref({
  orderNumber: "",
  expectedDate: "",
  amountHT: 0,
  tvaAmount: 0,
  totalAmount: 0,
  deliveryAddress: "",
});

const products = ref([]);

const fetchOrderDetails = async () => {
  const orderId = localStorage.getItem("orderId");
  const preferenceShip = route.query.preferenceShip;

  if (!orderId) {
    console.error("OrderId non trouvé dans le localStorage");
    return;
  }

  orderInfo.value.orderNumber = orderId;
  orderInfo.value.deliveryAddress = preferenceShip;

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
      const product = productResponse.data;
      product.quantity = item.qte;
      product.priceHT = product.Price_ht;
      product.image = product.image_url || "https://via.placeholder.com/100"; // assuming `image_url` exists in your product data
      orderInfo.value.amountHT += product.priceHT * product.quantity;
      return product;
    });

    products.value = await Promise.all(productRequests);

    // Calculate TVA and total amount
    orderInfo.value.tvaAmount = orderInfo.value.amountHT * 0.2; // Assuming 20% TVA
    orderInfo.value.totalAmount =
      orderInfo.value.amountHT + orderInfo.value.tvaAmount;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des produits du panier:",
      error
    );
  }
};

onMounted(() => {
  fetchOrderDetails();
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
  object-fit: cover;
}
</style>
